# 【java基础】hashCode 与 equals
## hashCode 介绍
hashCode 的作用是获取哈希码，也称为散列码，它实际上是返回一个 int 整型。这个哈希码的作用是确定该对象在哈希表中的索引位置。 hashCode 定义在 JDK 的 Object 类中，这就意味着 Java 中的任何类都包含有 hashCode 函数。另外需要注意的是， Object 的 hashcode 方法是本地方法，也就是用 c 语言或 c++ 实现的，该方法通常用来将对象的内存地址转换为整型之后返回。

## 为什么要有 hashCode
下面以“ HashSet 如何检查重复”为例子来说明为什么要有 hashCode。

当把对象加入 HashSet 时，HashSet 会先计算对象的 hashcode 值来判断对象加入的位置，同时也会与其他已经加入的对象的 hashcode 值作比较，如果没有相符的 hashcode ，HashSet 会假设对象没有重复出现。但是如果发现有相同 hashcode 值的对象，这时会调用 equals 方法来检查 hashcode 相等的对象是否真的相同。如果两者相同， HashSet 就不会让其加入操作成功。如果不同的话，就会重新散列到其他位置。这样我们就大大减少了 equals 的次数，相应就大大提高了执行速度。

## 为什么重写 equals 时必须重写 hashCode 方法
先来看一下 java 源码中的 Object 类中关于 hashCode 方法的注释：
1. 在 Java 应用程序执行期间，在对同一对象多次调用 hashCode 方法时，必须一致地返回相同的整数，前提是将对象进行 equals 比较时所用的信息没有被修改。从某一应用程序的一次执行到同一应用程序的另一次执行，该整数无需保持一致。
2. 如果根据 equals(Object) 方法，两个对象是相等的，那么对这两个对象中的每个对象调用 hashCode 方法都必须生成相同的整数结果。
3. 如果根据 equals(java.lang.Object) 方法，两个对象不相等，那么对这两个对象中的任一对象上调用 hashCode 方法不要求一定生成不同的整数结果。但是，程序员应该意识到，为不相等的对象生成不同整数结果可以提高哈希表的性能。

通俗的讲，以上注释中第二点和第三点的含义就是 equals 和 hashcode 方法要保持相当程度的一致性，equals 方法相等，hashcode 必须相等；反之，equals方法不相等，hashcode可以相等，可以不相等。但是两者的一致有利于提高哈希表的性能。

所以`重写 equals 时必须重写 hashCode 方法`这一说法是来自于 java 官方规范。如果用不到哈希表的话，仅仅重写 equals 方法也是可以的。

## 为什么两个对象有相同的 hashcode 值，它们也不一定是相等的
因为 hashCode 所使用的杂凑算法也许刚好会让多个对象传回相同的杂凑值。越糟糕的杂凑算法越容易碰撞，所谓碰撞也就是指的是不同的对象得到相同的 hashCode。

还是以 HashSet 来举例，如果 HashSet 在对比的时候，同样的 hashcode 有多个对象，它会使用 equals() 来判断是否真的相同。也就是说 hashcode 只是用来缩小查找成本。