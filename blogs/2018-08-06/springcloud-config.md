# 【微服务—springcloud】分布式配置中心
## 分布式系统面临的配置问题
微服务意味着要将单体应用中的业务拆分成一个个子服务，每个服务的粒度相对较小，因此系统中会出现大量的服务。由于每个服务都需要必要的配置信息才能运行，我们每一个微服务都带着一个application.yaml文件，那么上百个配置文件的管理就会很不方便。所以一套集中式的、动态的配置管理设施是必不可少的，SpringCloud提供了ConfigServer来解决这个问题。

## 概述
SpringCloud Config为微服务架构中的微服务提供集中化的外部配置支持，配置服务器为各个不同微服务应用的所有环境提供了一个中心化的外部配置。

## 原理
SpringCloud Config分为服务端和客户端。
服务端也称为分布式配置中心，它是一个独立的微服务应用，用来连接配置服务器并为客户端提供获取配置信息、加密配置信息、解密配置信息等访问接口。
客户端则是通过指定的配置中心来管理业务相关的配置内容，并在启动的时候从配置中心获取和加载配置信息。
配置服务器默认采用git来存储配置信息，这样就有助于对环境配置进行版本管理，并且可以通过git客户端工具来方便的管理和访问配置内容。

## 功能
* 集中化管理配置文件
* 不同环境不同配置，动态化的配置更新
* 运行期间动态调整配置，不再需要在每个服务部署的机器上编写配置文件，服务会向配置中心统一拉取自己的配置信息
* 当配置发生改变时，服务不需要重启即可感知到配置的变化并应用新的配置
* 将配置信息以RestFul接口的形式暴露

## 搭建SpringCloud Config服务端并以Github作为配置服务器
* 在Github上新建一个仓库，作为配置服务器，命名为microservice-config，并将其克隆到本地。
* 在本地仓库中新建一个application.yaml文件，并在里面添加一些需要统一配置的信息，保存时选择UTF-8编码格式，并将其推送到Github上。
* 建立一个springboot工程并添加相关依赖来作为SpringCloud Config服务端
```
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
</dependency>
```
* 在SpringCloud Config服务端的主入口类添加相关注解
```
@SpringBootApplication
@EnableConfigServer
public class Config_3344_StartSpringCloudApp {
  public static void main(String[] args) {
    SpringApplication.run(Config_3344_StartSpringCloudApp.class, args);
  }
}
```
* 在SpringCloud Config服务端的全局配置文件application.yaml中添加相关配置
```yaml
server: 
    port: 3344 
spring:
    application:
        name:  microservicecloud-config
    cloud:
        config:
            server:
                git:
                    uri: git@github.com:zzyybb/microservicecloud-config.git #GitHub上面的git仓库名字
 ```
* 启动SpringCloud Config服务端工程，然后在浏览器的地址栏中输入： http://${SpringCloud Config的服务端工程的地址}/${配置服务器的分支}/application-env.yml ，这里的env表示环境类型，可以是dev或test等等。如果成功了，则会显示配置服务器的application.yaml中对应的的信息。

## 搭建SpringCloud Config客户端并通过SpringCloud Config服务端来获取Github上的配置
* 建立一个springboot工程并添加相关依赖来作为SpringCloud Config客户端
```
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```
* 在SpringCloud Config客户端工程中新建一个bootstrap.yaml文件并在其中添加SpringCloud Config服务端相关信息。bootstrap.yaml与application.yaml文件区别在于application.yaml是用户级别的资源配置项，而bootstrap.yaml是系统级别的（优先级更高）。SpringCloud会创建一个Bootstrap Context，作为Spring应用的Application Context的父上下文，Spring初始化的时候，Bootstrap Context负责从外部源加载配置属性并解析配置，这两个上下文共享一个从外部源获取的环境配置信息。Bootstrap Context和Application Context有着不同的约定，所以新增了一个bootstrap.yaml文件，保证Bootstrap Context和Application Context配置的分离。
bootstrap.yaml ： 
```yaml
spring:
    cloud:
        config:
            name: application.yml #需要从github上读取的资源名称，注意没有yml后缀名
            profile: test   #本次访问的配置文件中的配置项
            label: master #本次访问的分支   
            uri: http://config-3344.com:3344  #本微服务启动后先去找3344号服务，通过SpringCloudConfig服务端获取GitHub的服务地址
```
* 新建controller类，来验证是否获取到了Github上的配置信息
```
@RestController
public class ConfigClientRest {

  @Value("${spring.application.name}")
  private String applicationName;

  @Value("${eureka.client.service-url.defaultZone}")
  private String eurekaServers;

  @Value("${server.port}")
  private String port;

  @RequestMapping("/config")
  public String getConfig() {
    String str = "applicationName: " + applicationName + "\t eurekaServers:" + eurekaServers
        + "\t port: " + port;
    System.out.println("******str: " + str);
    return "applicationName: " + applicationName + "\t eurekaServers:" + eurekaServers + "\t port: "
        + port;
  }
}
```

## bootstrap.yaml文件和application.yaml文件的区别
application.yaml是应用级别的资源配置，而bootstrap.yaml是系统级别的资源配置，bootstrap.yaml在application.yaml之前加载，bootstrap.yaml是用于应用程序上下文的引导阶段，而application.yaml可以用来配置后续各个模块中需使用的公共参数等，bootstrap.yaml会覆盖application.yaml中同名的配置项。SpringCloud会创建一个Bootstrap Context，作为Spring应用的Application Context的父上下文，Spring初始化的时候，Bootstrap Context负责从外部源加载配置属性并解析配置，这两个上下文共享一个从外部源获取的环境配置信息。Bootstrap Context和Application Context有着不同的约定，所以新增了一个bootstrap.yaml文件，保证Bootstrap Context和Application Context配置的分离。典型的应用场景是当使用Spring Cloud Config Server的时候，应该在bootstrap.yaml里面指定其相关配置。