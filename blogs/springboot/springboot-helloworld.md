# 【springboot】HelloWorld
## 概述
Spring Boot使创建独立的、基于生产级Spring的应用程序变得很容易，并且允许直接运行这些应用程序。它具有以下特性：
* JavaWeb应用程序的一站式开发框架。
* 支持内嵌Tomcat、Jetty以及Netty，不需要去单独部署war包。
* 提供自定义的starter（启动器）依赖项，以简化构建配置。
* 尽可能的自动配置spring和第三方库。
* 提供可用于生产的特性，如指标数据、健康检查和外部配置。
* 不需要xml配置。

## HelloWorld
常用springboot文件目录

![springboot-catalog](./images/springboot-catalog.jpg)

### 创建一个springboot项目
普通maven项目可以通过添加springboot相关maven依赖来创建springboot项目，因为springboot本来就是maven项目，但为了简化创建springboot项目的过程，idea和eclipse允许我们在界面上选择我们需要的maven依赖。

### maven依赖
```xml
  <!--springboot的版本控制中心，用于管理springboot应用中所有依赖的版本，
    因此一般情况下我们导入的依赖是不需要声明版本号的-->
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.1.3.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
  </parent>
  <dependencies>
    <!--web启动器（必选），帮助我们导入web模块正常运行的所有依赖及其默认配置-->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!--tomcat启动器（必选），帮助我们导入内置tomcat服务器所需要的所有依赖及其默认配置-->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-tomcat</artifactId>
      <scope>provided</scope>
    </dependency>
    <!--单元测试启动器（可选），帮助我们导入单元测试所需要的所有依赖及其默认配置-->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <!--springboot的maven插件（必选）-->
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
```

### 主入口类
```java
/**
 * @SpringBootApplication 标注一个主入口类并说明这是一个Spring Boot应用，
 * 同时它也是一个组合注解，它包含了以下几个注解的功能：
 * @SpringBootConfiguration 用于标明当前类是一个配置类，就像xml配置文件，而现在是用java代码来配置，效果是一样的；
 * @EnableAutoConfiguration 开启自动配置，用于将spring的 @Enable* 系列注解全部包含进来而无需开发者显式声明，其中就包括了用于开启事务的注解，因此只需要在我们想要添加事务的方法上加上 @Transactional 注解即可开启事务；
 * @ComponentScan 用于实现自动扫描注解（包括@Controller、@RestController、@Service、@Component等等一系列的Spring注解），默认会扫描当前包和所有子包，和 xml 配置自动扫描效果一样；
 * @Filter 用于排除两个系统类。
*/
@SpringBootApplication
public class StudySpringbootApplication {

  public static void main(String[] args) {
    SpringApplication.run(StudySpringbootApplication.class, args);
  }

}
```
运行主入口类中的main函数即可启动服务。

### controller
```java
/**
 * @RestController 包含 @Controller 和 @ResponseBody 两个注解，可以将返回值自动转为 JSON
*/
@RestController
public class DemoController {
    @GetMapping("/demo")
    public Map<String, String> demo() {
        Map<String, String> result = new HashMap<String, String>();
        result.put("msg", "haha");
        return result;
    }
}
```

### service
```java
@Service
public class DemoService {
  public Map<String, String> demoFunc(Integer id) {
    //业务代码
    return null;
  }
}
```

### 不采用内嵌的服务器，而使用外部服务器来单独部署war包
如果使用内嵌的服务器，则直接使用jar包，运行主入口类的main函数即可，但有时考虑到性能优化问题，并且内嵌的服务器不支持jsp，于是就需要使用外部服务器来部署，这时就需要将程序打成war包，此时需要编写一个SpringBootServletInitializer的子类，并重写其中的configure方法：
```java
public class ServletInitializer extends SpringBootServletInitializer {
  @Override
  protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
    return application.sources(StudySpringbootApplication.class);
  }
}
```
然后将tomcat的maven依赖的scope改为provided即可。

## springboot 常用的注解
使用了这些注解后就会在容器启动的时候就被 springboot 加载，前提是这些类必须在主入口类所在包或其子包下
* @Controller：标明这时一个 controller
* @RestController：标明这是一个 controller，包含 @Controller 和 @ResponseBody 两个注解，可以将返回值自动转为 JSON
* @Service：标明这是一个 service 类，通常放在 service 的实现类中
* @Configuration：标明这是一个配置类，相当于原始的配置文件
* @Component：标明这是一个 controller 类、service 类和配置类以外的组件，常用于需要在容器启动的时候就被 springboot 加载的类