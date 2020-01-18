# 【微服务—springcloud】Ribbon
## 概述
Spring Cloud Ribbon是基于Netflix Ribbon实现的一套客户端负载均衡的工具。Ribbon是Netflix发布的开源项目，主要功能是提供客户端的软件负载均衡（Load Balance）算法，将Netflix的中间层服务连接在一起。Ribbon客户端组件提供一系列完善的配置项如连接超时、重试等。简单的说，就是在配置文件中列出Load Balance后面所有的机器，Ribbon会自动的帮你基于某种规则（如简单轮询、随机连接等）去连接这些机器。我们也很容易使用Ribbon实现自定义的负载均衡算法。

## 使用示例
### 在服务调用者（Eureka客户端）的pom.xml文件中添加Ribbon相关依赖
```
<!-- Eureka客户端 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-eureka</artifactId>
</dependency>
<!-- Ribbon相关 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-ribbon</artifactId>
</dependency>
<!-- 分布式配置客户端 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

### 在服务调用者（Eureka客户端）的application.yaml文件中添加Eureka注册中心的地址，多个地址用逗号隔开
```
server:
  port: 80
eureka:
  client:
    register-with-eureka: false #不向Eureka注册自己
    service-url:  #Eureka注册中心地址，多个地址用逗号隔开
      defaultZone: http://eureka7001.com:7001/eureka/,http://eureka7002.com:7002/eureka/,http://eureka7003.com:7003/eureka/  
```

### 在服务调用者（Eureka客户端）的RestTemplate配置Bean中使用@LoadBalanced注解开启负载均衡
```
@Configuration
public class ConfigBean {
  @Bean
  @LoadBalanced
  public RestTemplate getRestTemplate() {
    return new RestTemplate();
  }
  @Bean
  public IRule myRule() {
    // 我们可能需要重新选择负载均衡算法来替代默认的轮询，只需要new相应的对象即可达到目的
    // return new RoundRobinRule();
    // return new RandomRule();
    return new RetryRule();
  }
}
```

### 在服务调用者（Eureka客户端）的主入口类中添加相关注解，开启负载均衡
```
@SpringBootApplication
@EnableEurekaClient
// 在启动该微服务的时候就能去加载我们的自定义Ribbon配置类，从而使自定义的负载均衡算法生效
@RibbonClient(name = "MICROSERVICECLOUD-DEPT")
public class DeptConsumer80_App {
  public static void main(String[] args) {
    SpringApplication.run(DeptConsumer80_App.class, args);
  }
}
```

### 在服务调用者（Eureka客户端）的controller中通过微服务名称来调用微服务
```
@RestController
public class DeptController_Consumer {
  // MICROSERVICECLOUD-DEPT为Eureka注册中心的微服务提供者的名称
  private static final String REST_URL_PREFIX = "http://MICROSERVICECLOUD-DEPT";
  /**
   * 使用 使用restTemplate访问restful接口非常的简单粗暴无脑。 (url, requestMap, ResponseBean.class)这三个参数分别代表
   * REST请求地址、请求参数、HTTP响应转换被转换成的对象类型。
   */
  @Autowired
  private RestTemplate restTemplate;
  @RequestMapping(value = "/consumer/dept/add")
  public boolean add(Dept dept) {
    return restTemplate.postForObject(REST_URL_PREFIX + "/dept/add", dept, Boolean.class);
  }
  @SuppressWarnings("unchecked")
  @RequestMapping(value = "/consumer/dept/list")
  public List<Dept> list() {
    return restTemplate.getForObject(REST_URL_PREFIX + "/dept/list", List.class);
  }
}
```
由于我们已经在服务调用者（Eureka客户端）中开启了Ribbon的负载均衡，服务调用者就会根据微服务名称去Eureka注册中心找到该微服务名称所对应的所有微服务实例，然后根据Ribbon默认的负载均衡算法（即轮询，一个一次）去对微服务实例进行访问。

## Ribbon负载均衡的过程
* 先选择EurekaServer，它优先选择在同一个区域内负载较少的EurekaServer。
* 然后根据用户指定的策略，从EurekaServer取到的服务注册列表中选择一个地址。Ribbo提供了多中策略：如轮询（默认）、随机和根据响应时间加权等。

## Ribbon的核心组件：IRule
### IRule的功能
根据特定的负载均衡算法，从服务列表中选取一个要访问的服务。

### 在Spring Cloud Ribbon中自带了七种负载均衡算法
![Ribbon IRule](./images/springcloud-ribbon-irules.jpg)

### 如何更换负载均衡算法中默认的轮询算法
只需要在配置类中配置需要选择的负载均衡算法，这样就会用我们自己选择的负载均衡算法了
```
@Bean
public IRule myRule() {
    // 为达到的目的，用我们重新选择的负载均衡算法来替代默认的轮询。
    // 只需要new相应的对象即可
    // return new RoundRobinRule();
    // return new RandomRule();
    return new RetryRule();
}
```

## 自定义Ribbon负载均衡算法
### 自定义配置类
```
//自定义负载均衡算法的配置类
@Configuration
public class MySelfRule {
  @Bean
  public IRule myRule() {
    return new RandomRule_ZY();// 使用自定义的负载均衡算法
  }
}
//自定义负载均衡算法，需要通过继承AbstractLoadBalancerRule来实现
public class RandomRule_ZY extends AbstractLoadBalancerRule {
  // total = 0 // 当total==5以后，我们指针才能往下走，
  // currentIndex = 0 // 当前对外提供服务的服务器地址，
  // total需要重新置为零，但是已经达到过一个5次，我们的index = 1
  // 分析：我们5次，但是微服务只有8001 8002 8003 三台，OK？
  private int total = 0; // 总共被调用的次数，目前要求每台被调用5次
  private int currentIndex = 0; // 当前提供服务的机器号
  public Server choose(ILoadBalancer lb, Object key) {
    if (lb == null) {
      return null;
    }
    Server server = null;
    while (server == null) {
      if (Thread.interrupted()) {
        return null;
      }
      List<Server> upList = lb.getReachableServers();
      List<Server> allList = lb.getAllServers();
      int serverCount = allList.size();
      if (serverCount == 0) {
        return null;
      }
      if (total < 5) {
        server = upList.get(currentIndex);
        total++;
      } else {
        total = 0;
        currentIndex++;
        if (currentIndex >= upList.size()) {
          currentIndex = 0;
        }
      }
      if (server == null) {
        Thread.yield();
        continue;
      }
      if (server.isAlive()) {
        return (server);
      }
      server = null;
      Thread.yield();
    }
    return server;
  }
  @Override
  public Server choose(Object key) {
    return choose(getLoadBalancer(), key);
  }
  @Override
  public void initWithNiwsConfig(IClientConfig clientConfig) {
    // TODO Auto-generated method stub
  }
}
```
注意：自定义负载均衡算法的配置类不能放在主入口类所在包及其子包下（也就是说不能被扫描到），否则我们自定义的这个配置类就可能会被所有的Ribbon客户端所共享，也就是说我们达不到特殊化定制的目的了。

### 在主入口类中添加@RibbonClient注解
```
@SpringBootApplication
@EnableEurekaClient
// 在启动该微服务的时候就能去加载我们的自定义Ribbon配置类，从而使自定义的负载均衡算法生效
@RibbonClient(name = "MICROSERVICECLOUD-DEPT", configuration = MySelfRule.class)
public class DeptConsumer80_App {
  public static void main(String[] args) {
    SpringApplication.run(DeptConsumer80_App.class, args);
  }
}
```
即可。