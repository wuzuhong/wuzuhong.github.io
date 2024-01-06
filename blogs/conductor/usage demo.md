# 【服务编排-Conductor】使用示例

## 创建自定义工程来构建Conductor Server
1. 下载Conductor的git源码。
2. 创建SpringBoot工程。
3. 将SpringBoot工程的启动类、配置、依赖都和Conductor的git源码中的server目录工程中的保持一致。
4. 修改配置文件中的redis地址和es地址。
5. 启动。

## 构建Conductor UI
1. 在Conductor的git源码中的ui目录工程中执行 npm install 和 npm run build。
2. 将构建好的静态资源放到上面创建的SpringBoot工程的static目录下。

## 创建自定义工程来构建Conductor Worker
1. 创建SpringBoot工程。
2. 添加maven依赖：
    ```xml
    <dependency>
        <groupId>com.netflix.conductor</groupId>
        <artifactId>conductor-client</artifactId>
        <version>${conductor.version}</version>
    </dependency>
    <dependency>
        <groupId>com.netflix.conductor</groupId>
        <artifactId>conductor-common</artifactId>
        <version>${conductor.version}</version>
    </dependency>
    ```
3. 创建自定义Worker类并实现Worker接口
```java
public class DemoTaskWorker implements Worker {
    // 任务定义名称
    public static final String TASK_DEF_NAME = "demo_task";

    @Override
    public String getTaskDefName() {
        return TASK_DEF_NAME;
    }

    @Override
    public TaskResult execute(Task task) {
        // 执行逻辑
        return null;
    }
}
```
4. 配置自定义Worker
```java
public class CustomTaskRunnerConfigurer implements SpringApplicationRunListener {
    public CustomTaskRunnerConfigurer(SpringApplication application, String[] args) {
    }

    @Override
    public void ready(ConfigurableApplicationContext context, Duration timeTaken) {
        TaskClient taskClient = new TaskClient();
        taskClient.setRootURI("http://localhost:8080/api/");

        // 根据任务定义名称来配置对应Worker的执行线程数量
        Map<String, Integer> threadCount = new HashMap<>();
        threadCount.put(DemoTaskWorker.TASK_DEF_NAME, 2);

        TaskRunnerConfigurer configurer = new TaskRunnerConfigurer
                .Builder(taskClient, Arrays.asList(new DemoTaskWorker()))
                .withTaskThreadCount(threadCount)
                .build();

        // 开始轮询并执行任务
        configurer.init();
    }
}
```
5. 在`src/main/resources/META-INF/spring.factories`文件中配置`SpringApplicationRunListener`的实现类：
```
org.springframework.boot.SpringApplicationRunListener=\
    com.demo.config.CustomTaskRunnerConfigurer
```