# 【spring】使用DeferredResult实现相应的异步生成返回值的功能
## 概述
DeferredResult和Callable都是为了异步生成返回值提供基本的支持。简单来说就是一个请求进来，如果你使用了DeferredResult或者Callable，在没有得到返回数据之前，DispatcherServlet和所有Filter就会退出Servlet容器线程，但响应保持打开状态，一旦返回数据有了，这个DispatcherServlet就会被再次调用并且处理，以异步产生的方式，向请求端返回响应值。 这么做的好处就是请求不会长时间占用服务器连接池，提高服务器的吞吐量。

## 前提条件
DeferredResult需要servlet3、springmvc3.2及以上版本。
* 首先在web.xml的头部指定servlet的版本为3.0
* 然后在web.xml中定义的servlet和filter中添加<async-supported>true</async-supported>来开启servlet的异步支持
* 最后注意在controller中必须使用springmvc的原生注解，例如：@RequestMapping、@Controller、@ResponseBody等等。

## 使用示例
```java
import java.util.List;
import java.util.concurrent.ForkJoinPool;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.async.DeferredResult;

import io.swagger.annotations.ApiOperation;

@Controller
public class ImportRecordController {
  @RequestMapping(value = "/failures", method = RequestMethod.GET)
  public @ResponseBody DeferredResult<ResponseEntity<List<Book>>> getImportFailedBooks(
      @PathVariable("id") String id) {
    // 创建DeferredResult对象，并设置超时时间为5分钟，若超时了，则会抛出异常
    DeferredResult<ResponseEntity<List<Book>>> deferredResult =
        new DeferredResult<ResponseEntity<List<Book>>>(5*60*1000);
    ForkJoinPool.commonPool().submit(() -> {
      // 查询数据库
      List<Book> list = dao.select(id);
      // 若有数据了，则直接返回结果
      if (list != null) {
        // 设置延期结果，跳出线程操作，返回响应数据
        deferredResult.setResult(new ResponseEntity<List<Book>>(list, HttpStatus.OK));
      }
    });
    // 只能返回DeferredResult，否则无法达到获取延期结果的效果
    return deferredResult;
  }
}
```

## 适用场景
某些高耗时的操作我们通常是使用异步线程来进行处理，但我们无法获取异步线程的响应结果，在这种情况下，我们就可以使用DeferredResult，我们可以将异步线程的结果放在数据库中，然后通过查询数据库来获取响应结果，如果有结果了直接返回DeferredResult对象即可。