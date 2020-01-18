# 【微服务—springcloud】搭建一个微服务并将其注册进Eureka注册中心
## 新建一个springboot工程，然后用以下maven依赖替换其中已有的所有maven依赖
```
<!-- 由于在dependencyManagement中定义了springboot的版本，所以这里不再需要继承spring-boot-starter-parent了，可以继承自己的父工程，当然也可以不继承任何父工程。 -->
<parent>
    <groupId>com.xiaowu.springcloud</groupId>
    <artifactId>microservice</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</parent>
<dependencies>
    <!-- SpringBoot中的actuator监控，用于完成微服务的监控，完成监控治理 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <!-- Eureka客户端，将当前微服务注册进eureka -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-eureka</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
    </dependency>
</dependencies>

<!-- 这里的作用相当于一个对所依赖jar包进行版本管理的管理器。
    如果dependencies里的dependency自己没有声明version元素，那么maven就
    会到dependencyManagement里面去找有没有对该artifactId和groupId进行过版本声明，如果有，就继承它，如果没有就会报错，告诉你必须为dependency声明一个version。
    如果dependencies中的dependency声明了version，那么无论dependencyManagement中有无对该jar的version声明，都以dependency里的version为准。 -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>Dalston.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>1.5.9.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## 在application.yaml全局配置文件中添加相关配置信息
```
server:
  port: 8001
spring:
   application:
    name: microservicecloud-dept  #注册进服务中心后的服务名字，Eureka会将其转为大写
eureka:
  client: #客户端注册进eureka服务列表内
    service-url: 
      #Eureka服务端的地址
      #defaultZone: http://localhost:7001/eureka
       defaultZone: http://eureka7001.com:7001/eureka/,http://eureka7002.com:7002/eureka/,http://eureka7003.com:7003/eureka/      
  instance:
    instance-id: microservicecloud-dept8001   #当前微服务在Eureka页面中显示的访问超链接名
    prefer-ip-address: true     #悬停在访问超链接上可以显示IP地址
         
#指定点击Eureka页面中的微服务访问超链接后显示的info信息 
#这需要在当前微服务工程中引入spring-boot-starter-actuator依赖，并再pom.xml中开启当前资源文件的过滤来解析两个$之间的内容
info: 
  app.name: xiaowu-microservicecloud
  company.name: www.xiaowu.com
  build.artifactId: $project.artifactId$
  build.version: $project.version$
```

## 在主入口类上标注Eureka Client相关注解
```
@SpringBootApplication
@EnableEurekaClient //本服务启动后会自动注册进Eureka中
//@EnableDiscoveryClient //如果服务注册中心不是用的Eureka，则使用这个注解来代替@EnableEurekaClient，用于服务发现
public class DeptProvider8001_App
{
	public static void main(String[] args)
	{
		SpringApplication.run(DeptProvider8001_App.class, args);
	}
}
```

## 检验服务是否注册成功
访问Eureka服务注册中心页面，可以看到Instances currently registered with Eureka表格中会显示当前服务的大写名称。