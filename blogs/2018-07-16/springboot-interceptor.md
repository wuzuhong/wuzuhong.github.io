# 【springboot】拦截器
## 首先创建一个拦截器注册器，在类上添加 @Configuration 注解，使其实现 WebMvcConfigurer 接口并实现其中的 addInterceptors 方法
```
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		//注册拦截器。当注册了多个拦截器则会按照顺序执行拦截器
		registry.addInterceptor(new InterceptorOne())	//注册拦截器 InterceptorOne
			.addPathPatterns("/hello/**");	//为拦截器 InterceptorOne 添加需要被拦截的地址，当需要拦截多种地址时可在此方法中传入一个集合
		registry.addInterceptor(new InterceptorTwo())
			.addPathPatterns("/hello/**");
		WebMvcConfigurer.super.addInterceptors(registry);
	}
	
}
```
## 最后创建拦截器（可以创建多个），实现 HandlerInterceptor 接口并实现其中的方法
InterceptorOne.java
```
public class InterceptorOne implements HandlerInterceptor {
	//在请求处理之前调用
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		System.out.println("被 one 拦截，放行……");
		//return true 表示放行，进入下一个拦截器；return false 表示拦截，不会进入下一个拦截器。
		return true;
	}
	//在请求处理之后、视图被渲染之前调用
	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {
		// TODO Auto-generated method stub
	}
	//在请求结束之后调用
	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
		// TODO Auto-generated method stub
	}
}
```
InterceptorTwo.java
```
public class InterceptorTwo implements HandlerInterceptor {

	//在请求处理之前调用
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		System.out.println("被 two 拦截，拦截……");
		//return true 表示放行，进入下一个拦截器；return false 表示拦截，不会进入下一个拦截器。
		return false;
	}

	//在请求处理之后、视图被渲染之前调用
	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {
		// TODO Auto-generated method stub
	}

	//在请求结束之后调用
	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
		// TODO Auto-generated method stub
	}

}
```