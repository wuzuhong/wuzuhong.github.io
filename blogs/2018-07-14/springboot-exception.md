# 【springboot】异常处理
* GlobalExceptionHandler.java
```
@ControllerAdvice
public class GlobalExceptionHandler {
	
	//这里的 error 对应了templates目录下的error.ftl文件
    public static final String DEFAULT_ERROR_VIEW = "error";

    //默认的异常处理。注意：一个异常类只能存在一个方法上，例如：当前方法用了Exception后，这个类中的其他方法的异常类就必须换成其他自定义的。
    @ExceptionHandler(value = Exception.class)
    public ModelAndView defaultErrorHandler(HttpServletRequest req, Exception e) throws Exception {
        //这里必须使用ModelAndView，而不能使用ModelMap
    	ModelAndView mav = new ModelAndView();
        mav.addObject("exception", e);
        mav.addObject("url", req.getRequestURL());
        mav.setViewName(DEFAULT_ERROR_VIEW);
        return mav;
    }
    
    //自定义的异常处理
    //MyPageException为自定义的异常类。注意：一个异常类只能存在一个方法上，例如：当前方法用了MyPageException后，这个类中的其他方法的异常类就必须换成其他自定义的。
    @ExceptionHandler(value = MyPageException.class)
    public ModelAndView customErrorHandler(HttpServletRequest req, Exception e) throws Exception {
        //这里必须使用ModelAndView，而不能使用ModelMap
    	ModelAndView mav = new ModelAndView();
        mav.addObject("exception", e);
        mav.addObject("url", req.getRequestURL());
        mav.setViewName(DEFAULT_ERROR_VIEW);
        return mav;
    }
    
    //返回json数据的异常处理。注意：一个异常类只能存在一个方法上，例如：当前方法用了MyJsonException后，这个类中的其他方法的异常类就必须换成其他自定义的。
    @ExceptionHandler(value = MyJsonException.class)
    public @ResponseBody ExceptionInfo jsonErrorHandler(HttpServletRequest req, Exception e) throws Exception {
    	//ExceptionInfo为自定义的异常信息类
    	ExceptionInfo exceptionInfo=new ExceptionInfo();
    	exceptionInfo.setCode("404");
    	exceptionInfo.setMessage(e.getMessage());
    	exceptionInfo.setUrl(req.getRequestURL().toString());
        return exceptionInfo;
    }
}
```
* ExceptionInfo.java
```
// 异常信息类
public class ExceptionInfo {
	//异常代码
	public String code;
	//异常信息
	public String message;
	//异常地址
	public String url;
	//异常数据
	public String data;
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	public String getData() {
		return data;
	}
	public void setData(String data) {
		this.data = data;
	}
}
```
* MyJsonException.java
```
public class MyJsonException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = -6734749239130170666L;

	public MyJsonException(String message) {
		super(message);
	}
}
```
* MyPageException.java
```
public class MyPageException extends Exception {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 7321797063282710213L;

	public MyPageException(String message) {
		super(message);
	}
}
```