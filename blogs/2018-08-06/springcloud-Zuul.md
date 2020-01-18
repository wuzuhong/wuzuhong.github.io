# 【微服务—springcloud】Zuul
## 概述
Zuul包含了对请求的转发和过滤两个主要功能，其中转发功能负责将外部请求转发到具体的微服务实例上，是实现外部访问统一入口的基础，而过滤功能则是负责对请求的处理过程进行干预，是实现请求校验、服务聚合等功能的基础。Zuul和Eureka进行整合，将Zuul自身注册为Eureka服务治理下的应用，同时从Eureka中获得其他微服务的信息，也即以后访问微服务都要通过Zuul，类似于网关的作用。

## 使用示例
* 在pom.xml文件中添加相关依赖
```
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-zuul</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-eureka</artifactId>
</dependency>
```
* 在主入口类上添加相关注解
```
@SpringBootApplication
@EnableZuulProxy
public class Zuul_9527_StartSpringCloudApp {
  public static void main(String[] args) {
    SpringApplication.run(Zuul_9527_StartSpringCloudApp.class, args);
  }
}
```
* 在全局配置文件application.yaml中添加相关配置
```
server: 
    port: 9527
spring: 
    application:
        name: microservicecloud-zuul-gateway
eureka: 
    client: 
        service-url: 
            defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka,http://eureka7003.com:7003/eureka  
        instance:
            instance-id: gateway-9527.com
            prefer-ip-address: true 
zuul: 
    #设置统一的前缀，在访问地址上就需要加上这个前缀
    prefix: /atguigu
    #忽略原真实服务名，防止使用服务的真实名称来访问服务
    ignored-services: "*"
    #配置路由的映射地址，防止暴露服务的真实名称
    #这里将microservicecloud-dept服务映射为了mydept
    #假设在映射前是通过http://${zuul的域名}/microservicecloud-dept/depts/1来访问
    #那么在映射后则是通过http://${zuul的域名}/mydept/depts/1来访问
    routes: 
        mydept.serviceId: microservicecloud-dept
        mydept.path: /mydept/**
info:
    app.name: atguigu-microcloud
    company.name: www.atguigu.com
    build.artifactId: $project.artifactId$
    build.version: $project.version$
```