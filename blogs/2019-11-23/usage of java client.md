# 【分布式配置中心—Apollo】Java客户端使用方式
## 在SpringBoot中的使用方式
#### 添加`maven`依赖
```xml
<dependency>
    <groupId>com.ctrip.framework.apollo</groupId>
    <artifactId>apollo-client</artifactId>
    <version>1.5.1</version>
</dependency>
```

#### 添加配置
* 可以在`application.properties`文件中配置的配置项
```
# 应用id
app.id=aabbccdd
# Meta Server的地址，也就是Config Service的地址
apollo.meta=http://localhost:8080
# 本地缓存文件路径。Windows系统下默认为：C:\opt\data\{appId}\config-cache；Mac/Linux系统下默认为：/opt/data/{appId}/config-cache。如果使用默认值，则必须保证 /opt/data 目录已经存在
apollo.cacheDir=/opt/data/some-cache-dir
# 所属集群
apollo.cluster=SomeCluster
# 是否启用apollo。启用后会默认注入application namespace的配置
apollo.bootstrap.enabled=true
# 注入指定namespace中的配置，多个之间以逗号分隔
apollo.bootstrap.namespaces = application,FX.apollo,application.yml
```
* Environment环境配置项
  * 可以通过Java System Property。例如：java -Denv=DEV -jar xxx.jar，其中的大D是java启动参数的特定格式
  * 可以通过操作系统的System Environment。其key/value形如：ENV=DEV
  * 可以通过配置文件。对于Mac/Linux系统，文件位置为/opt/settings/server.properties；对于Windows系统，文件位置为C:\opt\settings\server.properties。其内容形如：env=DEV

需要注意的是：Environment环境支持以下几个值（大小写不敏感）：
* **DEV**：开发环境
* **FAT**：功能验收测试环境
* **UAT**：客户验收测试环境
* **PRO**：生产环境

#### 使用示例
* 在 Portal 界面中新建一个应用，应用 ID 为 aabbccdd22，创建一个名为 admin 的集群，并发布一个 `DriverData=DriverData in apollo`的配置项，务必记得要发布

* 在本地计算机的环境变量中添加两个环境变量
    ```
    CLASSPATH=C:\Program Files\Java\jdk1.8.0_91\bin
    DriverData=C:\Windows\System32\Drivers\DriverData
    ```

* 在`application.properties`文件中添加如下配置
    ```properties
    # 测试配置项
    DriverData=DriverData00
    CLASSPATH=CLASSPATH00
    DemoName=DemoName00

    # apollo客户端配置项
    app.id=aabbccdd22
    apollo.meta=http://localhost:8080
    C:\opt\data\${app.id}\config-cache
    apollo.cluster=admin
    apollo.bootstrap.enabled=true
    ```

* 在`C:\opt\settings\server.properties`中添加如下配置
    ```
    env=DEV
    ```

* 新建`ApolloController.java`和`MyProperties.java`
    ```java
    // ApolloController.java
    @RestController
    @RequestMapping("/apollo")
    public class ApolloController {
        @Value("${DriverData}")
        private String DriverData;

        @Value("${CLASSPATH}")
        private String CLASSPATH;

        @Value("${DemoName}")
        private String DemoName;

        @Autowired
        private MyProperties myProperties;

        @GetMapping("/get01")
        public Map<String, String> get01() {
            Map<String, String> result = new HashMap<String, String>();
            result.put("demoName", DemoName);
            result.put("classpath", CLASSPATH);
            result.put("driverData", DriverData);
            return result;
        }

        @GetMapping("/get02")
        public MyProperties get02() {
            return myProperties;
        }
    }

    // MyProperties.java
    @Component
    @ConfigurationProperties
    public class MyProperties {
        private String DriverData;
        private String CLASSPATH;
        private String DemoName;

        public String getDriverData() {
            return DriverData;
        }

        public void setDriverData(String driverData) {
            DriverData = driverData;
        }

        public String getCLASSPATH() {
            return CLASSPATH;
        }

        public void setCLASSPATH(String cLASSPATH) {
            CLASSPATH = cLASSPATH;
        }

        public String getDemoName() {
            return DemoName;
        }

        public void setDemoName(String demoName) {
            DemoName = demoName;
        }

    }
    ```

* 启动应用

* 访问接口`/apollo/get01`和`/apollo/get02`返回的结果都为：
    ```json
    {
        demoName: "DemoName00",
        classpath: "C:\Program Files\Java\jdk1.8.0_91\bin",
        driverData: "DriverData in apollo"
    }
    ```

* 当在 Portal 界面中修改 DriverData 配置项的值后，以上接口的值将会随之更新

## 配置方式的优先级
以上示例中涉及到三种配置方式
* 配置文件
* 环境变量
* 分布是配置中心

通过以上示例不难发现这三种配置方式的优先级为：分布是配置中心 > 环境变量 > 配置文件

优先级高的将会覆盖优先级低的。

## 客户端API的使用方式
#### 获取默认namespace的配置（application）
```java
// 获取出来的 config 实例是单例的，并且不会为null
Config config = ConfigService.getAppConfig();
String someKey = "someKeyFromDefaultNamespace";
String someDefaultValue = "someDefaultValueForTheKey";
String value = config.getProperty(someKey, someDefaultValue);
```

#### 监听配置变化事件
```java
Config config = ConfigService.getAppConfig();
config.addChangeListener(new ConfigChangeListener() {
    @Override
    public void onChange(ConfigChangeEvent changeEvent) {
        for (String key : changeEvent.changedKeys()) {
            ConfigChange change = changeEvent.getChange(key);
            System.out.println(String.format("Found change - key: %s, oldValue: %s, newValue: %s, changeType: %s", change.getPropertyName(), change.getOldValue(), change.getNewValue(), change.getChangeType()));
        }
    }
});
```

#### 获取公共Namespace的配置
```java
String somePublicNamespace = "CAT";
// 获取出来的 config 实例是单例的，并且不会为null
Config config = ConfigService.getConfig(somePublicNamespace);
String someKey = "someKeyFromPublicNamespace";
String someDefaultValue = "someDefaultValueForTheKey";
String value = config.getProperty(someKey, someDefaultValue);
```

#### 获取非properties格式namespace的配置
* yaml/yml格式的namespace
    ```java
    Config config = ConfigService.getConfig("application.yml");
    String someKey = "someKeyFromYmlNamespace";
    String someDefaultValue = "someDefaultValueForTheKey";
    String value = config.getProperty(someKey, someDefaultValue);
    ```
* 非yaml/yml格式的namespace
    ```java
    String someNamespace = "test";
    ConfigFile configFile = ConfigService.getConfigFile("test", ConfigFileFormat.XML);
    String content = configFile.getContent();
    ```

## 其他的使用方式请查看官网 https://github.com/ctripcorp/apollo/wiki/Java客户端使用指南

## 为什么apollo分布式配置中心的配置优先级最高？
因为 apollo 会将远端获取的配置组装成 PropertySource 并插入到 Spring 自带的众多 PropertySource 的第一位。

## java客户端刷新配置的原理
Apollo通过自定义的BeanPostProcessor和BeanFactoryPostProcessor將参数中包含${…}占位符和@Value注解的Bean注册到Apollo框架中定义的注册表中。一旦远端配置发生变化，Apollo会根据变化的配置的Key找到对应的Bean，然后通过反射修改Bean中某个字段的值，从而实现了配置动态生效的特性。

需要注意的是，Apollo在配置变化后，只能修改Bean的属性。例如我们数据源的属性发生变化，新创建的Connection对象是没问题的，但是连接池中已经创建的Connection对象相关信息是不能动态修改的，所以依然需要重启应用。