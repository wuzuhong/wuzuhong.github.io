# 【设计模式】模板方法模式
定义一个操作中的算法的骨架，并将一些步骤延迟到子类中，使得子类可以在不改变一个算法的结构即可重新实现该算法的某些特定步骤。

Spring 中的动态数据源 AbstractRoutingDataSource 就使用了模板方法模式，其将 determineCurrentLookupKey 这个方法进行了抽象化并交由子类来实现。

## 示例
```java
// 抽象模板类
public abstract class AbstractTemplate {
    public void done() {
        operation1();
        operation2();
        operation3();
    }

    public void operation1() {
        System.out.println("步骤 1");
    }

    // 步骤 2 交由子类来实现
    public abstract void operation2();
    
    public void operation3() {
        System.out.println("步骤 3");
    }
}


// 具体模板类
public class ConcreteTemplate extends AbstractTemplate {
    @Override
    public void operation2() {
        System.out.println("步骤 2");
    }
}


// 测试代码
public class Test {
	public static void main(String[] args) {
		AbstractTemplate template = new ConcreteTemplate();
		template.done();
	}
}
// 以上测试代码输出：
// 步骤 1
// 步骤 2
// 步骤 3
```

## 模板方法模式的应用

#### 优点
* 封装不变部分，扩展可变部分
* 提取公共部分代码，便于维护
* 行为由父类控制，子类负责实现

#### 缺点
* 每一个不同的实现都需要一个子类实现，导致类的个数增加，使得系统更加庞大

#### 使用场景
* 有多个子类共有的方法，且逻辑相同
* 重要的、复杂的方法，可以考虑作为模板方法
* 重构时，模板方法模式是一个经常使用到的模式，把相同的代码抽取到父类中，通过钩子函数约束其行为