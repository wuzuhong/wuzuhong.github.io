# 【设计模式】代理模式
Spring AOP动态代理中就使用了代理模式。

为其他对象提供一种代理以控制对这个对象的访问。

说的通俗一点就是在调用真实对象之前或之后或在异常抛出之后执行一些自定义的逻辑。

## 示例
```java
public abstract class Subject {
    public abstract void request();
}


public class RealSubject extends Subject {
    @Override
    public void request() {
        System.out.println("真实的请求RealSubject");
    }
}


// 代理
public class Proxy extends Subject {
    private RealSubject realSubject = null;
    
    public Proxy() {
        this.realSubject = new RealSubject();
    }
    
    @Override
    public void request() {
        this.before();
        this.realSubject.request();
        this.after();
    }

    // 预处理
    private void before() {
        System.out.println("-------before------");
    }
    
    // 善后处理
    private void after() {
        System.out.println("-------after-------");
    }
}
```
以上示例其实是一个静态代理，因为它只能代理`RealSubject`。

## 代理模式的应用

#### 优点
* 职责清晰。真实的角色就是实现实际的业务逻辑，不用担心其他非本职责的事务
* 高扩展性。代理类完全可以在不做任何修改的情况下使用
* 智能化。比如动态代理

#### 缺点
* 有些类型的代理模式可能会造成请求的处理速度变慢
* 实现代理模式需要额外的工作，有些代理模式的实现非常复杂

#### 使用场景
* 远程代理。为一个对象在不同的地址空间提供局部代表
* 虚拟代理。根据需要创建开销很大的对象，通过它来存放实例化需要很长时间的真实对象
* 安全代理。用来控制真实对象访问时的权限
* 智能指引。当调用真实的对象时，代理处理另外一些事