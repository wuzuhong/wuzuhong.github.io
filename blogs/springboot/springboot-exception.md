# 【springboot】异常处理
* DemoExceptionHandler.java
```java
@ControllerAdvice
public class DemoExceptionHandler {
	// 这里的 error 对应了templates目录下的error.ftl文件
    public static final String DEFAULT_ERROR_VIEW = "error";

    // 默认的异常处理。 Exception 及其子类都会进入到当前异常处理方法。
	// 注意：一个异常类只能存在一个方法上，例如：当前方法用了Exception后，这个类中的其他方法的异常类就必须换成其他自定义的。
    @ExceptionHandler(value = Exception.class)
    public ModelAndView defaultErrorHandler(HttpServletRequest req, Exception e) throws Exception {
        //这里必须使用ModelAndView，而不能使用ModelMap
    	ModelAndView mav = new ModelAndView();
        mav.addObject("exception", e);
        mav.addObject("url", req.getRequestURL());
        mav.setViewName(DEFAULT_ERROR_VIEW);
        return mav;
    }
    
    // 自定义的异常处理。 DemoPageException 及其子类都会进入到当前异常处理方法。
    @ExceptionHandler(value = DemoPageException.class)
    public ModelAndView customErrorHandler(HttpServletRequest req, Exception e) throws Exception {
    	ModelAndView mav = new ModelAndView();
        mav.addObject("exception", e);
        mav.addObject("url", req.getRequestURL());
        mav.setViewName(DEFAULT_ERROR_VIEW);
        return mav;
    }
    
    // 返回json数据的异常处理。 DemoJsonException 及其子类都会进入到当前异常处理方法。
    @ExceptionHandler(value = DemoJsonException.class)
    public @ResponseBody DemoExceptionInfo jsonErrorHandler(HttpServletRequest req, Exception e) throws Exception {
    	// DemoExceptionInfo 为自定义的异常信息类
    	DemoExceptionInfo demoExceptionInfo=new DemoExceptionInfo();
    	demoExceptionInfo.setCode("404");
    	demoExceptionInfo.setMessage(e.getMessage());
    	demoExceptionInfo.setUrl(req.getRequestURL().toString());
        return demoExceptionInfo;
    }
}
```
* DemoExceptionInfo.java
```java
// 异常信息类
public class DemoExceptionInfo {
	//异常代码
	public String code;
	//异常信息
	public String message;
	//异常地址
	public String url;
	//异常数据
	public String data;
	
	// getters and setters
}
```