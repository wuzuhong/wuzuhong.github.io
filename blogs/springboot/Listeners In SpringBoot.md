# 【springboot】SpringBoot中的各类监听器

## `SpringBoot`的全生命周期监听器`SpringApplicationRunListener`

#### 实现`SpringApplicationRunListener`接口
```java
public class DemoSpringApplicationRunListener implements SpringApplicationRunListener {
    // 必须要有这个构造函数，因为需要根据指定类型的构造方法来初始化类
    public DemoSpringApplicationRunListener(SpringApplication springApplication, String[] args) {
    }

    public void starting(ConfigurableBootstrapContext bootstrapContext) {
        System.out.println("starting");
    }

    public void environmentPrepared(ConfigurableBootstrapContext bootstrapContext, ConfigurableEnvironment environment) {
        System.out.println("environmentPrepared");
    }

    public void contextPrepared(ConfigurableApplicationContext context) {
        System.out.println("contextPrepared");
    }

    public void contextLoaded(ConfigurableApplicationContext context) {
        System.out.println("contextLoaded");
    }

    public void started(ConfigurableApplicationContext context) {
        System.out.println("started");
    }

    public void running(ConfigurableApplicationContext context) {
        System.out.println("running");
    }

    public void failed(ConfigurableApplicationContext context, Throwable exception) {
        System.out.println("failed");
    }
}
```

#### 在`src/main/resources/META-INF/spring.factories`中定义实现类的全路径以生效
```
org.springframework.boot.SpringApplicationRunListener=\
  com.example.demo.DemoSpringApplicationRunListener
```

`注意：SpringApplicationRunListener属于应用程序启动层面的监听器，在SpringBoot启动时候，调用run方法进行反射加载初始化。此时上下文还没有加载，所以通过@Component是起不了作用的。`

## 应用上下文事件监听器`ApplicationListener`
如果容器中有一个`ApplicationListener`的`Bean`，每当`ApplicationContext`发布`ApplicationEvent`时，`ApplicationListener`的`Bean`中的`onApplicationEvent`方法将自动被触发。监听的事件类型由`ApplicationListener`中的泛型决定，`ApplicationListener`中的常见泛型有：
* `ContextRefreshedEvent`：ApplicationContext 被初始化或刷新时，该事件被发布。这也可以在 ConfigurableApplicationContext接口中使用 refresh() 方法来发生。此处的初始化是指：所有的Bean被成功装载，后处理Bean被检测并激活，所有Singleton Bean 被预实例化，ApplicationContext容器已就绪可用。
* `ContextStartedEvent`：当使用 ConfigurableApplicationContext 接口中的 start() 方法启动 ApplicationContext 时，该事件被发布。你可以调查你的数据库，或者你可以在接受到这个事件后重启任何停止的应用程序。
* `ContextStoppedEvent`：当使用 ConfigurableApplicationContext 接口中的 stop() 停止 ApplicationContext 时，发布这个事件。你可以在接受到这个事件后做必要的清理的工作。
* `ContextClosedEvent`：当使用 ConfigurableApplicationContext 接口中的 close() 方法关闭 ApplicationContext 时，该事件被发布。一个已关闭的上下文到达生命周期末端，它不能被刷新或重启。
* `RequestHandledEvent`：这是一个 web-specific 事件，告诉所有 bean HTTP 请求已经被服务。只能应用于使用DispatcherServlet的Web应用。在使用Spring作为前端的MVC控制器时，当Spring处理用户请求结束后，系统会自动触发该事件。

#### 实现`ApplicationListener`接口以接收`ContextRefreshedEvent`事件
```java
@Component
public class DemoApplicationListener implements ApplicationListener<ContextRefreshedEvent> {
    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        System.out.println("onContextRefreshedEvent");
    }
}
```

#### 发布`ContextRefreshedEvent`事件
```java
@RestController
public class DemoController {
    @Autowired
    private ApplicationContext applicationContext;

    @GetMapping("publish")
    public String publish() {
        applicationContext.publishEvent(new ContextRefreshedEvent(applicationContext));
        return "true";
    }
}
```

### 自定义事件
* 自定义事件对象
    ```java
    public class DemoEvent extends ApplicationEvent {
        private String msg;
        public DemoEvent(Object source) {
            super(source);
        }
        public DemoEvent(Object source, String msg) {
            super(source);
            this.msg = msg;
        }
        public String getMsg() {
            return msg;
        }
        public void setMsg(String msg) {
            this.msg = msg;
        }
    }
    ```
* 发布自定义事件
    ```java
    @RestController
    public class DemoController {
        @Autowired
        private ApplicationContext applicationContext;

        @GetMapping("/publish")
        public String publish() {
            applicationContext.publishEvent(new DemoEvent(applicationContext, "haha"));
            return "true";
        }
    }
    ```
* 接收自定义事件
    ```java
    @Component
    public class DemoApplicationListener implements ApplicationListener<DemoEvent> {
        @Override
        public void onApplicationEvent(DemoEvent demoEvent) {
            System.out.println(demoEvent.getMsg());
        }
    }
    ```

## `ServletContext`生命周期的监听器`ServletContextListener`，它是属于`Servlet`容器，不属于`SpringBoot`

#### 实现`ServletContextListener`接口
```java
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener //自动注册ServletContextListener，需要配合@ServletComponentScan来使用
public class DemoServletContextListener implements ServletContextListener {
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("contextInitialized");
    }

    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("contextDestroyed");
    }
}
```

#### 在`SpringBoot`启动类中添加扫描注解`@ServletComponentScan`
```java
@SpringBootApplication
@ServletComponentScan //默认扫描当前包及所有子包
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

}
```