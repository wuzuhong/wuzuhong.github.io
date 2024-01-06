# 【springboot】使用DeferredResult实现相应的异步生成返回值的功能
## 概述
DeferredResult是为了异步生成返回值提供基本的支持。简单来说就是一个请求进来，如果你使用了DeferredResult，在没有得到返回数据之前，DispatcherServlet和所有Filter就会退出Servlet容器线程，但响应保持打开状态，一旦返回数据有了，这个DispatcherServlet就会被再次调用并且处理，以异步产生的方式，向请求端返回响应值。这么做的好处就是请求不会长时间占用服务器（比如Tomcat）连接池，提高服务器的吞吐量。

## 使用示例
```java
@RestController
public class DemoDeferredResultController {
    private final static Logger LOGGER = LoggerFactory.getLogger(DemoDeferredResultController.class);
    @GetMapping("/demo")
    public DeferredResult<Map<String, String>> demo(){
        // 创建DeferredResult对象，并设置超时时间为5分钟，若超时了，则会抛出异常
        DeferredResult<Map<String, String>> deferredResult =
                new DeferredResult<Map<String, String>>(5*60*1000L);
        ForkJoinPool.commonPool().submit(() -> {
            // 模拟数据库 5 秒种的耗时查询
            List<String> data = null;
            try {
                Thread.sleep(5000);
                data = new ArrayList<String>();
            } catch (InterruptedException e) {}
            // 若有数据了，则直接返回结果
            if (data != null) {
                // 设置延期结果，跳出线程操作，返回响应数据
                Map<String, String> result = new HashMap<String, String>();
                result.put("msg", "haha");
                LOGGER.info("给响应设置结果了");
                deferredResult.setResult(result);
            }
        });
        // 只能返回DeferredResult，否则无法达到获取延期结果的效果
        LOGGER.info("请求结束了");
        return deferredResult;
    }
}
```

以上示例，在控制台输出的结果为：
```
2023-12-05T21:59:14.295+08:00  INFO 1941 --- [nio-8080-exec-1] c.e.demo.DemoDeferredResultController    : 请求结束了
2023-12-05T21:59:19.298+08:00  INFO 1941 --- [onPool-worker-1] c.e.demo.DemoDeferredResultController    : 给响应设置结果了
```

从这个结果可以看出，`请求结束了`这个是在请求进来的时候立马就输出了，而`给响应设置结果了`则是在睡眠 5 秒种后输出的。因此可以得出，请求是立马结束的，响应是响应保持打开状态的，直到有结果后才会返回响应并结束响应。

## 适用场景
某些高耗时的操作我们通常是使用异步线程来进行处理，但我们如果想要获取异步线程的响应结果，那么势必会阻塞当前请求，并且会消耗服务器（比如Tomcat）的连接数。在这种情况下，我们就可以使用DeferredResult，通过查询数据库来获取响应结果，如果有结果了直接返回DeferredResult对象即可，这样就可以让请求的连接直接释放，并回收到服务器（比如Tomcat）的连接池。