# 【微服务—SpringCloudAlibaba】Sentinel 流控中心
使用 Sentinel 主要分为几个步骤:
1. 定义资源
2. 定义规则

规则类型包括：
1. flow ： 流量控制规则
2. degrade ： 熔断降级规则
3. authority ： 来源访问控制规则，也叫黑白名单规则
4. system ： 系统自适应保护规则
5. param-flow ： 热点参数限流规则
6. gw-flow ： 网关流量控制规则
7. gw-api-group ： 网关API组流量控制规则

资源名称在 Springboot 应用中可以直接使用 SpringCloudAlibaba 自带的 Web 路径埋点适配（默认自动开启）。在熔断降级中，资源名称格式为：请求方式+协议+主机+端口+接口路径，这些都是指的被调用方应用。在限流中，资源名称就是接口路径。

注意：Sentinel的熔断降级作为保护自身的手段，通常在客户端（调用方）进行。Sentinel的流量控制（限流）作为保护自身的手段，通常在服务端（被调用方）进行。

## 在 SpringBoot 中使用 Sentinel 限流，并集成 Nacos 来实现规则的动态配置

#### 在application.properties配置文件中添加以下配置
在`application.properties`配置文件中添加第 1 个（可以同时存在多个规则定义数据源）规则定义数据源（Nacos），用于定义限流规则。
```properties
# Nacos服务端地址
spring.cloud.sentinel.datasource.ds1.nacos.server-addr=127.0.0.1:8848
# Nacos的dataId
spring.cloud.sentinel.datasource.ds1.nacos.data-id=sentinel-flow
# Nacos的配置组
spring.cloud.sentinel.datasource.ds1.nacos.group-id=demo_group
# Nacos配置内容的数据格式，Sentinel默认提供两种内置的值： json 和 xml，对应于Nacos控制台的配置格式。
spring.cloud.sentinel.datasource.ds1.nacos.data-type=json
# 表示当前数据源中的规则类型为流量控制
spring.cloud.sentinel.datasource.ds1.nacos.rule-type=flow
# Nacos的命名空间id
spring.cloud.sentinel.datasource.ds1.nacos.namespace=2654c734-e385-468d-8973-66cabdfec68a
# Nacos用户的用户名和密码
spring.cloud.sentinel.datasource.ds1.nacos.username=demo
spring.cloud.sentinel.datasource.ds1.nacos.password=demo
```

#### 在pom.xml文件中添加以下依赖
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    <version>2022.0.0.0</version>
</dependency>
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
    <version>1.8.6</version>
</dependency>
```

这里使用的`SpringBoot`版本为`3.0.2`。

#### 在 Nacos 控制台创建限流规则
创建配置，其中该配置的`Data ID`为`spring.cloud.sentinel.datasource.ds1.nacos.data-id`配置项的值。其中该配置的`配置格式`为`spring.cloud.sentinel.datasource.ds1.nacos.data-type`配置项的值。配置内容为：
```json
[
    {
        "limitApp": "default",
        "resource": "/demoflow",
        "count": 200,
        "grade": 1,
        "strategy": 0,
        "refResource": null
    }
]
```

以上配置内容的字段说明如下：
* `limitApp`：限制哪个应用。 default 表示限制所有应用， {origin} 表示根据调用方的地址来限制， other 表示除 {origin} 以外的其余调用方的流量进行流量控制。
* `resource`：资源名称。
* `count`：限流阈值数量。
* `grade`：限流阈值类型。 0 代表线程数， 1 代表 QPS。
* `strategy`：基于调用关系的流控策略. 0 代表直接根据调用方进行限流； 1 代表根据关联流量限流，比如对数据库同一个字段的读操作和写操作存在争抢，写的速度过高会影响读的速度，我们可以给读操作资源设置 strategy 为 1 （根据关联流量限流），同时设置 refResource 为写操作资源，这样当写库操作过于频繁时，读数据的请求会被限流，以此来达到写操作优先的目的； 2 代表根据调用链路入口限流，比如来自入口 DemoController1 和 DemoController2 的请求都调用到了资源 DemoService1 ，我们可以设置 strategy 为 2 （根据调用链路入口限流），同时设置 refResource 为 DemoController1 来表示只有从入口 DemoController1 的调用才会记录到 DemoService1 的限流统计当中，而对来自 DemoController2 的调用可以放行。
* `refResource`：关联资源。

#### 创建接口资源
```java
@RestController
public class DemoController {
    @GetMapping("/demoflow")
    public Boolean flow() {
        return true;
    }
}
```

访问`http://localhost:8080/demoflow`，当 1 秒内的请求次数大于 1 次时将会返回 429 状态码，说明在 Nacos 中配置的限流规则已生效。可以在 Nacos 中修改限流规则，可以发现应用的限流动则动态生效了，并且不需要重启应用。

#### 限流规则支持PathParam和请求方式以及通配符路径
Sentinel的限流规则`默认支持PathParam`。假设有一个接口路径为`/demoflow/{id}`，那么在限流规则中需要将资源名称设置为`/demoflow/{id}`，之后用路径`/demoflow/aa`访问这个接口可以发现限流生效。

但是一般情况下，需要用接口路径+请求方式才能确定一个接口，所以`限流规则还需要支持请求方式`，而且有时可能想让当前限流规则对所有以`/demoflow`开头的接口路径生效，比如`/demoflow/aa`或`/demoflow/aa/bb`或`/demoflow/aa/bb/cc`，所以`限流规则还需要支持通配符路径`。

可以通过实现`UrlCleaner`接口来达到在限流规则中支持请求方式+接口路径以及通配符路径的目的。以下是一个实现`UrlCleaner`接口的示例：
```java
@Component
public class DemoUrlCleaner implements UrlCleaner {
    @Override
    public String clean(String originUrl) {
        // 获取当前请求方式
        ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        String method = requestAttributes.getRequest().getMethod();
        // 将当前请求的资源名称改为：接口路径+请求方式
        originUrl = method + ":" + originUrl;
        // 获取并遍历所有限流规则
        for (FlowRule rule : FlowRuleManager.getRules()) {
            // 获取当前限流规则的资源名称
            String resource = rule.getResource();
            // 使用AntPathMatcher对当前限流规则的资源名称与当前请求的资源名称进行通配符匹配
            AntPathMatcher antPathMatcher = new AntPathMatcher();
            boolean matched = antPathMatcher.match(resource, originUrl);
            // 如果匹配成功，则将当前请求的资源名称改为当前限流规则的资源名称
            if (matched) {
                originUrl = resource;
                break;
            }
        }
        return originUrl;
    }
}
```
如果像上述代码那样已经实现了`UrlCleaner`接口，那么在限流规则中需要将资源名称设置为`GET:/demoflow/{id}`，之后用请求方式`GET`和请求路径`/demoflow/aa`访问这个接口可以发现限流生效。也可以在限流规则中将资源名称设置为`GET:/demoflow/**`，之后用请求方式`GET`和请求路径`/demoflow/aa`访问这个接口可以发现限流生效。

AntPathMatcher 可以使用`?`来匹配一个字符，使用`*`来匹配0个或多个字符，使用`**`来匹配0个或多个目录。

## 在 SpringBoot 中使用 Sentinel 熔断降级，并集成 Nacos 来实现规则的动态配置
Sentinel的熔断降级作为保护自身的手段，`是在客户端（调用方）进行的，以下所有配置和代码都是客户端（调用方）的`。

#### 在application.properties配置文件中添加以下配置
在`application.properties`配置文件中添加第 2 个（可以同时存在多个规则定义数据源）规则定义数据源（Nacos），用于定义熔断降级规则。
```properties
# Nacos服务端地址
spring.cloud.sentinel.datasource.ds2.nacos.server-addr=127.0.0.1:8848
# Nacos的dataId
spring.cloud.sentinel.datasource.ds2.nacos.data-id=sentinel-degrade
# Nacos的配置组
spring.cloud.sentinel.datasource.ds2.nacos.group-id=demo_group
# Nacos配置内容的数据格式，Sentinel默认提供两种内置的值： json 和 xml，对应于Nacos控制台的配置格式。
spring.cloud.sentinel.datasource.ds2.nacos.data-type=json
# 表示当前数据源中的规则类型为熔断降级
spring.cloud.sentinel.datasource.ds2.nacos.rule-type=degrade
# Nacos的命名空间id
spring.cloud.sentinel.datasource.ds2.nacos.namespace=2654c734-e385-468d-8973-66cabdfec68a
# Nacos用户的用户名和密码
spring.cloud.sentinel.datasource.ds2.nacos.username=demo
spring.cloud.sentinel.datasource.ds2.nacos.password=demo
```

#### 在pom.xml文件中添加以下依赖
[在pom.xml文件中添加以下依赖](####在pom.xml文件中添加以下依赖)

#### 在 Nacos 控制台创建熔断降级规则
创建配置，其中该配置的`Data ID`为`spring.cloud.sentinel.datasource.ds1.nacos.data-id`配置项的值。其中该配置的`配置格式`为`spring.cloud.sentinel.datasource.ds1.nacos.data-type`配置项的值。配置内容为：
```json
[
    {
        "limitApp": "default",
        "resource": "GET:http://localhost:8080/demodegrade",
        "count": 100,
        "grade": 0,
        "timeWindow": 30,
        "minRequestAmount": 1,
        "statIntervalMs": 1000,
        "slowRatioThreshold": 0.5
    }
]
```

以上配置内容的字段说明如下：
* `resource`：资源名称。格式为：请求方式+协议+主机+端口+路径，这些都是指的被调用方。
* `count`：熔断阈值，与熔断策略相对应。
* `grade`：熔断策略。 0 代表慢调用比例（默认），这种策略对应的 count 的单位为毫秒，请求耗时超过 count 后认定为慢调用； 1 代表异常比例，这种策略对应的 count 为 0 到 1 的浮点数； 2 代表异常数策略，这种策略对应的 count 为整数。
* `timeWindow`：熔断时长，单位为秒。
* `minRequestAmount`：熔断触发的最小请求数，请求数小于该值时即使异常比率超出阈值也不会熔断。
* `statIntervalMs`：统计周期时长，单位为毫秒。
* `slowRatioThreshold`：慢调用比例阈值， 0 到 1 之间的浮点数，仅慢调用比例模式有效。

#### 创建服务提供方的接口
```java
@GetMapping("/demodegrade")
public String degrade() {
    try {
        Thread.sleep(200);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
    return "true";
}
```

#### 创建服务调用方的接口
```java
@RestController
public class DemoController {
    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/democlient")
    public String client(HttpServletResponse response) throws IOException {
        try {
            return restTemplate.getForObject("http://localhost:8080/demodegrade", String.class);
        } catch (HttpServerErrorException e) {
            // 如果是熔断降级异常处理器抛出来的异常，则转换响应体和响应码
            if (e.getStatusCode().equals(HttpStatus.SERVICE_UNAVAILABLE)) {
                response.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                response.getWriter().write(e.getStatusText());
                response.flushBuffer();
            }
        }
        return null;
    }
}
```

#### 在服务调用方配置RestTemplate
```java
@Configuration
public class DemoConfig {
    @Bean
    @SentinelRestTemplate(fallback = "demoHandler", fallbackClass = DemoFallback.class)// fallback 属性对应的方法必须是对应 fallbackClass 属性类中的静态方法
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

#### 在服务调用方创建熔断降级的处理器
```java
public class DemoFallback {
    public static ClientHttpResponse demoHandler(HttpRequest request, byte[] body, ClientHttpRequestExecution execution, BlockException exception) {
        return new DemoResponse();
    }
}
```

#### 在服务调用方创建熔断降级的自定义响应类
```java
public class DemoResponse implements ClientHttpResponse {
    // 熔断降级的响应状态码设置为 503
    private int statusCode = HttpStatus.SERVICE_UNAVAILABLE.value();

    // TODO 实现需要实现的接口
}
```

#### 熔断降级规则支持PathParam和请求方式以及通配符路径
实现方式与(限流规则支持PathParam和请求方式以及通配符路径)[####限流规则支持PathParam和请求方式以及通配符路径]一致，但是需要注意以下两点：
1. 不再是获取所有限流规则了，而是获取所有熔断降级规则`List<DegradeRule> rules = DegradeRuleManager.getRules()`。
2. 在 Nacos 控制台创建熔断降级规则时的资源名称格式不再是：请求方式+协议+主机+端口+接口路径。而是：请求方式+接口路径。

## 熔断和降级的区别
在 Sentinel 中，熔断降级是同一个概念，但是在实际情况下还是有区别的：
* 熔断：根据接口的调用耗时或者响应状态码来确定接口是否需要对该接口进行自动熔断。所以熔断操作是框架自动执行的。
* 降级：每个接口都通过人工的去设置等级，比如第1等级、第2等级和第3等级，等级越高越优先。在运行时设置降级等级，比如设置降级等级为第2等级，那么第1等级的接口将不能再访问，而是直接返回异常信息，这样就可以省下服务器资源来为第2等级和第3等级的接口提供服务。所以降级操作是人工根据业务需要手动执行的。