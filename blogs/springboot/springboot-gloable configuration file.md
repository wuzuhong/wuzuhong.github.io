# 【springboot】全局配置文件
springboot的全局配置文件为application.properties，由于yaml文件要比properties更易于使用并且springboot也支持以application.yaml文件作为其全局配置文件，所以这里建议使用application.yaml文件作为springboot项目的全局配置文件。

优先级：config/application.properties > application.properties > application.yml > application.yaml

所有的starter（启动器）都有其默认配置，并且所有的默认配置都可以在全局配置文件中对其进行覆盖，例如：修改内嵌服务器的端口（默认为8080）可以在全局配置文件中这样写：
```yaml
server:
  port: 9090
```

## 在java代码中注入全局配置文件中的值
假如全局配置文件中有如下的配置信息：
```yaml
color: white
demo:
  name: xiaowu
  age: 10
```
那么就可以在java代码中通过以下两种方式将配置信息注入到java代码中
* 使用@ConfigurationProperties注解
```java
// 由于是在容器启动时就将全局配置文件的属性注入进来，
// 所以必须要有@Component注解，使得springboot在启动时就能加载当前类
@Component
// 告诉SpringBoot将本类中的所有属性和配置文件（默认为application.yaml）中相关的配置进行绑定，
// prefix = "demo"表示将配置文件中哪个下面的所有属性进行一一映射。
@ConfigurationProperties(prefix = "demo")
// 指定获取resource.yaml这个配置文件中的属性，而不是默认的全局配置文件
@PropertySource(value = "classpath:resource.yaml")
public class Demo {
  private String name;
  private Integer age;
}
```
然后在容器启动后就会发现Demo类中的两个属性已经有值了。
* 使用@Value注解
@Value只能取简单类型的属性值（如整型、字符串等基本类型数据），不能获取复杂类型的属性值（如集合、对象）
```java
// 由于是在容器启动时就将全局配置文件的属性注入进来，
// 所以必须要有@Component注解，使得springboot在启动时就能加载当前类
@Component
public class Demo {
  @Value("${color:red}") // 如果 color 没有配置值，那么默认值为 red
  private String color;
}
```

## 注意事项
* 在 yaml 配置文件中不能出现 name 字段，否则在封装到实体类中的时候会出错，会统一变成 Administrator。
* 这里的 @Component 注解在对应配置文件的bean上可以用，而在普通的 pojo 对象上是不能使用的，因为对应配置文件的 bean 对象中的数据就是配置文件中的数据，一般不会改变，而普通的 pojo 对象中的数据是会被改变的，当该对象被 @Autowired 注入时，数据就会混乱，也就是会出现线程安全问题（例如在同一个 controller 中有两个 url 映射的方法都使用了这个注入的 pojo ，那么第二个方法读取的就是第一个方法改变后的 pojo），所以建议对于普通的 pojo 对象还是用 new 的方式来实例化。对于 @Autowired 注入的好处在于降低了类之间的耦合度（类的创建和销毁都由 spring 来管理），并且在 A 类中注入的了B 类，若 B 类也用 @Autowired 注入了其他类，并且使用了这个类的方法，那么这个时候 A 类中必须使用 @Autowired 来注入 B 类，而不能用 new 的方式，否则就不能使用 B 类注入的其他类了。

## 属性值校验
在类上再加上一个 @Validated 注解，并在需要校验的属性上加上校验规则的注解，如 @Email

## 多环境对应多份全局配置文件
在实际项目中可能会用到多份配置文件，比如在正式环境中和开发环境中用的配置文件就不同。这个时候可以新建两个 yaml 文件，分别对应正式环境和开发环境的配置，application-prod.yaml 和 application-dev.yaml，然后在 application.yaml 中配置是使用 dev 还是 prod 配置文件。并且在application.yaml中配置的属性也会在application-dev.yaml或application-prod.yaml中生效。

* application.yaml：
```yaml
spring:
  profiles:
    active: prod # 表示当前使用application-prod.yaml配置文件
color: white # 当前配置也会在application-dev.yaml或application-prod.yaml中生效
```

* application-prod.yaml：
```yaml
demo:
  name: prod-xiaowu
```

* application-dev.yaml：
```yaml
demo:
  name: dev-xiaowu
```

## 在启动时覆盖全局配置文件中的配置项
```
java -jar my-spring-boot.jar --spring.profiles.active=dev
```

## 获取随机值
```
${random.uuid} #获取随机的UUID
${random.value} #获取随机的值
${random.int} #获取随机的整数
${random.long} #获取随机的长整数
${random.int(10)} #获取随机的10以内的整数
${random.int[1024,65536]} #获取随机的1024至65536之间的整数
```

## 通过占位符获取之前配置的值，如果没有可以使用:来指定默认值
```
person.lists=a,b,c
person.dog.name=${person.hello:hello}_dog
person.dog.age=15
```
