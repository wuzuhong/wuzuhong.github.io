# 【springboot】配置类
springboot抛弃了以往xml文件的配置方式，而使用配置类来对我们的组件进行配置。
配置类的一个简单示例：
```
//@Configuration：指明当前类是一个配置类
@Configuration
public class UserConfig {

  //@Bean：相当于 xml 配置文件中的 <Bean>标签，<Bean>标签中的 id 就是当前方法的方法名
  @Bean
  public UserService userService() {
    return new UserServiceImpl();
  }
}
```
注册WebMvc拦截器的配置类可以这样写：
```
//@Configuration：指明当前类是一个配置类
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