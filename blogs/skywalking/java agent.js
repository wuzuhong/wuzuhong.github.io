function getBlog(){
	return blog = {"content": "# 【SkyWalking】探针 java agent\n\n探针表示集成到目标系统中的代理库或 SDK 库，负责收集遥测数据，包括链路追踪和性能指标。探针分为以下三类：\n* 基于语言的原生代理：运行在目标服务系统中，就像目标服务系统代码的一部分一样，比如 SkyWalking 的 Java Agent 的自动埋点，使用 -javaagent 命令行参数在运行期间通过字节码增强技术对代码进行自动修改并注入埋点代码。\n* 服务网格探针：从服务网格的 Sidecar 和控制面板收集数据。\n* 第三方埋点类库：能够接收其他埋点库产生的数据格式，比如 Zipkin 。\n\n## Java Agent 的使用\n使用 Java Agent 的`8.12.0`版本，执行以下步骤可以将源码打包成`skywalking-agent.jar`：\n1. 执行以下命令拉取开源代码：\n```bash\ngit clone https://github.com/apache/skywalking-java.git\ncd skywalking-java/\ngit checkout v8.12.0\ngit submodule init\ngit submodule update\n```\n2. 将`maven-enforcer-plugin`版本号改为`3.0.0-M2`\n3. 将`maven-checkstyle-plugin`删除\n4. 将`.mvn`目录、`mvnw`文件和`mvnw.cmd`文件删除\n5. 执行打包命令：`mvn clean package -DskipTests`。注意：这里必须使用`3.6.1`版本的maven\n6. 打包成功后的`skywalking-agent.jar`在`skywalking-agent`文件夹下\n\n将打包后的`skywalking-agent.jar`集成到测试工程：\n1. 使用`SpringBoot-2.6.8`和`Java-8`创建`jar`类型的测试工程，该工程提供`/demo`接口，将该工程打包后得到`demo.jar`。\n2. 创建应用部署目录`demoapp`，将`demo.jar`拷贝到该目录。将`skywalking-agent`文件夹下的所有文件以及文件夹拷贝到该目录，注意这里不是直接拷贝`skywalking-agent`文件夹。\n3. 修改`demoapp`目录下的`config`目录下的`agent.config`文件，将`agent.service_name`服务名称的值改掉，将`collector.backend_service`平台后端地址的值改掉。\n4. 启动测试工程`java -javaagent:./skywalking-agent.jar -jar ./demo.jar`。\n5. 访问`/demo`接口。\n6. 访问SkyWalking的UI前端即可看到监控链路。\n\n## 字节码增强技术的底层原理\n利用了`javaagent`实现了jvm虚拟机级别的aop切面，利用字节码工具库`bytebuddy`实现字节码增强。\n\n## 性能影响\n1. 探针运行开销：探针在应用程序中运行，会对应用的性能产生一定的影响，这包括对方法执行的监控、生成等操作。\n2. 数据传输开销：将跟踪数据发送到后端也会产生一些网络传输开销，特别是在数据量较大或网络延迟较高的情况下。", "title": "【SkyWalking】探针 java agent"}
}