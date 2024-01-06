# 【设计模式】单例模式
能够保证使用了单例模式的类在整个应用中有且只有一个实例。

在应用程序中，有的类可能只允许我们创建一个实例，例如：有状态的工具类（如：与配置文件相关的工具类）、线程池、数据库连接池、缓存等。

一方面如果创建多个对象可能引起程序错误，另一方面创建多个对象也造成资源的浪费。

## 单例模式的饿汉式
```java
public class Singleton {
	private static Singleton instance=new Singleton();

	private Singleton(){};

	public static Singleton getInstance(){
		return instance;
	}
}
```
* 优点：在类加载的时候就完成了实例化，避免了线程安全问题。

* 缺点：由于在类加载的时候就实例化了，所以没有达到懒加载的效果，也就是说可能根本没有用到这个实例，但是它也会加载，会造成内存的浪费，但是这个浪费可以忽略，所以这种方式也是**可以使用**的。

## 单例模式的懒汉式
单例模式的懒汉式有很多种写法，但有些写法是线程不安全的，是不可用的，所以这里不再赘述，这里只对可用的写法进行说明。
```java
public class Singleton {
	private static Singleton instance=null;
	
	private Singleton() {};
	
	public static Singleton getInstance(){
		if (instance == null) {
	        synchronized (Singleton.class) {
	            if (instance == null) {
	            	instance = new Singleton();
	            }
	        }
	    }
	    return instance;
	}
}
```
* 优点：使用双重校验锁来维护线程安全，能够达到延迟加载的效果。由于这个校验锁只会对第二次请求进行阻塞，之后的请求都不会受到任何影响，所以能够达到较高的效率，**推荐使用**。
* 缺点：没有缺点。