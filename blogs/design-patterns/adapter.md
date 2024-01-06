# 【设计模式】适配器模式
适配器这个词应该都很熟悉，手机充电时，电源线头头就叫电源适配器，干什么用的呢？把220V电压转换为手机充电时使用的电压，那适配器模式是不是很好理解了。

适配器模式，将一个类的接口转换成客户希望的另外一个接口，使原本由于接口不兼容而不能一起工作的那些类可以一起工作。也可以将一种数据格式转换为其他的数据格式。

适配器模式有“类适配器”和“对象适配器”两种不同的形式。

## 类适配器
通过继承来进行适配。

#### 目标角色
该角色表示要把其他类转换为何种接口，也就是期望接口，通常情况下是一个接口或一个抽象类，一般不会是实现类。
```java
public interface Target5V {
    public void out5V();
}


// 目标角色的实现类
public class ConcreteTarget5V implements Target5V {
    @Override
    public String out5V() {
        return "5V 来了";
    }
}
```

#### 源角色
该角色表示想把谁转换为目标角色，这个“谁”就是源角色，它是已经存在的、运行良好的类。
```java
public class Source220V {
    public String out220V() {
        return "220V 来了";
    }
}
```

#### 适配器角色
该角色是适配器模式的核心角色，它的职责是通过继承或是类关联的方式把源角色转换为目标角色。
```java
public class Adapter extends Source220V implements Target5V {
    @Override
    public String out5V() {
        String source = super.out220V();
        // 执行特定的逻辑代码，将220V转为5V
        // …………
        // 返回5V
        return "5V";
    }
}
```

#### 测试代码
```java
public class Test {
    public static void main(String[] args) {
        //增加适配器后的业务逻辑
        Target5V target = new Adapter();
        target.out5V();
    }
}
```

#### 小结
Adapter 类继承了 Source220V 类，也实现了 Target5V 接口，于是 Adapter 类同时拥有 Source220V 和 Target5V 的功能，并且在实现 Target5V 接口的时候用到了 Source220V 类中的方法，所以类适配器其实是一种隐式适配。

## 对象适配器
通过对象层次的关联关系进行委托。

#### 目标角色
该角色表示要把其他类转换为何种接口，也就是期望接口，通常情况下是一个接口或一个抽象类，一般不会是实现类。
```java
public class Target5V {
    public String out5V() {
        return "5V 来了";
    }
}
```

#### 源角色
该角色表示想把谁转换为目标角色，这个“谁”就是源角色，它是已经存在的、运行良好的类。
```java
public class Source220V {
    public String out220V() {
        return "220V 来了";
    }
}
```

#### 适配器角色
该角色是适配器模式的核心角色，它的职责是通过继承或是类关联的方式把源角色转换为目标角色。
```java
public class Adapter extends Target5V {
    private Source220V source220V;

    public Adapter(Source220V source220V){
        this.source220V = source220V
    }

    @Override
    public String out5V() {
        String source = source220V.out220V();
        // 执行特定的逻辑代码，将220V转为5V
        // …………
        // 返回5V
        return "5V";
    }
}
```

#### 测试代码
```java
public class Test {
    public static void main(String[] args) {
        //增加适配器后的业务逻辑
        Target5V target = new Adapter(new Source220V());
        target.out5V();
    }
}
```

## 类适配器和对象适配器的区别
* 从上面的内容可以看出来，类适配器是类间继承，对象适配器是对象的合成关系，也可以说是类的关联关系，这是两者的根本区别。
* 由于对象适配器是通过类间的关联关系进行耦合的，因此在设计时就可以做到比较灵活，而类适配器就只能通过覆写源角色的方法进行扩展。
* 在实际项目中，对象适配器使用到的场景较多。