# 【设计模式】工厂方法模式和抽象工厂模式
在面向对象编程中，术语“工厂”表示一个负责创建其他类型对象的类。通常情况下，作为一个工厂的类有一个对象以及与它关联的多个方法，客户端使用某些参数调用此方法之后，工厂会根据参数来创建所需类型的对象，然后将它们返回给客户端。

工厂模式具有以下优点：
* 松耦合，即对象的创建可以独立于类的实现。
* 客户端无需了解创建对象的类，但是照样可以使用它来创建对象。它只需要知道需要传递的接口、方法和参数，就能够创建所需类型的对象了。这简化了客户端的实现。
* 可以轻松地在工厂中添加其他类来创建其他类型的对象，而这无需更改客户端代码。最简单的情况下，客户端只需要传递一个参数就可以了。
* 工厂还可以重用现有对象。但是，如果客户端直接创建对象的化，总是创建一个新对象。

## 简单工厂模式
该模式对对象创建管理方式最为简单，因为其仅仅是对不同类对象的创建进行了一层简单的封装。以手机为例：
```java
public interface Phone {
    void call();
}

public class AAPhone implements Phone {
    @Override
    public void call() {
        System.out.println("call AA phone!");
    }
}

public class BBPhone implements Phone {
    @Override
    public void call() {
        System.out.println("call BB phone!");
    }
}

// 工厂类
public class PhoneFactory {
    public Phone makePhone(String phoneType) {
        if(phoneType.equalsIgnoreCase("AAPhone")){
            return new AAPhone();
        } else if (phoneType.equalsIgnoreCase("BBPhone")) {
            return new BBPhone();
        }
        return null;
    }
}
```

## 工厂方法模式
和简单工厂模式中工厂负责生产所有手机相比，工厂方法模式将生成具体类别的手机的任务分发给具体的手机类别工厂。

如果我们只生产数量很少的手机，那么可以使用简单工厂，但如果我们需要生产上百种手机，那么在简单工厂中就会有上百个`if`代码块，并且新增一种手机都只能在一个工厂类中添加。

而工厂方法模式就是对简单工厂模式的进一步抽象，将这上百种手机进一步分类，从而减少每个工厂类中的判断逻辑，并且每个工厂类也可以拥有自己独立的逻辑。当然，也并非是只有种类太多的时候才使用工厂方法模式，在创建每个对象的逻辑比较复杂的时候，也可以使用工厂方法模式，从而简化代码逻辑。以下是示例：
```java
public interface AbstractPhoneFactory {
    Phone makePhone(String phoneType);
}

// 全面屏类型的手机工厂
public class FullScreenPhoneFactory implements AbstractPhoneFactory{
    @Override
    public Phone makePhone(String phoneType) {
        if(phoneType.equalsIgnoreCase("AAPhone")){
            return new AAPhone();
        } else if (phoneType.equalsIgnoreCase("BBPhone")) {
            return new BBPhone();
        }
    }
}

// 带有人工智能功能类型的手机工厂
public class AIPhoneFactory implements AbstractPhoneFactory{
    @Override
    public Phone makePhone(String phoneType) {
        if(phoneType.equalsIgnoreCase("CCPhone")){
            return new CCPhone();
        } else if (phoneType.equalsIgnoreCase("DDPhone")) {
            return new DDPhone();
        }
    }
}
```

## 抽象工厂模式
在工厂方法模式中，其实我们有一个潜在意识的意识。那就是我们生产的都是同一类产品。抽象工厂模式是工厂方法的仅一步深化，在这个模式中的工厂类不单单可以创建一种产品，而是可以创建多种产品。抽象工厂模式通过在`AbstarctFactory`中增加创建产品的接口，并在具体子工厂中实现新加产品的创建，当然前提是子工厂支持生产该产品，否则实现的这个接口可以什么也不干。以下是示例：
```java
public interface AbstractPhoneFactory {
    Phone makePhone(String phoneType);
    PC makePC(String pcType);
}

// 全面屏类型的手机工厂
public class FullScreenPhoneFactory implements AbstractPhoneFactory{
    @Override
    public Phone makePhone(String phoneType) {
        if(phoneType.equalsIgnoreCase("AAPhone")){
            return new AAPhone();
        } else if (phoneType.equalsIgnoreCase("BBPhone")) {
            return new BBPhone();
        }
    }

    @Override
    public PC makePC(String pcType) {
        // 不支持生产PC，啥也不干
    }
}

// 带有人工智能功能类型的手机工厂
public class AIPhoneFactory implements AbstractPhoneFactory{
    @Override
    public Phone makePhone(String phoneType) {
        if(phoneType.equalsIgnoreCase("CCPhone")){
            return new CCPhone();
        } else if (phoneType.equalsIgnoreCase("DDPhone")) {
            return new DDPhone();
        }
    }

    @Override
    public PC makePC(String pcType) {
        if(pcType.equalsIgnoreCase("EEPC")){
            return new EEPC();
        } else if (pcType.equalsIgnoreCase("FFPC")) {
            return new FFPC();
        }
    }
}
```

## 总结
从简单工厂模式到工厂方法模式，再到抽象工厂模式，其业务逻辑是越来越复杂的，各有各的适用场景，所以要根据业务逻辑，有选择性的使用。

这些工厂模式体现出了Java的基本特性：抽象。无论是方法还是返回值都体现的淋漓尽致，所以基础很重要。