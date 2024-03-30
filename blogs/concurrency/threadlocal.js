function getBlog(){
	return blog = {"content": "# 【java并发编程】ThreadLocal 类\n\n## ThreadLocal 的作用\nThreadLocal 是用于存储那些需要在同一线程中是共享的，并且在不同线程之间是隔离的数据。\n\n## ThreadLocal 的原理\nThreadLocal 存入值时，使用当前 ThreadLocal 实例作为 key 并且使用业务数据作为 value 存入当前线程对象中的 ThreadLocalMap 中去。源码如下：\n```java\nThread t = Thread.currentThread();\nThreadLocalMap map = t.threadLocals;\nif (map != null) {\n    map.set(this, value);\n} else {\n    t.threadLocals = new ThreadLocalMap(this, value);\n}\n```\n\n## ThreadLocal 的使用方式\n```java\nprivate static final ThreadLocal<String> demoThreadLocal = new ThreadLocal<String>();\n\npublic void demoFunc() {\n    demoThreadLocal.set(\"haha\");\n    demoThreadLocal.get();\n    demoThreadLocal.remove();\n}\n```\n\n## ThreadLocal 的内存泄漏问题\n* ThreadLocal 的内存泄漏问题描述：如果 ThreadLocal 没有外部强引用，那么在发生垃圾回收的时候，ThreadLocal就必定会被回收。而 ThreadLocal 又作为 ThreadLocalMap 中的 key ， ThreadLocal 被回收就会导致一个 key 为 null 的 entry ，外部就无法通过这个 key 来访问这个 entry ，垃圾回收也无法回收，这就造成了内存泄漏。\n* ThreadLocal 的内存泄漏解决办法：每次使用完 ThreadLocal 都调用它的 remove() 方法清除数据，或者将 ThreadLocal 变量定义成`private static`，这样就一直存在 ThreadLocal 的强引用，也就能保证任何时候都能通过 ThreadLocal 的弱引用访问到 entry 的 value 值，进而回收掉。", "title": "【java并发编程】ThreadLocal 类"}
}