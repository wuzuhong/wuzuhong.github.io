# 【jvm详解】使用 Arthas 分析线上问题
## 启动 Arthas
1. 下载 Arthas
`https://arthas.aliyun.com/download/latest_version?mirror=aliyun`
2. 解压并进入到解压后的文件夹
3. 执行启动命令
`java -jar arthas-boot.jar`
4. 选择应用程序JVM进程的PID

## 使用 dashboard 命令查看当前系统的实时数据面板
实时数据包括：
* 内存配置信息
* 内存使用信息
* GC次数信息
* GC耗时信息
* 线程池信息
* 操作系统信息
* Java版本信息

## 使用 trace 命令跟踪方法调用栈
* 格式：`trace + 类的全路径 + 方法名`，以空格分隔
* 示例：`trace com.example.demo.DemoController demoControllerFunc`

当调用示例所对应的HTTP接口时，Arthas控制台会输出信息：方法调用链路、链路上每个方法的调用耗时。

## 使用 tt 命令查看方法调用的入参、返回结果和异常信息
`tt`命令是把调用信息缓存到一个`Map`里，默认的大小是 100。`tt`命令相关功能在使用完之后，需要手动释放内存，否则长时间可能导致OOM。退出Arthas不会自动清除`tt`的缓存`Map`。
#### 记录调用信息
* 格式：`tt -t -n 1 + 类的全路径 + 方法名`，以空格分隔
* 示例：`tt -t -n 1 com.example.demo.DemoController demoControllerFunc`，这里的`-n 1`表示只记录一次，防止在高并发下调用量非常大的时候瞬间将内存撑爆

当调用示例所对应的HTTP接口时，Arthas控制台会输出信息：编号（INDEX）、方法执行的耗时、方法是否正常或异常返回。
#### 查看调用信息
* 格式：`tt -i + INDEX`，以空格分隔
* 示例：`tt -i 1000`，这里的`1000`就是[记录调用信息](####记录调用信息)时输出的编号（INDEX）

当命令执行完后，将会显示`INDEX`所对应的调用信息的入参、返回结果和异常信息。

#### 清除调用记录
`tt --delete-all`

## 使用 thread 命令查看当前线程信息
* 查看当前最忙的前 N 个线程并打印堆栈：`thread -n 3`
* 查看某个线程ID对应的线程的运行堆栈：`thread 1`
* 查看当前阻塞其他线程的线程：`thread -b`
* 查看指定状态的线程：`thread --state WAITING`

## 使用 jad、sc、mc、retransform 命令实现线上代码热更新
1. 使用`jad`命令反编译指定已加载类的源码：`jad --source-only com.example.demo.DemoController > /tmp/DemoController.java`
2. 停止（stop）或退出（exit）Arthas
3. 根据需要修改并保存源码：`vi /tmp/DemoController.java`
4. 重新启动进入Arthas
5. 使用`sc`命令查看 JVM 已加载的类信息：`sc -d com.example.demo.DemoController`，记录其打印的类加载器哈希值（也就是`classLoaderHash`的值）
6. 使用`mc`命令编译`.java`文件生成`.class`文件：`mc -c 2aae9190 /tmp/DemoController.java -d /tmp`，这里的`2aae9190`就是类加载器哈希值。这里的`-d`参数是指定`.class`文件输出目录，这个输出目录会自动加上包路径，所以这里的真实输出目录文件为`/tmp/com/example/demo/DemoController.class`
7. 使用`retransform`命令加载外部的`.class`文件：`retransform /tmp/com/example/demo/DemoController.class`