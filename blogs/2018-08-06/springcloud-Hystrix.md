# 【微服务—springcloud】Hystrix
## 概述
Hystrix是一个用于处理分布式系统的延迟和容错的开源库，在分布式系统中，许多依赖的微服务实例不可避免的会调用失败，比如超时、异常等等，Hystrix能保证在调用一个微服务实例出现问题的情况下，不会导致整个微服务调用链都失败，避免级联故障，以提高分布式系统的弹性。
Hystrix本身是一种开关装置，当某个服务单元发生故障之后，通过Hystrix的故障监控，向调用方返回一个符合预期的、可处理的备选响应（FallBack），而不是长时间等待或者抛出调用方无法处理的异常，这样就保证了服务调用方的线程不会被长时间地、不必要地占用，从而避免了故障在分布式系统中的蔓延。

## 功能
Hystrix能实现服务降级、服务熔断、服务限流、接近实时的监控等功能。

## 服务熔断
当调用链路的某个微服务不可用或者相应时间太长，会熔断该节点微服务的调用，快速相应错误信息，当检测到该节点微服务调用响应正常后恢复到调用链路。Hystrix会监控微服务间调用的状况，当失败的调用到达一定阀值时（默认为5秒内20次调用失败），就会对该微服务进行熔断。
### 利用SpringCloud Feign来作为使用示例，因为SpringCloud Feign中集成了Hystrix：
* FeignClientService.java
```
@FeignClient(value = "MICROSERVICECLOUD-DEPT",
    fallbackFactory = DeptClientServiceFallbackFactory.class)
public interface FeignClientService {
  @RequestMapping(value = "/dept/get/{id}", method = RequestMethod.GET)
  public Dept get(@PathVariable("id") long id);

  @RequestMapping(value = "/dept/list", method = RequestMethod.GET)
  public List<Dept> list();

  @RequestMapping(value = "/dept/add", method = RequestMethod.POST)
  public boolean add(Dept dept);
}
```
* FeignClientServiceFallbackFactory.java
```
@Component
public class FeignClientServiceFallbackFactory implements FallbackFactory<DeptClientService> {
  @Override
  public FeignClientService create(Throwable throwable) {
    return new FeignClientService() {
      @Override
      public Dept get(long id) {
        Dept dept = new Dept();
        dept.setDeptno(id);
        dept.setDname("该ID：" + id + "没有没有对应的信息,Consumer客户端提供的降级信息,此刻服务Provider已经关闭");
        dept.setDb_source("no this database in MySQL");
        return dept;
      }

      @Override
      public List<Dept> list() {
        return null;
      }

      @Override
      public boolean add(Dept dept) {
        return false;
      }
    };
  }
}
```
* application.yaml
```yaml
feign: 
    hystrix: 
        enabled: true #开启Hystrix熔断机制
```
* 主入口类
```
@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients(basePackages = {"com.xiaowu.springcloud"})
public class DeptConsumer80_Feign_App {
  public static void main(String[] args) {
    SpringApplication.run(DeptConsumer80_Feign_App.class, args);
  }
}
```
* pom.xml
```
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-feign</artifactId>
</dependency>
```

然后当FeignClientService中的服务访问接口出错后，就会自动调用FeignClientServiceFallbackFactory类中定义的对应方法，直接返回友好的错误信息，而不会挂起耗死整个调用链路。

## 服务降级
* 整体资源快不够了，忍痛将某些服务先关掉，待度过难关，再开启回来。一般多个微服务是通过不同的进程部署在同一台机器上，当某一个微服务的访问量剧增，这时就需要对其他微服务进行降级，来提高该微服务的资源可使用率。
* 服务降级可以基于服务熔断，在服务熔断并返回错误信息后，访问该服务的次数将会减少，从而提高其他服务的资源利用率，达到降级的目的。

## Hystrix Dashboard服务监控
Hystrix提供了准实时的调用监控（Hystrix Dashboard），Hystrix会持续地记录所有通过Hystrix的请求信息，并以统计报表和图形的形式展示给用户，包括每秒执行多少次请求，多少次成功，多少次失败等等。SpringCloud提供了Hystrix Dashboard的整合，对监控内容转化为可视化界面。
### Hystrix Dashboard服务监控的使用示例
* 在pom.xml文件中添加hystrix和hystrix-dashboard相关依赖
```
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-hystrix</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-hystrix-dashboard</artifactId>
</dependency>
```
* 在主入口类中添加@EnableHystrixDashboard注解
```
@SpringBootApplication
@EnableHystrixDashboard
public class DeptConsumer_DashBoard_App {
  public static void main(String[] args) {
    SpringApplication.run(DeptConsumer_DashBoard_App.class, args);
  }
}
```
* 在所有服务提供者的工程中的pom.xml文件中都需要添加监控依赖actuator和熔断器Hystrix依赖，并在启动类上使用了@EnableCircuitBreaker注解
* 启动相关工程后，在浏览器中输入HystrixDashboard的测试工程地址+/hystrix，就可以看到HystrixDashboard的主页面，然后在页面中的第一个输入框中输入需要监控的服务的地址+/hystrix.stream，即可看到该服务的监控信息，包括每秒请求的次数，成功的次数，失败的次数，流量的趋势等等。