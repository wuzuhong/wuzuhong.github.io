function getBlog(){
	return blog = {"content": "# 【jvm详解】使用 Arthas 分析线上问题\n## 启动 Arthas\n1. 下载 Arthas\n`https://arthas.aliyun.com/download/latest_version?mirror=aliyun`\n2. 解压并进入到解压后的文件夹\n3. 执行启动命令\n`java -jar arthas-boot.jar`\n4. 选择应用程序JVM进程的PID\n\n## 使用 dashboard 命令查看当前系统的实时数据面板\n实时数据包括：\n* 内存配置信息\n* 内存使用信息\n* GC次数信息\n* GC耗时信息\n* 线程池信息\n* 操作系统信息\n* Java版本信息\n\n## 使用 trace 命令跟踪方法调用栈\n* 格式：`trace + 类的全路径 + 方法名`，以空格分隔\n* 示例：`trace com.example.demo.DemoController demoControllerFunc`\n\n当调用示例所对应的HTTP接口时，Arthas控制台会输出信息：方法调用链路、链路上每个方法的调用耗时。\n\n## 使用 tt 命令查看方法调用的入参、返回结果和异常信息\n`tt`命令是把调用信息缓存到一个`Map`里，默认的大小是 100。`tt`命令相关功能在使用完之后，需要手动释放内存，否则长时间可能导致OOM。退出Arthas不会自动清除`tt`的缓存`Map`。\n#### 记录调用信息\n* 格式：`tt -t -n 1 + 类的全路径 + 方法名`，以空格分隔\n* 示例：`tt -t -n 1 com.example.demo.DemoController demoControllerFunc`，这里的`-n 1`表示只记录一次，防止在高并发下调用量非常大的时候瞬间将内存撑爆\n\n当调用示例所对应的HTTP接口时，Arthas控制台会输出信息：编号（INDEX）、方法执行的耗时、方法是否正常或异常返回。\n#### 查看调用信息\n* 格式：`tt -i + INDEX`，以空格分隔\n* 示例：`tt -i 1000`，这里的`1000`就是[记录调用信息](####记录调用信息)时输出的编号（INDEX）\n\n当命令执行完后，将会显示`INDEX`所对应的调用信息的入参、返回结果和异常信息。\n\n#### 清除调用记录\n`tt --delete-all`\n\n## 使用 thread 命令查看当前线程信息\n* 查看当前最忙的前 N 个线程并打印堆栈：`thread -n 3`\n* 查看某个线程ID对应的线程的运行堆栈：`thread 1`\n* 查看当前阻塞其他线程的线程：`thread -b`\n* 查看指定状态的线程：`thread --state WAITING`\n\n## 使用 jad、sc、mc、retransform 命令实现线上代码热更新\n1. 使用`jad`命令反编译指定已加载类的源码：`jad --source-only com.example.demo.DemoController > /tmp/DemoController.java`\n2. 停止（stop）或退出（exit）Arthas\n3. 根据需要修改并保存源码：`vi /tmp/DemoController.java`\n4. 重新启动进入Arthas\n5. 使用`sc`命令查看 JVM 已加载的类信息：`sc -d com.example.demo.DemoController`，记录其打印的类加载器哈希值（也就是`classLoaderHash`的值）\n6. 使用`mc`命令编译`.java`文件生成`.class`文件：`mc -c 2aae9190 /tmp/DemoController.java -d /tmp`，这里的`2aae9190`就是类加载器哈希值。这里的`-d`参数是指定`.class`文件输出目录，这个输出目录会自动加上包路径，所以这里的真实输出目录文件为`/tmp/com/example/demo/DemoController.class`\n7. 使用`retransform`命令加载外部的`.class`文件：`retransform /tmp/com/example/demo/DemoController.class`", "title": "【jvm详解】使用 Arthas 分析线上问题"}
}