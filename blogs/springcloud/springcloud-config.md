# 【微服务—SpringCloudAlibaba】Nacos 配置中心和 Nacos 注册中心
## 分布式系统面临的配置问题
微服务意味着要将单体应用中的业务拆分成一个个子服务，每个服务的粒度相对较小，因此系统中会出现大量的服务。由于每个服务都需要必要的配置信息才能运行，我们每一个微服务都带着一个application.yaml文件，那么上百个配置文件的管理就会很不方便，并且如果上百个微服务都用到了相同的配置信息，一旦这个配置信息改动了，那么就需要同时改动上百个微服务，费时费力。所以一套集中式的、动态的配置管理设施是必不可少的。

在SpringCloudAlibaba中使用Nacos来实现分布式配置中心。

Nacos采用的是客户端主动拉取模型，使用长轮询的方式来获取配置数据：客户端发起请求后，服务端不会立即返回请求结果，而是将请求挂起（`DeferredResult`）等待一段时间，如果此段时间内服务端数据变更，立即响应客户端请求，若是一直无变化则等到指定的超时时间后响应请求，客户端重新发起长连接。

## Nacos 的基本概念
#### 命名空间
不同的命名空间下，可以存在相同的配置组或配置集。可以用于多租户场景或多环境场景下的配置隔离。

#### 配置组
通过一个有意义的字符串对配置集进行分组，从而区分`dataId`相同的配置集下的配置项。

#### 配置集
一般情况下，一个系统或应用对应一个配置集，但是一个系统或者应用也是可以包含多个配置集的，`dataId`就是配置集的唯一标识，每个配置集中包含多个配置项。

`dataId`的完整格式为：`${prefix}-${spring.profiles.active}.${file-extension}`，其中：
* `prefix`可以通过配置项`spring.cloud.nacos.config.prefix`来配置。
* `spring.profiles.active`为当前`SpringBoot`使用的`profile`，当`spring.profiles.active`为空时，`dataId`的格式变成`${prefix}.${file-extension}`。
* `file-exetension`为配置内容的数据格式，可以通过配置项`spring.cloud.nacos.config.file-extension`来配置。目前只支持`properties`和`yaml`类型，默认为`properties`类型。

#### 配置项
对应于`SpringBoot`的`application.properties`文件中的配置。

#### 配置快照
客户端 SDK 会在本地生成配置的快照。当客户端无法连接到 Nacos Server 时，可以使用配置快照使系统维持可用状态，提高整体容灾能力。

#### 服务
通过预定义接口网络访问的提供给客户端的软件功能。简单来说就是后端服务。

#### 服务分组
不同的服务可以归类到同一分组。

#### 健康检查
以指定方式检查服务下的实例的健康度，从而确认该实例是否能提供服务。根据检查结果，实例会被判断为健康或不健康。对服务发起请求时，不健康的实例不会返回给客户端。

#### 健康保护阈值
为了防止因过多实例不健康导致流量全部流向健康实例，继而造成流量压力把健康实例压垮并形成雪崩效应，应将服务的健康保护阈值定义为一个 0 到 1 之间的浮点数。当健康实例数占总服务实例数的比例小于该值时，无论实例是否健康，都会将所有实例返回给客户端。

#### 用户
* 用于登陆 Nacos 控制台。
* 用于客户端 SDK 连接 Nacos 服务端时的权限凭证。

#### 角色
* 用户绑定角色。

#### 权限
* 将命名空间授权给角色。

## 部署 Nacos

#### 镜像地址
`nacos/nacos-server:v2.3.0-slim`

#### 暴露端口
`8848`和`9848`

#### 环境变量
```properties
# 部署模式
MODE=standalone
# 是否开启鉴权
NACOS_AUTH_ENABLE=true
# 集群模式下，Nacos服务端之间通信时的身份识别信息
NACOS_AUTH_IDENTITY_KEY=serverIdentity
NACOS_AUTH_IDENTITY_VALUE=security
# 生成客户端JWT令牌的密钥
NACOS_AUTH_TOKEN=SecretKey012345678901234567890123456789012345678901234567890123456789
```

#### 启动命令
```bash
docker run -d --name nacos-server \
-p 8848:8848 \
-p 9848:9848 \
-e MODE=standalone \
-e NACOS_AUTH_ENABLE=true \
-e NACOS_AUTH_IDENTITY_KEY=serverIdentity \
-e NACOS_AUTH_IDENTITY_VALUE=security \
-e NACOS_AUTH_TOKEN=SecretKey012345678901234567890123456789012345678901234567890123456789 \
nacos/nacos-server:v2.3.0-slim
```

#### 访问控制台
* 访问地址： http://localhost:8848/nacos
* 账号密码： nacos/nacos

注意：以上部署模式下，`Nacos`的数据是存储在本地嵌入式数据库的，生产环境下要添加以下额外的环境变量来配置其存储到`MySQL`：
```
# 支持MYSQL数据库
SPRING_DATASOURCE_PLATFORM=mysql
# 数据库连接地址
MYSQL_SERVICE_HOST=
# 数据库端口
MYSQL_SERVICE_PORT=
# 数据库库名
MYSQL_SERVICE_DB_NAME=
# 数据库用户名
MYSQL_SERVICE_USER=
# 数据库用户密码
MYSQL_SERVICE_PASSWORD=
# 数据库连接参数
MYSQL_SERVICE_DB_PARAM=
```

## 在 SpringBoot 中使用 Nacos 配置中心
#### 在bootstrap.properties配置文件中添加以下配置
```properties
# dataId的prefix前缀，
spring.cloud.nacos.config.prefix=demo
# 配置内容的数据格式
spring.cloud.nacos.config.file-extension=properties
# 是否开启配置管理
spring.cloud.nacos.config.enabled=true
# Nacos服务端地址
spring.cloud.nacos.config.server-addr=127.0.0.1:8848
# 命名空间id
spring.cloud.nacos.config.namespace=2654c734-e385-468d-8973-66cabdfec68a
# 配置组
spring.cloud.nacos.config.group=demo_group
# 用户的用户名和密码
spring.cloud.nacos.config.username=demo
spring.cloud.nacos.config.password=demo
```

#### 在pom.xml文件中添加以下依赖
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
    <version>2022.0.0.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
    <version>4.0.0</version>
</dependency>
```

这里使用的`SpringBoot`版本为`3.0.2`。

#### 使用 Spring Cloud 原生注解 @RefreshScope 实现配置自动更新
```java
@RestController
@RefreshScope
public class DemoController {
    @Value("${demo_msg:haha}")
    private String msg;

    @GetMapping("/demo")
    public Map<String, String> demo() {
        Map<String, String> result = new HashMap<String, String>();
        result.put("msg", msg);
        return result;
    }
}
```

`@RefreshScope`要加在那些需要获取`Nacos`中的配置以及需要配置自动更新的`Java`类上，并且这些`Java`类必须是`SpringBoot`的`Bean`。

#### 在 Nacos 控制台创建配置
* 首先，在`命名空间`菜单中创建命名空间。
* 然后，在`权限控制`菜单中创建用户、角色、将角色绑定用户、将角色授权给命名空间。
* 最后，在`配置管理`菜单中切换命名空间，创建配置。其中该配置的`Data ID`为`spring.cloud.nacos.config.prefix`配置项的值，注意这里不需要添加`.properties`后缀。其中该配置的`Group`为`spring.cloud.nacos.config.group`配置项的值。其中该配置的`配置格式`为`spring.cloud.nacos.config.file-extension`配置项的值。

#### 修改配置快照的目录
默认情况下，配置快照的目录为`/Users/demo/nacos/config`，有以下两种方式可以修改：
1. 在SpringBoot启动类上添加系统变量：
```java
@SpringBootApplication
public class DemoApplication {
	public static void main(String[] args) {
		System.setProperty("JM.SNAPSHOT.PATH", "/Users/demo/nacos/config666666");
		SpringApplication.run(DemoApplication.class, args);
	}
}
```

2. 将工程打包成Docker镜像，在启动的时候添加环境变量： JM.SNAPSHOT.PATH=/Users/demo/nacos/config666666

## Nacos 配置加密
TODO

## 注解 @RefreshScope 实现配置自动更新的底层原理
`@RefreshScope`注解是SpringCloud中的一个注解，用来实现Bean中属性的动态刷新。经过`@RefreshScope`注解修饰的Bean，将被`RefreshScope`类进行代理，可以在运行时刷新，之后任何使用这些Bean的类都将在下一个方法调用中获得一个全新的完全初始化的实例。因此，这些Bean可以实现在配置变更时，能够不重启应用的情况下，刷新Bean中相关的属性值。
TODO

## 是否需要刷新在应用启动时所用到的配置
对于这个问题，个人认为的答案是：不需要。

应用启动时所做的操作意味着这个时候应用还没有完成启动，并且当应用完成启动后将不会再次执行该操作，所以刷新在应用启动时所用到的配置是没有意义的，因为用到该配置的操作已经执行完成，不会再执行了。

## 在 SpringBoot 中使用 Nacos 注册中心
#### 在服务提供者和服务消费者的bootstrap.properties配置文件中添加以下配置
```properties
# 是否开启注册发现
spring.cloud.nacos.discovery.enabled=true
# 当前服务名称。如果是服务提供者，那么可以将当前配置值改为 demo-producer
spring.cloud.nacos.discovery.service=demo-consumer
# 命名空间id
spring.cloud.nacos.discovery.namespace=2654c734-e385-468d-8973-66cabdfec68a
# 服务分组
spring.cloud.nacos.discovery.group=demo_group
# 服务权重，取值范围 1 到 100，数值越大，权重越大
spring.cloud.nacos.discovery.weight=1
# 设置服务实例为永久实例
spring.cloud.nacos.discovery.ephemeral=false
# Nacos服务端地址
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
# 用户的用户名和密码
spring.cloud.nacos.discovery.username=demo
spring.cloud.nacos.discovery.password=demo
```

> 注意：服务提供者与服务消费者的服务分组必须相同，否则服务提供者调服务消费者时会报错：`No instances available for demo-producer`

#### 在服务提供者和服务消费者的pom.xml文件中添加以下依赖
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    <version>2022.0.0.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
    <version>4.0.0</version>
</dependency>
```

#### 在服务消费者的pom.xml文件中添加额外依赖
```xml
<!-- 集成 Ribbon 的负载均衡 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    <version>4.0.0</version>
</dependency>
```

这里使用的`SpringBoot`版本为`3.0.2`。

#### 在服务提供者和服务消费者的启动类上使用注解 @EnableDiscoveryClient 来开启服务注册
```java
@SpringBootApplication
@EnableDiscoveryClient
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}
```

#### 在服务消费者中配置`RestTemplate`以集成 Ribbon 的负载均衡
```java
@Configuration
public class DemoConfig {
    @LoadBalanced // 集成 Ribbon 的负载均衡
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

#### 在服务消费者中发起请求
```java
@RestController
public class DemoController {
    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/demo/consumer")
    public String demo() {
        String result = restTemplate.getForObject("http://nacos-producer/demo/producer", String.class);
        return result;
    }
}
```

以上请求中的`nacos-producer`为服务提供者的服务名称，`/demo/producer`为服务提供者的接口路径，由于`RestTemplate`已经集成 Ribbon 的负载均衡，所以这个请求将会以轮询的方式去调用服务提供者的每一个实例。

#### 健康检查
Nacos 提供两种类型的服务实例：
* 临时实例：由客户端主动上报，告诉注册中心自己健康状态，如果在⼀段时间没有上报，那么注册中心就认为该实例已经不健康。不健康的实例将会在一段时间后被删除。
* 永久实例：注册中心主动向客户端进行探测，无法探测成功的实例将被标志为不健康。 Nacos 现在提供了两种探测的协议，即 Http 和 TCP 。永久实例将会永久的存在于注册中心，除非是人为的被删除。

如果某个服务的临时实例在不健康之后被删除，那么就无法知道这个服务到底有多少个实例，也不知道到底哪个服务出问题了，所以建议使用永久实例。

可以在 Nacos 控制台配置永久实例的健康检查方式，包括检查类型、端口和路径。

#### 设置服务实例为永久实例
在bootstrap.properties配置文件中添加以下配置：
```properties
spring.cloud.nacos.discovery.ephemeral=false
```

#### 动态修改服务提供者的某个实例的权重
访问 Nacos 控制台： 服务管理 -> 服务列表 -> 详情 -> 集群 -> 编辑。

#### 动态修改服务提供者的保护阈值
访问 Nacos 控制台： 服务管理 -> 服务列表 -> 详情 -> 保护阈值。