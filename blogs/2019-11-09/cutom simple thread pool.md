# 【java并发编程】实现简单的线程池
```java
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CustomThreadPool {
	private static final Logger LOGGER = LoggerFactory.getLogger(CustomThreadPool.class);

	private final Worker[] workers;// 线程池
	private final LinkedBlockingQueue<Runnable> tasks = new LinkedBlockingQueue<>();// 任务队列
	private boolean isShutdown = false;// 是否处于终止状态

	/**
	 * 初始化
	 * 
	 * @param poolSize 线程池大小
	 */
	public CustomThreadPool(int poolSize) {
		// 初始化线程池
		workers = new Worker[poolSize];
		for (int i = 0; i < poolSize; i++) {
			createWorker(i);
		}
	}

	/**
	 * 创建工作线程
	 * 
	 * @param index
	 */
	private void createWorker(int index) {
		workers[index] = new Worker();
		workers[index].start();
	}

	/**
	 * 将任务添加到任务队列
	 * 
	 * @param task
	 */
	public void execute(Runnable task) {
		synchronized (this) {
			tasks.add(task);
		}
	}

	private class Worker extends Thread {

		/**
		 * 当前工作线程所执行的任务
		 */
		private Runnable task;

		@Override
		public void run() {
			// 如果当前线程池没有终止，则继续等待
			while (!isShutdown) {
				synchronized (this) {
					// 如果任务队列为空，则继续等待
					if (tasks.isEmpty()) {
						continue;
					}
					// 从任务队列的顶部去除并移除一个任务
					task = tasks.poll();
				}
				// run 方法是同步执行的
				task.run();
			}
		}
	}

	/**
	 * 终止当前线程池
	 */
	public void shutdown() {
		LOGGER.info("线程池关闭中......");
		isShutdown = true;
	}

	/**
	 * 获取线程池是否处于终止状态
	 * 
	 * @return
	 */
	public boolean isShutdown() {
		return isShutdown;
	}

	/**
	 * 测试代码
	 * 
	 * @param args
	 * @throws InterruptedException
	 */
	public static void main(String[] args) throws InterruptedException {
		// 创建拥有两个线程的线程池
		CustomThreadPool customThreadPool = new CustomThreadPool(2);
		LOGGER.info("线程开始创建");
		customThreadPool.execute(() -> {
			LOGGER.info("第1个线程开始执行");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			LOGGER.info("第1个线程执行完成");
		});
		LOGGER.info("第1个线程创建完成");
		customThreadPool.execute(() -> {
			LOGGER.info("第2个线程开始执行");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			LOGGER.info("第2个线程执行完成");
		});
		LOGGER.info("第2个线程创建完成");
		customThreadPool.execute(() -> {
			LOGGER.info("第3个线程开始执行");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			LOGGER.info("第3个线程执行完成");
		});
		LOGGER.info("第3个线程创建完成");
		customThreadPool.execute(() -> {
			LOGGER.info("第4个线程开始执行");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			LOGGER.info("第4个线程执行完成");
		});
		LOGGER.info("第4个线程创建完成");
		customThreadPool.execute(() -> {
			LOGGER.info("第5个线程开始执行");
			try {
				TimeUnit.SECONDS.sleep(2);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			LOGGER.info("第5个线程执行完成");
		});
		LOGGER.info("第5个线程创建完成");
		// 终止线程
		TimeUnit.SECONDS.sleep(12);
		customThreadPool.shutdown();
	}
}
```
以上代码执行结果为：
```log
16:45:48.795 [main] INFO com.example.demo.CustomThreadPool - 线程开始创建
16:45:48.883 [main] INFO com.example.demo.CustomThreadPool - 第1个线程创建完成
16:45:48.883 [Thread-0] INFO com.example.demo.CustomThreadPool - 第1个线程开始执行
16:45:48.883 [main] INFO com.example.demo.CustomThreadPool - 第2个线程创建完成
16:45:48.884 [Thread-1] INFO com.example.demo.CustomThreadPool - 第2个线程开始执行
16:45:48.884 [main] INFO com.example.demo.CustomThreadPool - 第3个线程创建完成
16:45:48.884 [main] INFO com.example.demo.CustomThreadPool - 第4个线程创建完成
16:45:48.885 [main] INFO com.example.demo.CustomThreadPool - 第5个线程创建完成
16:45:50.883 [Thread-0] INFO com.example.demo.CustomThreadPool - 第1个线程执行完成
16:45:50.883 [Thread-0] INFO com.example.demo.CustomThreadPool - 第3个线程开始执行
16:45:50.884 [Thread-1] INFO com.example.demo.CustomThreadPool - 第2个线程执行完成
16:45:50.884 [Thread-1] INFO com.example.demo.CustomThreadPool - 第4个线程开始执行
16:45:52.884 [Thread-0] INFO com.example.demo.CustomThreadPool - 第3个线程执行完成
16:45:52.884 [Thread-1] INFO com.example.demo.CustomThreadPool - 第4个线程执行完成
16:45:52.885 [Thread-0] INFO com.example.demo.CustomThreadPool - 第5个线程开始执行
16:45:54.886 [Thread-0] INFO com.example.demo.CustomThreadPool - 第5个线程执行完成
16:46:00.886 [main] INFO com.example.demo.CustomThreadPool - 线程池关闭中......
```