# 【微服务—springcloud】搭建Eureka服务注册中心
## 新建一个springboot工程，然后用以下maven依赖替换其中已有的所有maven依赖
```
<!-- 由于在dependencyManagement中定义了springboot的版本，所以这里不再需要继承spring-boot-starter-parent了，可以继承自己的父工程，当然也可以不继承任何父工程。 -->
<parent>
    <groupId>com.xiaowu.springcloud</groupId>
    <artifactId>microservice</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</parent>
<dependencies>
    <!-- eureka-server服务端 -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-eureka-server</artifactId>
    </dependency>
    <!-- springboot单元测试 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
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
  port: 7001
eureka: 
  instance:
    hostname: localhost #当前Eureka Server的域名，可在本机hosts文件中进行域名映射
  client: 
    register-with-eureka: false     #false表示不向注册中心注册自己。
    fetch-registry: false     #false表示自己端就是注册中心，我的职责就是维护服务实例，并不需要去检索服务
    service-url: 
      #设置与Eureka Server交互的地址查询服务和注册服务都需要依赖这个地址。
      #单个注册中心用：defaultZone: http://localhost:${server.port}/eureka/       
      #多个注册中心用：defaultZone: http://eureka7002.com:7002/eureka/,http://eureka7003.com:7003/eureka/  #多个注册中心用逗号隔开
      defaultZone: http://localhost:7001/eureka/
```

## 在主入口类上标注Eureka Server服务端启动注解
```
@SpringBootApplication
@EnableEurekaServer // EurekaServer服务器端启动类,接受其它微服务注册进来
public class EurekaServer7001_App
{
	public static void main(String[] args)
	{
		SpringApplication.run(EurekaServer7001_App.class, args);
	}
}
```

## 检验是否启动成功
启动服务器，在浏览器中输入服务地址，即可看到Eureka的页面，这时在Instances currently registered with Eureka表格中显示的是No instances available（还没有服务被注册）