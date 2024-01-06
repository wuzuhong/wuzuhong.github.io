# 【java基础】Java中创建对象的方式
1. new关键字，A a=new A()。
2. Constructor类的newInstance()方法，反射实现。
3. Class类的newInstance()方法，内部还是调用Constructor类的newInstance()方法，反射实现。
4. clone()方法，复制对象产生一个新对象。
5. 序列化反序列化。