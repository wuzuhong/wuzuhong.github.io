# 【springboot】拦截器
## 首先创建一个拦截器注册器，在类上添加 @Component 注解，使其实现 WebMvcConfigurer 接口并实现其中的 addInterceptors 方法
```java
@Component
public class DemoWebMvcConfigurer implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new DemoInterceptor()).addPathPatterns("/demo/**");
    }
}
```
## 最后创建拦截器（可以创建多个），实现 HandlerInterceptor 接口并实现其中的方法
```java
public class DemoInterceptor implements HandlerInterceptor {
    // 在请求处理之前调用
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        return HandlerInterceptor.super.preHandle(request, response, handler);
    }
    // 在请求处理之后、视图被渲染之前调用
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
    }
    // 在请求结束之后调用
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
    }
}
```