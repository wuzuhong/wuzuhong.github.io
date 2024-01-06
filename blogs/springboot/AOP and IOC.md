# 【springboot】Spring的两大特性： aop 和 ioc
## 面向切面编程 aop
面向切面编程能够实现在某个方法执行前或执行后或抛出异常后执行自定义代码逻辑。面向切面编程的是通过动态代理来实现的，有两种动态代理：
1. jdk动态代理：利用反射机制实现。只能对实现了接口的类生成代理。
2. cglib动态代理：利用asm开源包，将代理对象类的class文件加载进来，通过修改其字节码生成子类来并覆盖其中的方法来实现，因为是生成子类，所以该类或方法最好不要声明成final。

Spring中的aop会自动在jdk动态代理和cglib动态代理之间转换，转换逻辑如下：
* 如果目标对象实现了接口，默认情况下会采用jdk动态代理来实现aop
* 如果目标对象实现了接口，可以强制使用cglib动态代理来实现aop
* 如果目标对象没有实现接口，则会采用cglib动态代理来实现aop

**无论是jdk动态代理和cglib动态代理都无法对静态方法提供代理**，因为静态方法是类级别的，调用时需要知道类信息，而类信息在编译时就已经加载了，并不支持在运行期的动态加载，**所以Spring是不支持对静态方法提供事务控制的**。

**jdk动态代理和cglib动态代理的实现示例代码：**
```java
public interface BookService {
	void add(String name);

	void del(String name);
}

public class BookServiceImpl implements BookService {
	@Override
	public void add(String name) {
		System.out.print("调用了新增的方法！");
		System.out.println("传入参数为 name: " + name);
	}

	@Override
	public void del(String name) {
		System.out.print("调用了删除的方法！");
		System.out.println("传入参数为 name: " + name);
	}

}

// cglib 动态代理。需要实现 MethodInterceptor 接口
public class CglibProxy implements MethodInterceptor {
	// 需要代理的目标对象
	private Object target;

	// 重写拦截方法
	@Override
	public Object intercept(Object obj, Method method, Object[] arr, MethodProxy proxy) throws Throwable {
		System.out.println("方法执行前的逻辑代码");// 这里本来应该是通过反射来调用用户定义的方法的。
		Object result = null;
		try {
			result = method.invoke(target, arr);
		} catch (Exception e) {
			System.out.println("抛出异常后的逻辑代码");// 这里本来应该是通过反射来调用用户定义的方法的。
		}
		System.out.println("方法执行后前的逻辑代码");// 这里本来应该是通过反射来调用用户定义的方法的。
		return result;
	}

	// 定义获取代理对象方法
	public Object getCglibProxy(Object objectTarget) {
		// 设置需要代理的目标对象
		this.target = objectTarget;
		// 创建增强器对象
		Enhancer enhancer = new Enhancer();
		// 设置父类，因为 cglib 是针对指定的类生成一个子类，所以需要指定父类
		enhancer.setSuperclass(objectTarget.getClass());
		// 设置回调
		enhancer.setCallback(this);
		// 创建并返回代理对象
		return enhancer.create();
	}

	// 测试方法
	public static void main(String[] args) {
		// 实例化CglibProxy对象
		CglibProxy cglib = new CglibProxy();
		// 获取代理对象
		BookService bookService = (BookService) cglib.getCglibProxy(new BookServiceImpl());
		// 执行删除方法
		bookService.del("admin");
	}
    // 以上测试代码输出的结果为：
    // 方法执行前的逻辑代码
    // 调用了删除的方法！传入参数为 name: admin
    // 方法执行后前的逻辑代码

}

// jdk 动态代理。需要实现 InvocationHandler 接口
public class JDKProxy implements InvocationHandler {
	// 需要代理的目标对象
	private Object target;

	// 重写调用方法
	@Override
	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
		System.out.println("方法执行前的逻辑代码");// 这里本来应该是通过反射来调用用户定义的方法的。
		Object result = null;
		try {
			result = method.invoke(target, args);
		} catch (Exception e) {
			System.out.println("抛出异常后的逻辑代码");// 这里本来应该是通过反射来调用用户定义的方法的。
		}
		System.out.println("方法执行后前的逻辑代码");// 这里本来应该是通过反射来调用用户定义的方法的。
		return result;
	}

	// 获取代理对象
	public Object getJDKProxy(Object targetObject) {
		// 设置需要代理的目标对象
		this.target = targetObject;
		// 创建代理对象实例
		return Proxy.newProxyInstance(targetObject.getClass().getClassLoader(), targetObject.getClass().getInterfaces(),
				this);
	}

	// 测试
	public static void main(String[] args) {
		// 实例化 JDKProxy 对象
		JDKProxy proxy = new JDKProxy();
		// 获取代理对象。该对象必须实现接口，否则当前行会报错
		BookService bookService = (BookService) proxy.getJDKProxy(new BookServiceImpl());
		// 执行新增方法
		bookService.add("admin");
	}
    // 以上测试代码输出的结果为：
    // 方法执行前的逻辑代码
    // 调用了新增的方法！传入参数为 name: admin
    // 方法执行后前的逻辑代码
}
```

## 依赖注入 ioc
**依赖注入的作用在于：解耦**
假设我们有一个系统，其中有三个接口： AA 、 BB 、 CC ，并且都有相应的实现类： AAImpl 、 BBImpl 、 CCImpl ，并且其相互依赖。

如果没有依赖注入，我们需要通过`AA aa = new AAImpl();`来实例化，然后再使用。这样就会出现一个问题，如果AA的实现类改了，改成了 AA22Impl，那么那些使用了 AA 接口的类都需要改。这种一个接口有多种实现类的情况在复杂的系统和框架中是非常常见的。

如果有依赖注入，以上问题就不会存在，因为有**ioc容器**来帮我们管理。我们只需要使用类似于
```xml
<bean id="aa" class="demo.AAImpl"></bean>
```
的形式将具体的实现类交给ioc容器，然后在需要使用 AA 接口的类中使用
```java
@Autowired
private AA aa;
```
来注入 AA 接口并使用即可，ioc容器会自动控制 AA 接口具体的实现类。这样的话，不管当前的 AA 接口的实现类是 AA22Impl 还是 AA33Impl，那么那些使用了 AA 接口的类都不需要做任何修改，这就是解耦。

**由以上例子可以发现，是java语言的抽象和多态的特性，才使得依赖注入能够实现解耦的功能**。

**ioc容器是通过反射机制并结合工厂模式来实现，并将反射出来的bean存储在Spring上下文中**。
