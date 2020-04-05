# 【设计模式】委派模式
委派模式中的主要角色有三种：抽象任务角色、委派者角色和具体任务角色。

实现层面上，定义一个抽象接口，它是抽象任务角色，它有若干实现类，这些实现类才有真正执行业务的方法，这些子类是具体任务角色；定义委派者角色也实现该接口，但它负责在各个具体角色实例之间做出决策，由它判断并调用具体实现的方法。

委派模式对外隐藏了具体实现，仅将委派者角色暴露给外部，如 Spring 的 DispatcherServlet。

## 示例

#### 抽象任务角色
```java
// 抽象任务角色
public interface Task {
    void doTask();
}
```

#### 具体任务角色
```java
// 具体实现类A
public class ConcreteTaskA implements Task {
    public void doTask() {
        System.out.println("执行 , 由A实现");
    }
}


// 具体实现类B
public class ConcreteTaskB implements Task {
    public void doTask() {
        System.out.println("执行 , 由B实现");
    }
}
```

#### 委派者角色
```java
// 委派者角色
public class TaskDelegate implements Task{
    public void doTask() {
        System.out.println("代理执行开始....");

        Task task = null;
        if (new Random().nextBoolean()){
            task = new ConcreteTaskA();
            task.doTask();
        }else{
            task = new ConcreteTaskB();
            task.doTask();
        }

        System.out.println("代理执行完毕....");
    }
}
```

#### 测试代码
```java
public class Test {
    public static void main(String[] args) {
        new TaskDelegate().doTask();
    }
}
```

## 委派模式的应用

#### 优点
* 对外隐藏实现。
* 易于扩展。
* 简化调用。

#### 与代理模式的区别
* 代理模式注重过程，而委派模式注重结果