# 【java并发编程】java原生的并发编程方式
java中通常是通过创建线程的方式来提供系统的并发性能。

例如有两个业务操作A和B，它们分别需要2秒才能执行完成。在传统的编程方式中，A和B必须按照先后顺序执行，所以完成A和B操作总共需要4秒。而如果我们创建两个线程来分别执行A和B操作，那么完成A和B操作总共只需要2秒，因为线程是异步执行的，也就是说A和B操作是同时执行的，而不需要按顺序等待另一个执行完成后才能执行。

## Thread类和Runnable接口
#### 通过继承Thread类来创建一个线程
```java
public class ThreadDemo extends Thread {
	private static final Logger LOGGER = LoggerFactory.getLogger(ThreadDemo.class);

	// 重写 Thread 类中的 run 方法
	@Override
	public void run() {
		super.run();
		LOGGER.info("==线程开始执行==");
		try {
            // 睡眠2秒
			TimeUnit.SECONDS.sleep(2);
		} catch (InterruptedException e) {
		}
		LOGGER.info("==线程执行完成==");
	}

	public static void main(String[] args) {
		// 创建自定义线程
		ThreadDemo threadDemo = new ThreadDemo();
		// 启动线程
		threadDemo.start();
		LOGGER.info("==main函数执行完成==");
	}
}
```
以上代码执行结果为：
```log
16:37:19.226 [main] INFO com.example.demo.ThreadDemo - ==main函数执行完成==
16:37:19.226 [Thread-0] INFO com.example.demo.ThreadDemo - ==线程开始执行==
16:37:21.231 [Thread-0] INFO com.example.demo.ThreadDemo - ==线程执行完成==
```

#### 通过实现Runnable接口来创建一个线程
```java
public class RunnableDemo implements Runnable {
	private static final Logger LOGGER = LoggerFactory.getLogger(RunnableDemo.class);

	// 重写 Runnable 接口中的 run 方法
	@Override
	public void run() {
		LOGGER.info("==线程开始执行==");
		try {
			// 睡眠2秒
			TimeUnit.SECONDS.sleep(2);
		} catch (InterruptedException e) {
		}
		LOGGER.info("==线程执行完成==");
	}

	public static void main(String[] args) {
		// 创建自定义线程
		Thread thread = new Thread(new RunnableDemo());
		// 启动线程
		thread.start();
		LOGGER.info("==main函数执行完成==");
	}

}
```
更简单的实现方式——使用匿名内部类：
```java
public class RunnableDemo {
	private static final Logger LOGGER = LoggerFactory.getLogger(RunnableDemo.class);

	public static void main(String[] args) {
		// 创建自定义线程
		Thread thread = new Thread(new Runnable() {
			@Override
			public void run() {
				LOGGER.info("==线程开始执行==");
				try {
					// 睡眠2秒
					TimeUnit.SECONDS.sleep(2);
				} catch (InterruptedException e) {
				}
				LOGGER.info("==线程执行完成==");
			}
		});
		// 启动线程
		thread.start();
		LOGGER.info("==main函数执行完成==");
	}

}
```
更简单的实现方式——使用 Lambda 表达式（推荐使用）：
```java
public class RunnableDemo {
	private static final Logger LOGGER = LoggerFactory.getLogger(RunnableDemo.class);

	public static void main(String[] args) {
		// 创建自定义线程
		Thread thread = new Thread(() -> {
			LOGGER.info("==线程开始执行==");
			try {
				// 睡眠2秒
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
			}
			LOGGER.info("==线程执行完成==");
		});
		// 启动线程
		thread.start();
		LOGGER.info("==main函数执行完成==");
	}

}
```
以上代码执行结果都为：
```log
16:42:07.087 [Thread-0] INFO com.example.demo.RunnableDemo - ==线程开始执行==
16:42:07.075 [main] INFO com.example.demo.RunnableDemo - ==main函数执行完成==
16:42:09.096 [Thread-0] INFO com.example.demo.RunnableDemo - ==线程执行完成==
```

## Callable + Future模式
从 Java 1.5 开始，提供了 Callable 和 Future 接口。

Callable 和 Runnable 类似，区别在于 Callable 有返回值，而 Runnable 没有。

Future 就是对于具体的 Runnable 或者 Callable 任务的执行结果进行取消、查询是否完成、获取结果等操作。可以通过 Future 中的 get 方法获取执行结果，get 方法会阻塞主线程直到任务返回结果。
```java
public class CallableDemo {
	private static final Logger LOGGER = LoggerFactory.getLogger(CallableDemo.class);

	public static void main(String[] args) throws InterruptedException, ExecutionException {
		LOGGER.info("主线程开始");

		// 创建线程池并执行线程数量
		ExecutorService threadPool = Executors.newFixedThreadPool(4);

		// Callable + Future。并且会线程池中取出线程来执行
		Future<String> future1 = threadPool.submit(new Callable<String>() {
			@Override
			public String call() throws Exception {
				LOGGER.info("future1线程开始");
				try {
					TimeUnit.SECONDS.sleep(2);
				} catch (InterruptedException e) {
				}
				LOGGER.info("future1线程结束");
				return "future1";// 有返回值
			}
		});

		// Runnable + Future。并且会线程池中取出线程来执行
		Future<?> future2 = threadPool.submit(new Runnable() {
			@Override
			public void run() {
				LOGGER.info("future2线程开始");
				try {
					TimeUnit.SECONDS.sleep(2);
				} catch (InterruptedException e) {
				}
				LOGGER.info("future2线程结束");
				// 没有返回值
			}
		});

		// Lambda 表达式的实现方式下的 Callable + Future。并且会线程池中取出线程来执行
		Future<String> future3 = threadPool.submit(() -> {
			LOGGER.info("future3线程开始");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
			}
			LOGGER.info("future3线程结束");
			return "future3";// 有返回值
		});

		// Lambda 表达式的实现方式下的 Runnable + Future。并且会线程池中取出线程来执行
		Future<?> future4 = threadPool.submit(() -> {
			LOGGER.info("future4线程开始");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
			}
			LOGGER.info("future4线程结束");
			// 没有返回值
		});

		LOGGER.info("==线程创建完成==");

		String future1Result = future1.get();// 结果为字符串 future1，会阻塞主线程直到 future1 中 Callable 线程执行完成
		Object future2Result = future2.get();// 结果为null，会阻塞主线程直到 future2 中 Runnable 线程执行完成
		String future3Result = future3.get();// 结果为字符串 future3，会阻塞主线程直到 future3 中 Callable 线程执行完成
		Object future4Result = future4.get();// 结果为null，会阻塞主线程直到 future4 中 Runnable 线程执行完成

		LOGGER.info("==主线程结束==");

        threadPool.shutdown();// 关闭线程池
	}
}
```
以上代码执行结果为：
```log
17:15:18.002 [main] INFO com.example.demo.CallableDemo - 主线程开始
17:15:18.010 [pool-1-thread-1] INFO com.example.demo.CallableDemo - future1线程开始
17:15:18.011 [pool-1-thread-2] INFO com.example.demo.CallableDemo - future2线程开始
17:15:18.082 [pool-1-thread-3] INFO com.example.demo.CallableDemo - future3线程开始
17:15:18.082 [main] INFO com.example.demo.CallableDemo - ==线程创建完成==
17:15:18.082 [pool-1-thread-4] INFO com.example.demo.CallableDemo - future4线程开始
17:15:20.010 [pool-1-thread-1] INFO com.example.demo.CallableDemo - future1线程结束
17:15:20.011 [pool-1-thread-2] INFO com.example.demo.CallableDemo - future2线程结束
17:15:20.083 [pool-1-thread-3] INFO com.example.demo.CallableDemo - future3线程结束
17:15:20.084 [pool-1-thread-4] INFO com.example.demo.CallableDemo - future4线程结束
17:15:20.084 [main] INFO com.example.demo.CallableDemo - ==主线程结束==
```

#### Callable + Future模式的局限性
Future 很难直接表述多个 Future 结果之间的依赖性，难以实现以下需求：
* 将两个异步计算合并为一个，并且这两个异步计算之间相互独立，同时第二个又依赖于第一个的结果
* 在不阻塞主线程的情况下，能够获取到异步计算结果
* 仅等待 Future 集合中最快结束的任务完成，并返回它的结果

## CompletableFuture（推荐）
CompletableFuture 如果指定了线程池，会在指定的线程池中执行，如果没有指定，默认会在 ForkJoinPool.commonPool() 中执行。ForkJoinPool 可以充分利用多 cpu，创建当前可用cpu数量的线程来并行执行，多核cpu的优势，把一个任务拆分成多个“小任务”，把多个“小任务”放到多个处理器核心上并行执行，当多个“小任务”执行完成之后，再将这些执行结果合并起来。

从 Java 8 开始，提供了 CompletableFuture 类。以下是一些示例。

#### 示例一：在不阻塞主线程的情况下，能够获取到异步计算结果
Callable + Future模式有一个缺点就是 Future 中的 get 方法会阻塞主线程一直到任务完成为止，如果前面先执行的任务耗时很多，则后面的任务调用 get 方法就呈阻塞状态，也就是排队进行等候，也就是主线程无法保证首先获得的是最先完成任务的返回值。而当前 CompletableFuture 的示例就能很好的解决这个问题。
```java
public class CompletableFutureDemo {
	private static final Logger LOGGER = LoggerFactory.getLogger(CompletableFutureDemo.class);

	public static void main(String[] args) {
		LOGGER.info("主线程开始");
		CompletableFuture.supplyAsync(() -> {
			// 异步操作
			LOGGER.info("==异步操作开始==");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
			}
			LOGGER.info("==异步操作结束==");
			return "r1";
		}).thenApplyAsync(value -> {
			// 转换操作
			// 等待异步操作结束后才执行
			LOGGER.info("==转换操作开始：" + value + "==");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
			}
			LOGGER.info("==转换操作结束：" + value + "==");
			return value;
		}).thenAcceptAsync(value -> {
			// 消费操作
			// 等待转换操作结束后才执行。如果没有转换操作，则等待异步操作结束后才执行
			LOGGER.info("==消费操作开始：" + value + "==");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
			}
			LOGGER.info("==消费操作结束：" + value + "==");
		});
		// 以上操作是异步的，主线程不会被阻塞。这里是为了能够看到效果，所以手动让主线程阻塞8秒
		LOGGER.info("主线程预结束:");
		try {
			TimeUnit.SECONDS.sleep(8);
		} catch (InterruptedException e) {
		}
		LOGGER.info("主线程结束:");
	}
}
```
以上代码执行结果为：
```log
22:04:48.004 [main] INFO com.example.demo.CompletableFutureDemo - 主线程开始
22:04:48.104 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==异步操作开始==
22:04:48.106 [main] INFO com.example.demo.CompletableFutureDemo - 主线程预结束:
22:04:50.105 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==异步操作结束==
22:04:50.107 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==转换操作开始：r1==
22:04:52.108 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==转换操作结束：r1==
22:04:52.108 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==消费操作开始：r1==
22:04:54.110 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==消费操作结束：r1==
22:04:56.107 [main] INFO com.example.demo.CompletableFutureDemo - 主线程结束
```

#### 示例二：将两个及以上异步计算合并为一个
```java
public class CompletableFutureDemo {
	private static final Logger LOGGER = LoggerFactory.getLogger(CompletableFutureDemo.class);

	public static void main(String[] args) {
		LOGGER.info("主线程开始");
		String result = CompletableFuture.supplyAsync(() -> {
			// 异步操作1
			LOGGER.info("==第一个开始==");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
			}
			LOGGER.info("==第一个结束==");
			return "r1";
		}).thenCombineAsync(CompletableFuture.supplyAsync(() -> {
			// 异步操作2
			LOGGER.info("==第二个开始==");
			try {
				TimeUnit.SECONDS.sleep(4);
			} catch (InterruptedException e) {
			}
			LOGGER.info("==第二个结束==");
			return "r2";
		}), (r1, r2) -> {
			// 合并操作1
			// 等待异步操作1和异步操作2都执行完成后才执行
			// r1是异步操作1返回的结果，r2是异步操作2返回的结果
			LOGGER.info("==r1:" + r1 + "，r2:" + r2 + "==");
			return r1 + "，" + r2;
		}).thenCombineAsync(CompletableFuture.supplyAsync(() -> {
			// 异步操作3
			LOGGER.info("==第三个开始==");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
			}
			LOGGER.info("==第三个结束==");
			return "r3";
		}), (r1, r2) -> {
			// 合并操作2
			// 等待异步操作3和合并操作1都执行完成后执行
			// r1是合并操作1返回的结果，r2是异步操作3返回的结果
			LOGGER.info("==r1:" + r1 + "，r2:" + r2 + "==");
			return r1 + "，" + r2;
		}).join();
		LOGGER.info("主线程结束，结果为：:" + result);
	}
}
```
以上代码执行结果为：
```log
21:48:16.978 [main] INFO com.example.demo.CompletableFutureDemo - 主线程开始
21:48:17.098 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==第一个开始==
21:48:17.102 [ForkJoinPool.commonPool-worker-2] INFO com.example.demo.CompletableFutureDemo - ==第二个开始==
21:48:17.103 [ForkJoinPool.commonPool-worker-3] INFO com.example.demo.CompletableFutureDemo - ==第三个开始==
21:48:19.102 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==第一个结束==
21:48:19.105 [ForkJoinPool.commonPool-worker-3] INFO com.example.demo.CompletableFutureDemo - ==第三个结束==
21:48:21.103 [ForkJoinPool.commonPool-worker-2] INFO com.example.demo.CompletableFutureDemo - ==第二个结束==
21:48:21.104 [ForkJoinPool.commonPool-worker-3] INFO com.example.demo.CompletableFutureDemo - ==r1:r1，r2:r2==
21:48:21.105 [ForkJoinPool.commonPool-worker-3] INFO com.example.demo.CompletableFutureDemo - ==r1:r1，r2，r2:r3==
21:48:21.106 [main] INFO com.example.demo.CompletableFutureDemo - 主线程结束，结果为：:r1，r2，r3
```

#### 示例三：两个异步操作，谁计算的快，就用谁的结果进行下一步操作
```java
public class CompletableFutureDemo {
	private static final Logger LOGGER = LoggerFactory.getLogger(CompletableFutureDemo.class);

	public static void main(String[] args) {
		LOGGER.info("主线程开始");
		String result = CompletableFuture.supplyAsync(() -> {
			// 异步操作1
			LOGGER.info("==异步操作1开始==");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
			}
			LOGGER.info("==异步操作1结束==");
			return "r1";
		}).applyToEither(CompletableFuture.supplyAsync(() -> {
			// 异步操作2
			LOGGER.info("==异步操作2开始==");
			try {
				TimeUnit.SECONDS.sleep(4);
			} catch (InterruptedException e) {
			}
			LOGGER.info("==异步操作2结束==");
			return "r2";
		}), r -> {
			return r;
		}).join();
		LOGGER.info("主线程结束：" + result);
	}
}
```
以上代码执行结果为：
```log
22:18:19.801 [main] INFO com.example.demo.CompletableFutureDemo - 主线程开始
22:18:19.906 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==异步操作1开始==
22:18:19.907 [ForkJoinPool.commonPool-worker-2] INFO com.example.demo.CompletableFutureDemo - ==异步操作2开始==
22:18:21.908 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==异步操作1结束==
22:18:21.908 [main] INFO com.example.demo.CompletableFutureDemo - 主线程结束：r1
```

#### 示例四：异步操作中出现了异常，可以通过exceptionally进行补偿
```java
public class CompletableFutureDemo {
	private static final Logger LOGGER = LoggerFactory.getLogger(CompletableFutureDemo.class);

	public static void main(String[] args) {
		LOGGER.info("主线程开始");
		String result = CompletableFuture.supplyAsync(() -> {
			// 异步操作
			LOGGER.info("==异步操作开始==");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
			}
			if (true) {
				throw new RuntimeException("异步操作出现了异常");
			}
			LOGGER.info("==异步操作结束==");
			return "r1";
		}).exceptionally(e -> {
			LOGGER.info("==异步操作出现异常后的补偿操作==");
			return "r1 on error";
		}).join();
		LOGGER.info("主线程结束：" + result);
	}
}
```
以上代码执行结果为：
```log
22:23:21.699 [main] INFO com.example.demo.CompletableFutureDemo - 主线程开始
22:23:21.799 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==异步操作开始==
22:23:23.801 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.CompletableFutureDemo - ==异步操作出现异常后的补偿操作==
22:23:23.801 [main] INFO com.example.demo.CompletableFutureDemo - 主线程结束：r1 on error
```

## 线程池相关
可以通过以下方式快速创建线程池，但不建议这样用：
```java
// 创建一个不设置线程数上限的线程池，任何提交的任务都将立即执行
ExecutorService newCachedThreadPool = Executors.newCachedThreadPool();

// 创建一个固定线程数的线程池
ExecutorService newFixedThreadPool = Executors.newFixedThreadPool(10);

// 创建一个只有一个线程的线程池
ExecutorService newSingleThreadExecutor = Executors.newSingleThreadExecutor();

// 创建一个固定线程数并且能够支持定时以及周期性执行任务的线程池
ScheduledExecutorService newScheduledThreadPool = Executors.newScheduledThreadPool(10);

// 创建一个只有一个线程并且能够支持定时以及周期性执行任务的线程池
ScheduledExecutorService newSingleThreadScheduledExecutor = Executors.newSingleThreadScheduledExecutor();

// 创建一个工作窃取线程池。
// 它会根据 CPU 核心数来创建一个含有足够多线程的线程池，来维持相应的并行级别。
// 它会通过工作窃取的方式，使得多核的 CPU 不会闲置，总会有活着的线程让 CPU 去运行。
// 当一个核对应的任务处理完毕后，就可以去帮助其他的核处理任务。
// 它本质上是一个 ForkJoinPool。
ExecutorService newWorkStealingPool = Executors.newWorkStealingPool();
```

不建议使用以上方式来创建线程池，因为它们的任务队列是无限的，如果未创建的线程在任务队列中等待数量太多，可能会导致 OOM，即内存溢出问题，所以建议使用 ThreadPoolExecutor 中的构造方法来创建线程池，其实以上方式也是调用了 ThreadPoolExecutor 的构造方法，只不过他们简化了很多参数配置。

ThreadPoolExecutor 的构造方法中以下参数：
```java
public ThreadPoolExecutor(
		int corePoolSize,// 线程池最小线程数。推荐设置为和最大线程数一样的值
		int maximumPoolSize,// 线程池最大线程数。推荐使用与CPU核心数相近的能被5整除的整数，从而能够避免线程过多导致操作系统切换上下文带来的时间损耗
		long keepAliveTime,// 超过最小线程数的线程的存活时长。推荐使用10分钟
		TimeUnit unit,// 时间单位，与 keepAliveTime 参数对应。推荐使用分钟 TimeUnit.MINUTES
		BlockingQueue<Runnable> workQueue,// 任务队列。推荐使用有界队列（避免OOM） new ArrayBlockingQueue<>(512)
		ThreadFactory threadFactory,// 线程工厂。推荐使用默认的线程工厂 Executors.defaultThreadFactory()
		RejectedExecutionHandler handler// 拒绝策略。推荐使用默认的线程工厂 Executors.defaultThreadFactory()
	) {
	// 省略了更多的代碼......
}
```
其中拒绝策略有以下几种：
* AbortPolicy：抛出 RejectedExecutionException 异常，该异常是非受检异常，很容易就忘记捕获，如果没有捕获会导致主线程无法继续执行。推荐使用，但是要记得捕获其异常
* DiscardPolicy：什么也不做，直接拒绝。如果不关心任务被拒绝的事件，则推荐使用这种
* DiscardOldestPolicy：丢弃执行队列中最老的任务，尝试为当前提交的任务腾出位置
* CallerRunsPolicy：由调用线程处理该任务

其中能够被执行的任务数为： 最大线程数 + 任务队列大小

以下是手动通过 ThreadPoolExecutor 中的构造方法来创建线程池的示例：
```java
public static void main(String[] args) {
	LOGGER.info("主线程开始执行");
	// 能够被执行的任务数为：2 + 4 = 6
	ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(2, 2, 10, TimeUnit.MINUTES,
			new ArrayBlockingQueue<>(4), Executors.defaultThreadFactory(), new ThreadPoolExecutor.DiscardPolicy());
	// 只有前 6 个任务能够被执行，其他的都被拒绝了。
	for (int i = 0; i < 10; i++) {
		final int j = i + 1;
		threadPoolExecutor.execute(() -> {
			try {
				Thread.sleep(2000);
				LOGGER.info("子线程" + j + "执行");
			} catch (InterruptedException e) {
			}
		});
	}
	LOGGER.info("主线程结束执行");
}
```
以上代码执行结果为：
```log
14:51:02.112 [main] INFO com.example.demo.ThreadPoolDemo - 主线程开始执行
14:51:02.200 [main] INFO com.example.demo.ThreadPoolDemo - 主线程结束执行
14:51:04.200 [pool-1-thread-2] INFO com.example.demo.ThreadPoolDemo - 子线程2执行
14:51:04.200 [pool-1-thread-1] INFO com.example.demo.ThreadPoolDemo - 子线程1执行
14:51:06.201 [pool-1-thread-1] INFO com.example.demo.ThreadPoolDemo - 子线程3执行
14:51:06.201 [pool-1-thread-2] INFO com.example.demo.ThreadPoolDemo - 子线程4执行
14:51:08.202 [pool-1-thread-2] INFO com.example.demo.ThreadPoolDemo - 子线程6执行
14:51:08.202 [pool-1-thread-1] INFO com.example.demo.ThreadPoolDemo - 子线程5执行
```