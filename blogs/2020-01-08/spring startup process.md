# 【spring】Spring启动过程
    转载自：https://www.cnblogs.com/luoluoshidafu/p/6442055.html

1. 首先，对于一个web应用，其部署在web容器中，web容器提供其一个全局的上下文环境，这个上下文就是ServletContext，它为后面的Spring IoC容器提供宿主环境；
2. 其次，在web.xml中会提供有contextLoaderListener。在web容器启动时，会触发容器初始化事件，此时contextLoaderListener会监听到这个事件，其contextInitialized方法会被调用，在这个方法中，spring会初始化一个启动上下文，这个上下文被称为根上下文，即WebApplicationContext，这是一个接口类，确切的说，其实际的实现类是XmlWebApplicationContext，这个就是spring的IoC容器，其对应的Bean定义的配置文件由web.xml中的context-param标签指定。在这个IoC容器初始化完毕后，spring以WebApplicationContext.ROOTWEBAPPLICATIONCONTEXTATTRIBUTE为属性Key，将其存储到ServletContext中，便于获取；
3. 再次，contextLoaderListener监听器初始化完毕后，开始初始化web.xml中配置的Servlet，这个servlet可以配置多个，以最常见的DispatcherServlet为例，这个servlet实际上是一个标准的前端控制器，用以转发、匹配、处理每个servlet请求。DispatcherServlet上下文在初始化的时候会建立自己的IoC上下文，用以持有spring mvc相关的bean。在建立DispatcherServlet自己的IoC上下文时，会利用WebApplicationContext.ROOTWEBAPPLICATIONCONTEXTATTRIBUTE先从ServletContext中获取之前的根上下文(即WebApplicationContext)作为自己上下文的parent上下文。有了这个parent上下文之后，再初始化自己持有的上下文。这个DispatcherServlet初始化自己上下文的工作在其initStrategies方法中可以看到，大概的工作就是初始化处理器映射、视图解析等。这个servlet自己持有的上下文默认实现类也是XmlWebApplicationContext。初始化完毕后，spring以与servlet的名字相关(此处不是简单的以servlet名为Key，而是通过一些转换，具体可自行查看源码)的属性为属性Key，也将其存到ServletContext中，以便后续使用。这样每个servlet就持有自己的上下文，即拥有自己独立的bean空间，同时各个servlet共享相同的bean，即根上下文(第2步中初始化的上下文)定义的那些bean。

## ServletContext
javaee标准规定了，servlet容器需要在应用项目启动时，给应用项目初始化一个ServletContext作为公共环境容器存放公共信息。ServletContext中的信息都是由容器提供的。

#### 举例：通过自定义contextListener获取web.xml中配置的参数
1. 容器启动时，找到配置文件中的context-param作为键值对放到ServletContext中：
    ```xml
    <!-- web.xml -->
    <context-param>
        <param-name>key</param-name>
        <param-value>value123</param-value>
    </context-param>
    <listener> 
        <listener-class>com.brolanda.contextlistener.listener.ContextListenerTest</listener-class>
    </listener>
    ```
2. 然后找到listener，容器调用它的contextInitialized(ServletContextEvent event)方法，执行其中的操作：
    ```java
    public class ContextListenerTest implements ServletContextListener {
        public void contextDestroyed(ServletContextEvent event) {
            System.out.println("*************destroy ContextListener*************");
        }
        public void contextInitialized(ServletContextEvent event) {
            System.out.println("*************init ContextListener*************");
            // 获取对应的参数信息
            ServletContext servletContext = event.getServletContext();
            System.out.println("key:"+servletContext.getInitParameter("key"));
        }
        
    }
    ```

#### 执行流程：web.xml在<context-param></context-param>标签中声明应用范围内的初始化参数
1. 启动一个WEB项目的时候，容器(如：Tomcat)会去读它的配置文件web.xml，读两个节点：`<listener></listener>`和`<context-param></context-param>`
2. 紧接着，容器创建一个ServletContext(上下文)，在该应用内全局共享
3. 容器将`<context-param></context-param>`转化为键值对，并交给ServletContext
4. 容器创建`<listener></listener>`中的类实例，即创建监听，该监听器必须实现自ServletContextListener接口
5. 在监听中会有contextInitialized(ServletContextEvent event)初始化方法，在这个方法中获得ServletContext = ServletContextEvent.getServletContext();“context-param的值” = ServletContext.getInitParameter("context-param的键");
6. 得到这个context-param的值之后，你就可以做一些操作了。注意，这个时候你的WEB项目还没有完全启动完成，这个动作会比所有的Servlet都要早。换句话说，这个时候你对`<context-param>`中的键值做的操作，将在你的WEB项目完全启动之前被执行

#### web.xml中可以定义两种参数
一个是全局参数(ServletContext)，通过：
```xml
<context-param></context-param>
```
另一个是servlet参数，通过在servlet中声明：
```xml
<init-param>
    <param-name>param1</param-name>
    <param-value>avalible in servlet init()</param-value>   
</init-param> 
```
第一种参数在servlet里面可以通过getServletContext().getInitParameter("context/param")得到。第二种参数只能在servlet的init()方法中通过this.getInitParameter("param1")取得

## spring上下文容器配置
spring为我们提供了实现ServletContextListener接口的上下文初始化监听器`org.springframework.web.context.ContextLoaderListener`。

spring为我们提供的IOC容器，需要我们指定容器的配置文件，然后由该监听器初始化并创建该容器。要求你指定配置文件的地址及文件名称，一定要使用：contextConfigLocation作为参数名称：
```xml
<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>/WEB-INF/applicationContext.xml,/WEB-INF/action-servlet.xml,/WEB-INF/jason-servlet.xml</param-value>
</context-param>
<listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>
```
该监听器，默认读取/WEB-INF/下的applicationContext.xml文件。但是通过context-param指定配置文件路径后，便会去你指定的路径下读取对应的配置文件，并进行初始化。

## spring上下文容器配置后，初始化了什么
既然ServletContext是由Servlet容器初始化的，那spring的ContextLoaderListener又做了什么初始化呢？
1. servlet容器启动，为应用创建一个“全局上下文环境”：ServletContext
2. 容器调用web.xml中配置的contextLoaderListener，初始化WebApplicationContext上下文环境（即IOC容器），加载context-param指定的配置文件信息到IOC容器中。WebApplicationContext在ServletContext中以键值对的形式保存
3. 容器初始化web.xml中配置的servlet，为其初始化自己的上下文信息servletContext，并加载其设置的配置信息到该上下文中，然后将WebApplicationContext设置为它的父容器
4. 此后的所有servlet的初始化都按照第3步中的方式创建，初始化自己的上下文环境，将WebApplicationContext设置为自己的父上下文环境

![spring01](./images/spring01.png)

对于作用范围而言，在DispatcherServlet中可以引用由ContextLoaderListener所创建的ApplicationContext中的内容，而反过来不行。

当Spring在执行ApplicationContext的getBean时，如果在自己context中找不到对应的bean，则会在父ApplicationContext中去找。这也解释了为什么我们可以在DispatcherServlet中获取到由ContextLoaderListener对应的ApplicationContext中的bean。

## 对spring配置时，`<context:component-scan>`的使用为什么在applicationContext.xml中要排除controller，而在spring-mvc.xml中要包含controller？
既然知道了spring的启动流程，那么web容器初始化webApplicationContext时作为公共的上下文环境，只需要将service、dao等的配置信息在这里加载，而servlet自己的上下文环境信息不需要加载，所以在applicationContext.xml中将@Controller注释的组件排除在外。而在dispatcherServlet加载的配置文件中需要将@Controller注释的组件加载进来，方便dispatcherServlet进行控制和查找。故，配置如下：
1. applicationContext.mxl中：
    ```xml
    <context:component-scan base-package="com.linkage.edumanage">
        <context:exclude-filter expression="org.springframework.stereotype.Controller" type="annotation" /> 
    </context:component-scan>
    ```
 
2. spring-mvc.xml中：
    ```xml
    <context:component-scan base-package="com.brolanda.cloud" use-default-filters="false"> 
        <context:include-filter expression="org.springframework.stereotype.Controller" type="annotation" /> 
    </context:component-scan>
    ```
    需要注意的是：`use-default-filters`参数默认为true，即使用默认的 Filter 进行包扫描，而默认的 Filter 会对标有 @Service、@Controller、@Service、@Component和@Repository 的注解的类进行扫描，所以不能在`applicationContext.xml`中将其设置为false；而在`spring-mvc.xml`中将其设置为false的目的是不使用默认的 Filter，而是只扫描 @Controller 注解