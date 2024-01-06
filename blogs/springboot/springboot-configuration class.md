# 【springboot】配置类
springboot抛弃了以往xml文件的配置方式，而使用配置类来对我们的组件进行配置。
配置类的一个简单示例：
```java
@Configuration  // 指明当前类是一个配置类
public class DemoConfig {
  @Bean  // 相当于 xml 配置文件中的 <Bean>标签，<Bean>标签中的 id 就是当前方法的方法名
  public DemoService demoService() {
    return new DemoServiceImpl();
  }
}
```

注册WebMvc拦截器的配置类可以这样写：
```
@Configuration
public class WebMvcConfig {
  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    //注册拦截器。当注册了多个拦截器则会按照顺序执行拦截器
    registry.addInterceptor(new InterceptorOne())  //注册拦截器 InterceptorOne
        .addPathPatterns("/hello/**");  //为拦截器 InterceptorOne 添加需要被拦截的地址，当需要拦截多种地址时可在此方法中传入一个集合
    registry.addInterceptor(new InterceptorTwo())
        .addPathPatterns("/hello/**");
    WebMvcConfigurer.super.addInterceptors(registry);
  }
}
```

当然也支持在`@Configuration`注解下面使用`@ImportResource`注解来加载xml文件配置。其支持通配符，例如：`@ImportResource("classpath*:aabb/*-ccdd.xml")`。

也支持自定义xml文件读取逻辑，只需要自定义一个`BeanDefinitionReader`的实现类，然后这样使用`@ImportResource(locations="classpath*:aabb/*-ccdd.xml", reader=DemoXmlBeanDefinitionReader)`，最后实现这个`DemoXmlBeanDefinitionReader`类：
```java
public class DemoXmlBeanDefinitionReader extends XmlBeanDefinitionReader {
	public DemoXmlBeanDefinitionReader(BeanDefinitionRegistry registry) {
		super(registry);
    // 自定义逻辑
	}
	@Override
	public int loadBeanDefinitions(Resource resource) throws BeanDefinitionStoreException {
		// 自定义逻辑
    // 入参 Resource 对象代表 xml 文件
    // 返回值为当前 xml 文件中 bean 的数量，若不想让当前 xml 文件生效，则可以返回 0
		return super.loadBeanDefinitions(resource);
	}
}
```