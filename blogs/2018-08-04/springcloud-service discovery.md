# 【微服务—springcloud】Eureka的服务发现
```
@RestController
public class DeptController {
  //注入用于服务发现的类DiscoveryClient
  @Autowired
  private DiscoveryClient client;

  @RequestMapping(value = "/dept/discovery", method = RequestMethod.GET)
  public Object discovery() {
    //获取所有已注册的微服务  
    List<String> list = client.getServices();
    System.out.println("**********" + list);
    //获取指定微服务的所有实例
    List<ServiceInstance> srvList = client.getInstances("MICROSERVICECLOUD-DEPT");
    for (ServiceInstance element : srvList) {
      System.out.println(element.getServiceId() + "\t" + element.getHost() + "\t"
          + element.getPort() + "\t" + element.getUri());
    }
    return this.client;
  }

}
```