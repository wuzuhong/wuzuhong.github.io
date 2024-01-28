# 【java基础】== 和 equals 的区别
== 和 equals 都是判断两个对象是否相等，但区别在于：
* 基本数据类型的 == 比较的是值，引用数据类型的 == 比较的是内存地址
* equals 不能用于比较基本数据类型的变量， equals 方法存在于 Object 类中，而 Object 类是所有类的直接或间接父类。如果类没有重写 equals 方法，通过 equals 比较该类的两个对象时，等价于通过 == 比较这两个对象，使用的默认是 Object 类 equals 方法。如果类重写了 equals 方法，一般我们都重写 equals 方法来比较两个对象中的属性是否相等，若它们的属性相等，则返回 true。

Object 类 equals 方法：
```java
public boolean equals(Object obj) {
    return (this == obj);
}
```

* String 中的 equals 方法是被重写过的，因为 Object 的 equals 方法是比较的对象的内存地址，而 String 的 equals 方法比较的是对象的值。
* 当创建 String 类型的对象时，虚拟机会在常量池（Integer的常量池范围为 -128 到 127）中查找有没有已经存在的值和要创建的值相同的对象，如果有就把它赋给当前引用。如果没有就在常量池中重新创建一个 String 对象。

示例：
```java
public class Demo {
    public static void main(String[] args) {
        String a = new String("ab"); // a 为一个引用
        String b = new String("ab"); // b为另一个引用，对象的内容一样
        String aa = "ab"; // 放在常量池中
        String bb = "ab"; // 从常量池中查找
        if (aa == bb) // true。因为都是常量池中的同一个对象
            System.out.println("aa==bb");
        if (a == b) // false。非同一对象
            System.out.println("a==b");
        if (a.equals(b)) // true。因为 String 中的 equals 方法是被重写过，比较的是对象的值
            System.out.println("a-eq-b");
        if (42 == 42.0) { // true。因为基本数据类型比较时，低精度会向高精度自动补齐后再进行比较
            System.out.println("true");
        }
    }
}
```