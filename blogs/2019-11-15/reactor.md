# 【java并发编程】Reactor响应式编程
## 什么是响应式编程
响应式编程是一种关注于数据流（ data streams ）和变化传递（ propagation of change ）的异步编程方式。 这意味着它可以用既有的编程语言表达静态（如数组）或动态（如事件源）的数据流。

响应式编程类似于观察者模式，也有相应的发布者(Publisher)和订阅者(Subscriber)，当有新的值到来的时候，是由发布者通知订阅者。此外，对推送来的数据的操作是通过一种声明式而不是命令式的方式表达的，开发者通过描述“控制流程”来定义对数据流的处理逻辑，也就是说是通过声明一些处理逻辑方法，当数据到来时会自动调用该方法，而不是显示的去调用该方法。

响应式编程中的所有操作都是异步的，其有完善的对错误处理和完成信号的定义。

为了更好的理解响应式编程，想象一下工厂中的流水线。一条流水线有许多工人，他们的座位都是有顺序的，通常初始零件都是堆在一起放在第一个工人的脚下。当老板需要这些零件加工后的成果时，流水线就开始工作了，这一堆零件将会通过流水线上的传送带一个一个的按顺序的传递给每一个工人，这些工人按顺序对这些零件一个一个的进行处理，直到最后一个零件处理完成后，流水线工作就结束了。

上面流水线的例子中的零件就是响应式编程中的数据流，工人们就是响应式编程中的操作符，老板就是响应式编程中的订阅者，只有订阅者订阅后数据流才会开始流动，操作符才会开始执行其处理逻辑。

## Reactor
Reactor 是一个基于 Java 8 的并实现了响应式流规范的响应式库。 Reactor 是由 Spring 团队开发， Spring 5.x 中的 webflux 就是基于 Reactor 的。 Reactor 让响应式编程变得更简单。

#### 发布者
Reactor 中主要使用的响应式类是 Flux 和 Mono ，他们都实现了 Publisher 并且都有丰富的操作方式。一个 Flux 对象代表一个包含 0 或 N 个元素的响应式序列，而一个 Mono 对象代表一个包含零或一个元素的响应式序列。以下是创建 Flux 和 Mono 对象的示例代码：
```java
Flux<String> seq1 = Flux.just("foo", "bar", "foobar");// 发布
Flux<String> seq2 = Flux.fromIterable(Arrays.asList("foo", "bar", "foobar"));// 发布
```

#### 订阅者
在 Flux 和 Mono 对象中都有一个 subscribe 方法，该方法就是用来对 Flux 和 Mono 对象进行订阅的。只有订阅后，整个数据流才会开始流动。以下是 subscribe 方法的示例代码：
```java
Flux<Integer> ints = Flux.range(1, 3);// 发布
ints.subscribe();// 订阅
```
subscribe 有多个重载函数，他们有不同的参数，这些参数都可以使用 lambda 表达式：
```java
// 直接订阅，不做任何操作
subscribe();

// 订阅并且可以回调一个消费者来消费数据
subscribe(Consumer<? super T> consumer);

// 订阅并且可以回调一个消费者来消费数据以及一个错误处理函数
subscribe(Consumer<? super T> consumer,
          Consumer<? super Throwable> errorConsumer);

// 订阅并且可以回调一个消费者来消费数据以及一个错误处理函数以及一个完成消费后的处理函数
subscribe(Consumer<? super T> consumer,
          Consumer<? super Throwable> errorConsumer,
          Runnable completeConsumer);

// 订阅并且可以回调一个消费者来消费数据以及一个错误处理函数以及一个完成消费后的处理函数以及一个 Subscription 的引用
subscribe(Consumer<? super T> consumer,
          Consumer<? super Throwable> errorConsumer,
          Runnable completeConsumer,
          Consumer<? super Subscription> subscriptionConsumer);
```
完成和错误都是终止事件，都会导致数据流序列停止。在这里只对第四个重载函数进行示例：
```java
// 发布
Flux<Integer> ints = Flux.range(1, 10);
// 订阅
ints.subscribe(value -> {
    System.out.println("获取到新的数据：" + value);
}, err -> {
    System.out.println("出错了：" + err.getMessage());
}, () -> {
    System.out.println("完成");
}, subscription -> {
    subscription.request(5);// 指定可以接收的元素数量
    subscription.cancel();// 取消订阅，之后源头会停止生成新的数据，并清理相关资源
});
```

#### 操作符
详见官方文档 

#### 调度器
在 Schedulers 类中提供了以下静态方法用于创建一个 Scheduler （调度器）对象：
```java
// 当前线程。单例
Schedulers.immediate();

// 可重用的单线程。单例
Schedulers.single();

// 弹性线程池。它根据需要创建一个线程池，重用空闲线程。线程池如果空闲时间过长（默认为 60s）就会被废弃。对于 I/O 阻塞的场景比较适用。推荐使用，因为它能使并发性最大化。单例
Schedulers.elastic();

// 固定大小线程池。所创建线程池的大小与 CPU 个数相等。至少会创建 4 个线程。单例
Schedulers.parallel();
```

Reactor 提供了两种在响应式链中调整调度器 Scheduler 的方法： publishOn 和 subscribeOn ，它们都接受一个 Scheduler 作为参数，从而可以改变调度器。 publishOn 和 subscribeOn 这两个操作符的不同之处在于：
* publishOn 会改变后续的操作符的执行所在线程，它强制下一个操作符运行在一个不同的线程上

* subscribeOn 会影响到源头的线程执行环境，它强制上一个操作符运行在一个不同的线程上。但是，它不会影响到后续的 publishOn ， publishOn 仍能够切换其后操作符的线程执行环境

#### 背压
背压就像在装配线上，某个工位的处理速度如果慢于流水线速度，会对上游发送反馈信号一样。

在响应式流规范中实际定义的机制同上面的类比非常接近：订阅者可以无限接受数据并让它的源头 “满负荷”推送所有的数据，也可以通过使用 request 机制来告知源头它一次最多能够处理 n 个元素。示例代码：
```java
Flux<Integer> ints = Flux.range(1, 10).subscribe(value -> {
    System.out.println("获取到新的数据：" + value);
}, err -> {
    System.out.println("出错了：" + err.getMessage());
}, () -> {
    System.out.println("完成");
}, subscription -> {
    subscription.request(5);// 背压，指定可以接收的元素数量
});
```

#### “热”和“冷”
在广义上有两种发布者：“热”与“冷”。
* “热”发布者：对于一个订阅者，只能获取从它开始订阅之后发出的数据。不依赖于订阅者的数量。即使没有订阅者它们也会发出数据，如果有一个订阅者接入进来，那么它就会收到订阅之后发出的元素。“热”发布者包括以下几种：
    ```java
    Flux.just();
    ```
* “冷”发布者：对于每一个订阅者，都会收到从头开始所有的数据。为每一个订阅者都生成数据。如果没有创建任何订阅，那么就不会生成数据。“冷”发布者包括以下几种：
    ```java
    Flux.fromIterable();
    Flux.defer();
    ```

#### 综合示例
```java
public class ReactorDemo2 {
	private static final Logger LOGGER = LoggerFactory.getLogger(ReactorDemo2.class);

	public static void main(String[] args) {
		// 第1次启动异步流
		doFlux(Arrays.asList("aa", "bb"));

		// 第2次启动异步流
		doFlux(Arrays.asList("cc", "dd"));

		// 阻塞主线程
		doPause();
	}

	/**
	 * 异步流操作
	 * @param list 异步流初始数据
	 */
	private static void doFlux(List<String> list) {
		LOGGER.info("开始");
		
		Flux<String> flux = Flux.just(list.toArray(new String[list.size()]))// 创建数据流序列
				.publishOn(Schedulers.elastic())// 改变接下来那个操作的调度器
				.flatMap(e1 -> {// 第1个操作
					doWait(2);// 等待2秒钟，用来模拟耗时的操作
					return Flux.just(e1 + 1);
				})
				.publishOn(Schedulers.elastic())// 改变接下来那个操作的调度器
				.flatMap(e2 -> {// 第2个操作
					doWait(2);// 等待2秒钟，用来模拟耗时的操作
					return Flux.just(e2 + 1);
				});
		
		// 第1个订阅者
		flux.subscribe(e -> doSubscribe01(e), null, () -> {
			LOGGER.info("第1个订阅者结束");
		});
		
		// 第2个订阅者
		flux.subscribe(e -> doSubscribe02(e), null, () -> {
			LOGGER.info("第2个订阅者结束");
		});
		
		// 第3个订阅者
		flux.subscribeOn(Schedulers.parallel()).subscribe(e -> doSubscribe03(e), null, () -> {
			LOGGER.info("第3个订阅者结束");
		});
	}

	/**
	 * 第1个订阅者的执行逻辑
	 * @param value
	 */
	private static void doSubscribe01(String value) {
		LOGGER.info("第1个订阅者，输出：" + value);
	}

	/**
	 * 第2个订阅者的执行逻辑
	 * @param value
	 */
	private static void doSubscribe02(String value) {
		LOGGER.info("第2个订阅者，输出：" + value);
	}

	/**
	 * 第3个订阅者的执行逻辑
	 * @param value
	 */
	private static void doSubscribe03(String value) {
		LOGGER.info("第3个订阅者，输出：" + value);
	}

	private static void doWait(int seconds) {
		try {
			TimeUnit.SECONDS.sleep(seconds);
		} catch (InterruptedException e) {
		}
	}

	private static void doPause() {
		try {
			System.in.read();
		} catch (IOException e) {
		}
	}
}
```
以上代码执行结果为：
```log
11:39:34.488 [main] INFO com.example.demo.reactor.ReactorDemo2 - 开始
11:39:34.847 [main] DEBUG reactor.util.Loggers$LoggerFactory - Using Slf4j logging framework
11:39:34.910 [main] INFO com.example.demo.reactor.ReactorDemo2 - 开始
11:39:38.909 [elastic-4] INFO com.example.demo.reactor.ReactorDemo2 - 第2个订阅者，输出：aa11
11:39:38.909 [elastic-2] INFO com.example.demo.reactor.ReactorDemo2 - 第1个订阅者，输出：aa11
11:39:38.927 [elastic-10] INFO com.example.demo.reactor.ReactorDemo2 - 第3个订阅者，输出：aa11
11:39:38.927 [elastic-12] INFO com.example.demo.reactor.ReactorDemo2 - 第3个订阅者，输出：cc11
11:39:38.927 [elastic-8] INFO com.example.demo.reactor.ReactorDemo2 - 第2个订阅者，输出：cc11
11:39:38.927 [elastic-6] INFO com.example.demo.reactor.ReactorDemo2 - 第1个订阅者，输出：cc11
11:39:40.923 [elastic-4] INFO com.example.demo.reactor.ReactorDemo2 - 第2个订阅者，输出：bb11
11:39:40.923 [elastic-2] INFO com.example.demo.reactor.ReactorDemo2 - 第1个订阅者，输出：bb11
11:39:40.923 [elastic-2] INFO com.example.demo.reactor.ReactorDemo2 - 第1个订阅者结束
11:39:40.923 [elastic-4] INFO com.example.demo.reactor.ReactorDemo2 - 第2个订阅者结束
11:39:40.941 [elastic-8] INFO com.example.demo.reactor.ReactorDemo2 - 第2个订阅者，输出：dd11
11:39:40.941 [elastic-8] INFO com.example.demo.reactor.ReactorDemo2 - 第2个订阅者结束
11:39:40.941 [elastic-12] INFO com.example.demo.reactor.ReactorDemo2 - 第3个订阅者，输出：dd11
11:39:40.941 [elastic-6] INFO com.example.demo.reactor.ReactorDemo2 - 第1个订阅者，输出：dd11
11:39:40.941 [elastic-6] INFO com.example.demo.reactor.ReactorDemo2 - 第1个订阅者结束
11:39:40.941 [elastic-12] INFO com.example.demo.reactor.ReactorDemo2 - 第3个订阅者结束
11:39:40.941 [elastic-10] INFO com.example.demo.reactor.ReactorDemo2 - 第3个订阅者，输出：bb11
11:39:40.941 [elastic-10] INFO com.example.demo.reactor.ReactorDemo2 - 第3个订阅者结束
```
从以上结果可以看出，总耗时为 6 秒。如果是传统的命令式编程，以上示例中有 4 个元素，每个元素将会进行两个操作，每个操作耗时 2 秒，那么总耗时将达到 4 * 2 * 2 = 16 秒。所以在以上示例中，响应式编程比传统的命令式编程的耗时将节省 10 秒。大大提高程序的运行效率。

从以上示例可以看出，在使用 Reactor 进行响应式编程时，通常需要进行以下步骤：
1. 创建数据流序列
2. 使用操作符对数据流进行处理
3. 订阅数据流的处理结果

但需要注意的是，其调度器中的线程池可能会导致一些不可预期的内存问题，需要在压力测试中去验证这些问题是否存在。