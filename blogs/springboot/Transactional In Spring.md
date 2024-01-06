# 【springboot】使用事务注解 @Transactional 是否会生效的问题

#### 事务注解在SpringMVC和在Spring中的不同点
* SpringMVC和Spring的配置文件是不同的，其加载出来的bean也是存储在不同的上下文中。
* Spring的bean是存储在WebApplicationContext上下文中。
* SpringMVC的bean是存储在DispatcherServlet的上下文中，其会以WebApplicationContext作为它的父上下文。
* 事务注解只会对当前上下文中的bean生效。

#### 如何判断事务注解会对哪个上下文中的bean生效
* `<tx:annotation-driven />`配置放在Spring的配置文件中的话，只有在Spring的bean中，也就是Service中才会生效。
* `<tx:annotation-driven />`配置放在SpringMVC的配置文件中的话，只有在SpringMVC的bean，也就是Controller中才会生效。
* `<tx:annotation-driven />`配置要是在两种配置文件中都放了，那么在Spring的bean和SpringMVC的bean中都会生效，也就是Service和Controller都会生效。

#### 在Controller内部，事务注解的正确使用方式
* 对于controller来说，只有在接口方法上加上事务注解并且不能为静态方法时时，也就是请求入口方法时，事务才会生效，其他方法不会生效。
* 如果在接口方法中加了事务注解，那么这个接口方法中调用的其他方法（不能把异常捕获掉了）将不再需要加事务注解，事务也会生效。
* Controller接口的访问控制修饰符必须为public，否则将会导致这个接口不会被加载，从而导致404或者405（因为匹配到其他路径的接口去了，但那个接口的请求方法又匹配不上）。但是可以是静态方法，为静态方法时也是可以被请求到的，只不过事务不会生效。

#### 在Service内部，事务注解的正确使用方式
* 对于Service来说，只有在当前Service中的入口的方法上（对于不同的请求来说，入口方法是不相同的）加上事务注解并且这个方法的访问控制修饰符必须为public并且不能为静态方法时，事务才会生效，其他方法不会生效。
* 如果在方法中加了事务注解，那么这个方法中调用的其他方法（不能把异常捕获掉了）将不再需要加事务注解，事务也会生效。

#### 事务注解的原理
spring 中的事务底层是通过 aop 来实现的，spring 会为入口方法创建一个代理对象，这个代理对象会负责开启事务、执行目标方法、提交或回滚事务等操作。因此只有在入口方法上加上事务注解才能使事务生效，只在非入口的子方法上加事务注解是不会使事务生效的。在入口方法上加上事务注解后，非入口的子方法上就不再需要加上事务注解也能使子方法的事务生效，因为这个非入口的子方法的调用是在同一个代理对象内部完成的。

比如，DemoController -> DemoService.demo1() -> DemoService.demo2()，如果 demo2 方法有事务注解，而 demo1 方法没有事务注解，并且 demo2 方法抛出了异常，此时事务**不会生效**。如果 demo1 方法有事务注解，而 demo2 方法没有事务注解，并且 demo2 方法抛出了异常，此时事务**会生效**。