# 【java基础】Java中只有值传递
* 参考1：https://snailclimb.gitee.io/javaguide/#/docs/java/basis/Java%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86?id=%E4%B8%BA%E4%BB%80%E4%B9%88-java-%E4%B8%AD%E5%8F%AA%E6%9C%89%E5%80%BC%E4%BC%A0%E9%80%92%EF%BC%9F

## 概述
按值调用（call by value）表示方法接收的是调用者提供的值，按引用调用（call by reference）表示方法接收的是调用者提供的变量地址。一个方法可以修改传递引用所对应的变量值，而不能修改传递值调用所对应的变量值。

Java 程序设计语言总是采用按值调用。也就是说，方法得到的是所有参数值的一个拷贝，也就是说，方法不能修改传递给它的任何参数变量的内容。

## 示例1：Java的基本数据类型的方法参数
```java
public static void main(String[] args) {
    int num1 = 10;
    int num2 = 20;

    swap(num1, num2);

    System.out.println("num1 = " + num1);
    System.out.println("num2 = " + num2);
}

public static void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;

    System.out.println("a = " + a);
    System.out.println("b = " + b);
}
```
输出结果为：
```
a = 20
b = 10
num1 = 10
num2 = 20
```
解析：在 swap 方法中，a、b 的值进行交换，并不会影响到 num1、num2。因为，a、b 中的值，只是从 num1、num2 的复制过来的。也就是说，a、b 相当于 num1、num2 的副本，副本的内容无论怎么修改，都不会影响到原件本身。

## 示例2：Java的对象类型的方法参数（会改变原对象）
```java
public static void main(String[] args) {
    int[] arr = { 1, 2, 3, 4, 5 };
    System.out.println(arr[0]);
    change(arr);
    System.out.println(arr[0]);
}

public static void change(int[] array) {
    array[0] = 0;
}
```
输出结果为：
```
1
0
```
解析：array 被初始化为 arr 的引用的拷贝，所以 array 也是一个对象的引用，并且 array 和 arr 的引用指向的是同一个数组对象。 因此，外部对引用对象的改变会反映到所对应的对象上。所以这里其实还是按值调用，因为这里还是进行的拷贝，为了进一步说明，请看示例3。

## 示例3：Java的对象类型的方法参数（不会改变原对象）
```java
public static void main(String[] args) {
    Student s1 = new Student("小张");
    Student s2 = new Student("小李");
    Test.swap(s1, s2);
    System.out.println("s1:" + s1.getName());
    System.out.println("s2:" + s2.getName());
}

public static void swap(Student x, Student y) {
    Student temp = x;
    x = y;
    y = temp;
    System.out.println("x:" + x.getName());
    System.out.println("y:" + y.getName());
}
```
输出结果为：
```
x:小李
y:小张
s1:小张
s2:小李
```
解析：在 swap 方法中，参数 x 和 y 分别被初始化为 s1 和 s2 两个对象引用的拷贝，该方法交换的是 x 和 y 这两个被拷贝出来的引用，而不会影响 s1 和 s2。