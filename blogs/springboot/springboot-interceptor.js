function getBlog(){
	return blog = {"content": "# 【springboot】拦截器\n## 首先创建一个拦截器注册器，在类上添加 @Component 注解，使其实现 WebMvcConfigurer 接口并实现其中的 addInterceptors 方法\n```java\n@Component\npublic class DemoWebMvcConfigurer implements WebMvcConfigurer {\n    @Override\n    public void addInterceptors(InterceptorRegistry registry) {\n        registry.addInterceptor(new DemoInterceptor()).addPathPatterns(\"/demo/**\");\n    }\n}\n```\n## 最后创建拦截器（可以创建多个），实现 HandlerInterceptor 接口并实现其中的方法\n```java\npublic class DemoInterceptor implements HandlerInterceptor {\n    // 在请求处理之前调用\n    @Override\n    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {\n        return HandlerInterceptor.super.preHandle(request, response, handler);\n    }\n    // 在请求处理之后、视图被渲染之前调用\n    @Override\n    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {\n        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);\n    }\n    // 在请求结束之后调用\n    @Override\n    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {\n        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);\n    }\n}\n```", "title": "【springboot】拦截器"}
}