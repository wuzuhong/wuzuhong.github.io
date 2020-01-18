# 【分布式配置中心—Apollo】架构设计及实现原理
## 总体设计
![总体设计](./images/apollo-overall-architecture.png)

上图简要描述了Apollo的总体设计，我们可以从下往上看：
* Config Service提供配置的读取、推送等功能，服务对象是Apollo客户端
* Admin Service提供配置的修改、发布等功能，服务对象是Apollo Portal（管理界面）
* Config Service和Admin Service都是多实例、无状态部署，所以需要将自己注册到Eureka中并保持心跳
* 在Eureka之上我们架了一层Meta Server用于封装Eureka的服务发现接口
* Client通过域名访问Meta Server获取Config Service服务列表（IP+Port），而后直接通过IP+Port访问服务，同时在Client侧会做load balance、错误重试
* Portal通过域名访问Meta Server获取Admin Service服务列表（IP+Port），而后直接通过IP+Port访问服务，同时在Portal侧会做load balance、错误重试
* 为了简化部署，我们实际上会把Config Service、Eureka和Meta Server三个逻辑角色部署在同一个JVM进程中

## 模块介绍

### Config Service
* 提供配置获取接口
* 提供配置更新推送接口（基于Http long polling）
  * 服务端使用Spring DeferredResult实现异步化，从而大大增加长连接数量
  * 目前使用的tomcat embed默认配置是最多10000个连接（可以调整），使用了4C8G的虚拟机实测可以支撑10000个连接，所以满足需求（一个应用实例只会发起一个长连接）。
* 接口服务对象为Apollo客户端

### Admin Service
* 提供配置管理接口
* 提供配置修改、发布等接口
* 接口服务对象为Portal

### Meta Server
* Portal通过域名访问Meta Server获取Admin Service服务列表（IP+Port）
* Client通过域名访问Meta Server获取Config Service服务列表（IP+Port）
* Meta Server从Eureka获取Config Service和Admin Service的服务信息，相当于是一个Eureka Client
* 增设一个Meta Server的角色主要是为了封装服务发现的细节，对Portal和Client而言，永远通过一个Http接口获取Admin Service和Config Service的服务信息，而不需要关心背后实际的服务注册和发现组件
* Meta Server只是一个逻辑角色，在部署时和Config Service是在一个JVM进程中的，所以IP、端口和Config Service一致

### Eureka
* 基于Eureka和Spring Cloud Netflix提供服务注册和发现
* Config Service和Admin Service会向Eureka注册服务，并保持心跳
* 为了简单起见，目前Eureka在部署时和Config Service是在一个JVM进程中的（通过Spring Cloud Netflix）

### Portal
* 提供Web界面供用户管理配置
* 通过Meta Server获取Admin Service服务列表（IP+Port），通过IP+Port访问服务
* 在Portal侧做load balance、错误重试

### Client
* Apollo提供的客户端程序，为应用提供配置获取、实时更新等功能
* 通过Meta Server获取Config Service服务列表（IP+Port），通过IP+Port访问服务
* 在Client侧做load balance、错误重试

## 服务端设计
![服务端设计](./images/apollo-release-message-notification-design.png)

上图简要描述了配置发布的大致过程：
1. 用户在Portal操作配置发布
2. Portal调用Admin Service的接口操作发布
3. Admin Service发布配置后，发送ReleaseMessage给各个Config Service
4. Config Service收到ReleaseMessage后，通知对应的客户端

### 发送ReleaseMessage的实现方式
从概念上来看，这是一个典型的消息使用场景，Admin Service作为producer发出消息，各个Config Service作为consumer消费消息。通过一个消息组件（Message Queue）就能很好的实现Admin Service和Config Service的解耦。

Apollo考虑到实际使用场景，以及为了尽可能减少外部依赖，没有采用外部的消息中间件，而是通过数据库实现了一个简单的消息队列。实现方式如下：
1. Admin Service在配置发布后会往ReleaseMessage表插入一条消息记录，消息内容就是配置发布的AppId+Cluster+Namespace
2. Config Service有一个线程会每秒扫描一次ReleaseMessage表，看看是否有新的消息记录
3. Config Service如果发现有新的消息记录，那么就会通知到所有的消息监听器（ReleaseMessageListener），如NotificationControllerV2
4. NotificationControllerV2得到配置发布的AppId+Cluster+Namespace后，会通知对应的客户端

示意图如下：

![发送ReleaseMessage的实现方式](./images/apollo-release-message-design.png)

### Config Service通知客户端的实现方式
上一节中简要描述了NotificationControllerV2是如何得知有配置发布的，那NotificationControllerV2在得知有配置发布后是如何通知到客户端的呢？

实现方式如下：
1. 客户端会发起一个Http请求到Config Service的notifications/v2接口，也就是NotificationControllerV2，参见RemoteConfigLongPollService
2. NotificationControllerV2不会立即返回结果，而是通过Spring DeferredResult把请求挂起
3. 如果在60秒内没有该客户端关心的配置发布，那么会返回Http状态码304给客户端
4. 如果有该客户端关心的配置发布，NotificationControllerV2会调用DeferredResult的setResult方法，传入有配置变化的namespace信息，同时该请求会立即返回。客户端从返回的结果中获取到配置变化的namespace后，会立即请求Config Service获取该namespace的最新配置

## 客户端设计
![客户端设计](./images/apollo-client-architecture.png)

上图简要描述了Apollo客户端的实现原理：
* 客户端和服务端保持了一个长连接，从而能第一时间获得配置更新的推送。（通过Http Long Polling实现）
* 客户端还会定时从Apollo配置中心服务端拉取应用的最新配置
  * 这是一个fallback机制，为了防止推送机制失效导致配置不更新
  * 客户端定时拉取会上报本地版本，所以一般情况下，对于定时拉取的操作，服务端都会返回304 - Not Modified
  * 定时频率默认为每5分钟拉取一次，客户端也可以通过在运行时指定System Property: apollo.refreshInterval来覆盖，单位为分钟
* 客户端从Apollo配置中心服务端获取到应用的最新配置后，会保存在内存中
* 客户端会把从服务端获取到的配置在本地文件系统缓存一份
  * 在遇到服务不可用，或网络不通的时候，依然能从本地恢复配置
* 应用程序可以从Apollo客户端获取最新的配置、订阅配置更新通知

### 配置更新推送实现
前面提到了Apollo客户端和服务端保持了一个长连接，从而能第一时间获得配置更新的推送。

长连接实际上我们是通过Http Long Polling实现的，具体而言：
* 客户端发起一个Http请求到服务端
* 服务端会保持住这个连接60秒，通过Spring DeferredResult实现
  * 如果在60秒内有客户端关心的配置变化，被保持住的客户端请求会立即返回，并告知客户端有配置变化的namespace信息，客户端会据此拉取对应namespace的最新配置
  * 如果在60秒内没有客户端关心的配置变化，那么会返回Http状态码304给客户端
* 客户端在收到服务端的响应后会判断状态码是否为200，如果是，则直接发请求获取最新配置，非长连接；如果不是，则会立即重新发起长连接，回到第一步

### 为什么有了长连接，还需要定时轮询？