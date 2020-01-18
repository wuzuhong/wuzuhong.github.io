# 【微服务—springcloud】Feign
## 概述
* Feign旨在使编写Java Http客户端变得更加容易，Feign的功能就是面向接口调用微服务。
* Feign支持可插拔式的编码器和解码器。SpringCloud对Feign进行了封装，使其支持了SpringMVC标准注解和HttpMessageConverters。
* 前面在使用Ribbon+RestTemplate时，利用RestTemplate对http请求的封装处理，形成了一套模板化的调用方法。但在实际的开发中，由于对服务依赖的调用可能不止一处，往往一个接口会被多处调用，所以通常都会针对每个微服务自行封装一些客户端类来包装这些依赖服务的调用。所以，springcloud Feign在此基础上做了进一步封装，由它来帮助我们定义和实现依赖服务接口的定义。在springcloud Feign的实现下，我们只需创建一个接口并使用注解的方式来配置它（以前是Dao接口上面标注Mapper注解，现在是一个微服务接口上面标注一个Feign注解即可），即可完成对服务提供方的接口绑定，简化了使用SpringCloud Ribbon时封装服务调用客户端的开发量。
* springcloud Feign集成了Ribbon，它利用Ribbon维护了微服务列表信息，并且通过轮询实现了客户端的负载均衡。而与Ribbon不同的是，通过springcloud Feign只需要定义服务绑定接口且以声明式的方法，优雅而简单的实现了服务调用。
* springcloud Feign需要结合Eureka来使用，springcloud Feign通过接口的方法调用Rest服务，该请求发送给Eureka服务器，直接找到服务接口，由于在进行服务调用的的时候springcloud Feign融合了Ribbon技术，所以也支持负载均衡。

## 使用示例
### 在服务调用者（Eureka客户端）的pom.xml文件中添加Feign的相关依赖
```
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-feign</artifactId>
</dependency>
```

### 在在服务调用者（Eureka客户端）中编写Feign相关代码
FeignClientService.java
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
FeignClientServiceFallbackFactory.java
```
@Component
public class DeptClientServiceFallbackFactory implements FallbackFactory<DeptClientService> {
  @Override
  public DeptClientService create(Throwable throwable) {
    return new DeptClientService() {
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

### 在主入口类中添加 @EnableFeignClients 注解
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