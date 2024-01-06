# 【设计模式】观察者模式
观察者模式，又叫发布-订阅模式，定义对象间的一对多的依赖关系，使得每当一个对象改变状态时，所有依赖于它的对象都会得到通知并自动更新。

通常，Subject类是主题，它把所有对观察者对象的引用存在了一个集合里，每个主题都可以有任何数量的观察者。抽象主题提供了一个接口，可以增加和删除观察者对象；Observer类是抽象观察者，为所有的具体观察者定义一个接口，在得到主题的通知时更新自己：
```java
// 主题Subject
public class Subject {
    //观察者集合
    private Vector<Observer> oVector = new Vector<>();
    
    //增加一个观察者
    public void addObserver(Observer observer) {
        this.oVector.add(observer);
    }
    
    //删除一个观察者
    public void deleteObserver(Observer observer) {
        this.oVector.remove(observer);
    }
    
    //通知所有观察者
    public void notifyObserver() {
        for(Observer observer : this.oVector) {
            observer.update();
        }
    }
}


// 抽象观察者Observer。每一个实现该接口的实现类都是具体观察者。
public interface Observer {
    //更新
    public void update();
}


// 具体主题。继承Subject类，在这里实现每个主题的具体业务，在具体项目中，该类会有很多变种。
public class ConcreteSubject extends Subject {
    //具体业务
    public void doSomething() {
        //业务逻辑代码
        // …………
        super.notifyObserver();
    }
}


// 具体观察者
public class ConcreteObserver implements Observer {
    @Override
    public void update() {
        System.out.println("收到消息，进行处理");
    }
}


// 测试代码
public class Test {
    public static void main(String[] args) {
        //创建一个主题
        ConcreteSubject subject = new ConcreteSubject();
        //定义一个观察者
        Observer observer = new ConcreteObserver();
        //观察
        subject.addObserver(observer);
        //开始活动
        subject.doSomething();
    }

    // 以上测试代码输出结果为：收到消息，进行处理
}
```

#### 优点
* 观察者和被观察者是抽象耦合的
* 建立了一套触发机制

#### 缺点
* 如果一个被观察者对象有很多的直接和间接的观察者的话，将所有的观察者都通知到会花费很多时间
* 如果观察者和观察目标间有循环依赖，可能导致系统崩溃，所以一般采用异步方式
* 没有相应的机制让观察者知道所观察的目标对象是怎么发生变化的

#### 使用场景
* 关联行为场景
* 事件多级触发场景
* 跨系统的消息变换场景，如消息队列的处理机制