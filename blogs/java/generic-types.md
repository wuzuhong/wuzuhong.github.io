# 【java基础】Java泛型
Java 的泛型是伪泛型，因为 Java 在编译期间，所有的泛型信息都会被擦掉，这也就是通常所说类型擦除。泛型的本质是参数化类型，也就是说，所操作的数据类型被指定为一个参数。

## 泛型带来的好处
在没有泛型的情况的下，通过对类型 Object 的引用来实现参数的“任意化”，“任意化”带来的缺点是要做显式的强制类型转换，而这种转换是要求开发者对实际参数类型可以预知的情况下进行的。对于强制类型转换错误的情况，编译器可能不提示错误，在运行的时候才出现异常，这是本身就是一个安全隐患。

泛型的好处在于其提供了编译时的类型安全检测机制，该机制允许程序员在编译时检测到非法的类型，并且所有的强制转换都是自动和隐式的。

## 泛型的使用方式
泛型一般有三种使用方式：泛型类、泛型接口、泛型方法。
### 泛型类
```java
// 定义
public class Demo<T> {
    private T type;

    public Demo(T type) {
        this.type = type;
    }

    public T getType() {
        return type;
    }
}

// 实例化
Demo<Integer> demo = new Demo<Integer>(1234);
```
### 泛型接口
```java
// 定义
public interface Demo<T> {
    public T setType();
    public T getType();
}

// 实现
public class DemoImpl<T> implements Demo<T> {
    @Override
    public T setType() {
        return null;
    }

    @Override
    public T getType() {
        return null;
    }
}
```

### 泛型方法
```java
// 定义
public static <T> void doSomthing(T t) {
    System.out.println(t.getClass());
}

// 使用
doSomthing("aa");
```

## 常用的通配符 T，E，K，V，？
* ？ 表示不确定的 java 类型，也称为无界通配符
* T (type) 表示具体的一个 java 类型
* K V (key value) 分别代表 java 键值中的 Key Value
* E (element) 代表 Element

#### 上界通配符
`<? extends Animal>`，`<T extends Animal>`，`<K extends Animal>`，`<V extends Animal>`，`<E extends Animal>`

#### 下界通配符
`<? super Animal>`

#### ？ 和 T 的区别
* ？和 T 都表示不确定的类型，第1个区别在于我们可以对 T 进行操作，但是对 ？ 不行，比如如下这种：
    ```java
    // 可以
    T t = doSomething();
    t.toString();

    // 不可以
    ？ d = doSomething();
    d.toString();
    ```
* 第2个区别在于可以通过 T 来 确保泛型参数的一致性，而 ？ 不行：
    ```java
    // 通过 T 来确保泛型参数的一致性
    public <T extends Animal> void doSomething(List<T> dest, List<T> src)

    // ？通配符表示不确定的类型，所以这个方法不能保证两个 List 具有相同的元素类型
    public void doSomething(List<? extends Animal> dest, List<? extends Animal> src)
    ```
* 第3个区别在于 T 类型参数可以多重限定而 ？ 通配符不行：
    ```java
    public <T extends AnimalA & AnimalB> void doSomething(T t)
    ```
* 第4个区别在于 T 类型参数只支持上界通配符，而 ？ 通配符同时支持上界通配符和下界通配符
    ```java
    T extends Animal

    ? extends Animal
    ? super Animal
    ```

#### `Class<T>` 和 `Class<?>` 区别
```java
// 不会报错
public class Demo {
    public Class<?> doGetClass() {
        return null;
    }
}

// 会报错，因为 T 需要指定类型
public class Demo {
    public Class<T> doGetClass() {
        return null;
    }
}

// 不会报错，因为当前的类已经指定了 T 类型参数
public class Demo<T> {
    public Class<T> doGetClass() {
        return null;
    }
}
```