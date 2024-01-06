# 【java并发编程】Stream流
Stream 流是 Java8 的新特性。 Stream 就如同一个迭代器，单向，不可往复，数据只能遍历一次，遍历过一次后即用尽了，就好比流水从面前流过，一去不复返。在迭代过程中可以对当前数据执行多个处理函数，并且这些处理函数可并行化执行，从而达到并发的效果。

Stream 流和 Reactor 类似，但没有 Reactor 强大。在简单场景可选用 Stream 流，在复杂场景则考虑 Reactor

## 实例
#### 非并行 stream
```java
public static void main(String[] args) {
    List<String> strs = Arrays.asList("11", "22", "33", "44", "55");
    long start = System.currentTimeMillis();
    long count = strs.stream().map(e -> {
        LOGGER.info("map:" + e);
        doSleep(2);
        return e + "aa";
    }).filter(e -> {
        LOGGER.info("filter:" + e);
        doSleep(2);
        return true;
    }).count();
    System.out.printf("耗时：%s秒", (System.currentTimeMillis() - start) / 1000);
}
private static void doSleep(int second) {
    try {
        Thread.sleep(second * 1000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```
以上示例的日志输出为：
```log
21:04:08.340 [main] INFO com.example.demo.DemoService - map:11
21:04:10.348 [main] INFO com.example.demo.DemoService - filter:11aa
21:04:12.349 [main] INFO com.example.demo.DemoService - map:22
21:04:14.349 [main] INFO com.example.demo.DemoService - filter:22aa
21:04:16.349 [main] INFO com.example.demo.DemoService - map:33
21:04:18.349 [main] INFO com.example.demo.DemoService - filter:33aa
21:04:20.350 [main] INFO com.example.demo.DemoService - map:44
21:04:22.351 [main] INFO com.example.demo.DemoService - filter:44aa
21:04:24.351 [main] INFO com.example.demo.DemoService - map:55
21:04:26.352 [main] INFO com.example.demo.DemoService - filter:55aa
耗时：20秒
```
从以上日志可以看出，使用非并行化接口，耗时与普通的循环是一样的，并没有提高效率

#### 并行 parallelStream
```java
public static void main(String[] args) {
    List<String> strs = Arrays.asList("11", "22", "33", "44", "55");
    long start = System.currentTimeMillis();
    long count = strs.parallelStream().map(e -> {
        LOGGER.info("map:" + e);
        doSleep(2);
        return e + "aa";
    }).filter(e -> {
        LOGGER.info("filter:" + e);
        doSleep(2);
        return true;
    }).count();
    System.out.printf("耗时：%s秒", (System.currentTimeMillis() - start) / 1000);
}
private static void doSleep(int second) {
    try {
        Thread.sleep(second * 1000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```
以上示例的日志输出为：
```log
21:02:10.123 [main] INFO com.example.demo.DemoService - map:33
21:02:10.123 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.DemoService - map:22
21:02:10.123 [ForkJoinPool.commonPool-worker-3] INFO com.example.demo.DemoService - map:11
21:02:10.123 [ForkJoinPool.commonPool-worker-2] INFO com.example.demo.DemoService - map:55
21:02:12.129 [ForkJoinPool.commonPool-worker-3] INFO com.example.demo.DemoService - filter:11aa
21:02:12.129 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.DemoService - filter:22aa
21:02:12.129 [main] INFO com.example.demo.DemoService - filter:33aa
21:02:12.129 [ForkJoinPool.commonPool-worker-2] INFO com.example.demo.DemoService - filter:55aa
21:02:14.130 [ForkJoinPool.commonPool-worker-3] INFO com.example.demo.DemoService - map:44
21:02:16.130 [ForkJoinPool.commonPool-worker-3] INFO com.example.demo.DemoService - filter:44aa
耗时：8秒
```
从以上日志可以看出，使用并行化接口，可以大大降低耗时