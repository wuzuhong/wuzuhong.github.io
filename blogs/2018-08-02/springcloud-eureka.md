# 【微服务—springcloud】Eureka
## 概述
Eureka是Netflix的一个子模块，也是核心模块之一。Eureka是一个基于REST的服务，用于微服务架构中的服务注册与发现。
服务注册与发现对于微服务来说是非常重要的，有了服务发现与注册，只需要使用服务的标识符，就可以访问到服务，而不需要修改服务调用的配置文件了。
Eureka采用了C-S的设计架构。Eureka Server作为服务注册功能的服务器，它是服务注册中心。而微服务架构中的其他微服务，使用Eureka的客户端连接到Eureka Server并维持心跳连接。这样维护的人员就可以通过Eureka Server来监控系统中各个微服务是否正常运行。SpringCloud的一些其他模块（比如Zuul）就可以通过Eureka Server来发现系统中的其他微服务，并执行相关逻辑。

![Eureka](./images/springcloud-eureka.jpg)

## 两大组件
* Eureka Server，Eureka服务注册中心，提供服务注册功能。各个微服务节点启动后，会在Eureka Server中进行注册，这样Eureka Server服务注册表中将会存储所有可用服务节点的信息（存储在内存），服务节点的信息可以在界面中直观的看到。
* Eureka Client是一个Java客户端，用于简化与Eureka Server的交互，客户端同时也具备一个内置的、使用轮询负载算法的负载均衡器。在应用启动后，将会向Eureka Server发送心跳（默认周期为30秒）。如果Eureka Server在多个心跳周期内没有接收到某个微服务节点的心跳，那么Eureka Server等待一段时间（默认为90秒）后将会从服务注册表中把这个服务节点移除

## 三大角色
* Eureka Server 提供服务注册与发现
* Eureka Client for Application Service 服务提供方将自身服务注册到Eureka，从而使服务消费方能够找到
* Eureka Client for Application Client 服务消费方从Eureka获取注册服务列表，从而能够消费服务