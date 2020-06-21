# 【web安全—xss攻击与防御】通过java后端代码来防御xss攻击
首先自定义一个请求对象，并重写其中的几个方法来插入xss防御逻辑代码，然后通过一个过滤器来将当前请求对象转换为自定义的请求对象。其中将会涉及到 XssFilter.java 和 XssHttpServletRequestWrapper.java 两个类。

#### XssFilter.java

```java
import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

@Component
@WebFilter
public class XssFilter implements Filter {
	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		XssHttpServletRequestWrapper xssRequest = new XssHttpServletRequestWrapper((HttpServletRequest) request);
		chain.doFilter(xssRequest, response);
	}

	@Override
	public void destroy() {
	}
}
```

#### XssHttpServletRequestWrapper.java

```java
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.Charset;

import javax.servlet.ReadListener;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;

/**
 * 用于清除有风险的HTML，暂时只支持基于 resteasy 构建的 RESTful 服务
 */
public class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {

	public XssHttpServletRequestWrapper(HttpServletRequest request) {
		super(request);
	}

	// 清除 body 中有风险的HTML
	@Override
	public ServletInputStream getInputStream() throws IOException {
		ServletInputStream sis = super.getInputStream();
		if (sis == null || sis.available() <= 0) {
			return sis;
		}
		String str = IOUtils.toString(sis, Charset.forName("UTF-8"));
		// 清除有风险的HTML
		String cleanedStr = doClean(str);
		InputStream is = IOUtils.toInputStream(cleanedStr);
		return new ServletInputStream() {
			@Override
			public int read() throws IOException {
				return is.read();
			}

			@Override
			public void setReadListener(ReadListener listener) {
			}

			@Override
			public boolean isReady() {
				return false;
			}

			@Override
			public boolean isFinished() {
				return false;
			}
		};
	}

	// 清除 query 路径中有风险的HTML
	@Override
	public String getQueryString() {
		String str = super.getQueryString();
		return doClean(doDecode(str));
	}

	// 清除 path 路径中有风险的HTML
	@Override
	public StringBuffer getRequestURL() {
		String str = super.getRequestURL().toString();
		str = doClean(doDecode(str));
		return new StringBuffer(str);
	}

	private String doDecode(String str) {
		try {
			return URLDecoder.decode(str, "UTF-8");
		} catch (UnsupportedEncodingException e) {
		}
		return str;
	}

	private String doClean(String str) {
		if (StringUtils.isBlank(str)) {
			return str;
		}
		return str.replace("<", "").replace(">", "");
	}

}
```
