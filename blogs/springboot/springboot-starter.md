# 【springboot】starter启动器
## 概述
springboot的starter（启动器）本质上就是一个maven依赖，它与maven依赖唯一区别就是在springboot启动时它的所有组件都能自动被加载，并且它还会提供一些默认配置，使得普通用户可以“开箱即用”。

## 自定义starter
### 创建一个用maven构建的springboot项目
#### maven依赖
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.1.3.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
</parent>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```
#### 创建一个pojo用于接收全局配置文件中的信息
```java
//接收指定前缀的配置值
@ConfigurationProperties(prefix = "demostarter")
public class DemoStarterProperteis {
    private String msg;
    public String setMsg(String msg) {
        this.msg = msg;
    }
    public String getMsg() {
        return this.msg;
    }
}
```
#### 创建一个service用于对外提供服务
```java
public class DemoStarterService {
    private String msg;
    public void setMsg(String msg) {
        this.msg = msg;
    }
    public String getMsg() {
        return this.msg;
    }
}
```
#### 创建一个自动配置类进行自动配置功能
```java
//表示这是一个配置类
@Configuration
//启动指定类的ConfigurationProperties功能，将配置文件中对应的值和DemoStarterProperteis类型绑定起来并把DemoStarterProperteis加入到ioc容器中，可以指定多个，以逗号分隔。                                             
@EnableConfigurationProperties(value = DemoStarterProperteis.class)
//以下三个注解都是Spring底层@Conditional注解（Spring注解版），只有满足所有指定的条件，整个配置类里面的配置才会生效； 
//当前注解用于判断当前应用是否是web应用，如果是，当前配置类生效。
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
//当前注解用于判断当前项目有没有DemoStarterService这个类；如果有，当前配置类生效。
@ConditionalOnClass(DemoStarterService.class)
//当前注解用于判断配置文件中是否存在某个配置 demostarter.enabled，matchIfMissing=true表示如果不存在则默认设置为true，判断也是成立的；
@ConditionalOnProperty(prefix = "demostarter", value = "enabled", matchIfMissing = true)
public class DemoAutoConfiguration {
    // 已经和SpringBoot的配置文件映射了
    private final DemoStarterProperteis demoStarterProperteis;
    //给容器中添加一个组件，这个组件的某些值需要从properties中获取
    @Bean
    @ConditionalOnMissingBean(DemoStarterService.class) //判断容器没有这个组件
    public DemoStarterService demoStarterService() {
        DemoStarterService demoStarterService = new DemoStarterService();
        demoStarterService.setMsg(demoStarterProperteis.getMsg());
        return demoStarterService;
    }
}
```
#### 创建spring.factories文件
在src/main/resources 文件夹下新建文件夹 META-INF，在新建的META-INF文件夹下新建spring.factories文件，并在该文件中配置自动配置类为我们之前编写的DemoAutoConfiguration类
```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=com.demo.DemoAutoConfiguration
```
#### 在其他springboot项目中使用
在其他项目的全局配置文件中定义demostarter.msg，然后再调用demoStarterService.getMsg()即可返回全局配置文件中demostarter.msg的值，和demoStarterService中的逻辑一致，并且demoStarterService是通过@Autowired注入的，而不是new出来的。并且在其他项目启动时可以看到控制台输出的内容中依赖的starter已经有我们自定义的starter了，说明已经启动了我们自定义的starter。