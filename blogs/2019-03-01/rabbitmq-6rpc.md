# 【消息中间件—rabbitmq】RPC远程调用
在之前我们已经介绍了如何使用工作队列在多个后台进程中间分发耗时任务，可是如果我们需要调用远程计算机上的一个函数并且等待从那儿获取结果时，该怎么办呢？这就是另外的故事了。这种模式通常被称为远程过程调用（Remote Procedure Call）或者RPC。
## 关于RPC
尽管RPC在计算领域是一个常用模式，但它也经常被诟病。当一个异常被抛出的时候，程序员往往意识不到这到底是由本地调用还是由较慢的RPC调用引起的。同样的困惑还来自于系统的不可预测性和给调试工作带来的不必要的复杂性。跟软件精简不同的是，滥用RPC会导致不可维护的面条代码。考虑到这一点，牢记以下建议：确保能够明确的搞清楚哪个函数是本地调用的，哪个函数是远程调用的，给你的系统编写文档，明确各个组件间的依赖关系，处理错误情况，明确客户端该如何处理RPC服务器的宕机和长时间无响应情况。如果可以的话，你应该尽量使用异步管道来代替RPC类的阻塞，结果被异步地推送到下一个计算场景。  
  
  
接下来我们会使用RabbitMQ来构建一个RPC系统：包含一个客户端和一个RPC服务器。现在的情况是，我们没有一个值得被分发的足够耗时的任务，所以接下来，我们会创建一个模拟RPC服务来返回斐波那契数列。
## 客户端
为了展示RPC服务如何使用，我们创建了一个简单的客户端类。其中有一个名为“call”的方法用来发送一个RPC请求，并且在收到回应前保持阻塞。
```
fibonacci_rpc = FibonacciRpcClient()
result = fibonacci_rpc.call(4)
print "fib(4) is %r" % (result,)
```

## 回调队列
一般来说通过RabbitMQ来实现RPC是很容易的，一个客户端发送请求信息，服务器端将其应用到一个回复信息中，为了接收到回复信息，客户端需要在发送请求的时候同时发送一个回调队列的地址。
```
result = channel.queue_declare(exclusive=True)
callbackQueue = result.method.queue
channel.basic_publish(exchange='',
                      routing_key='rpc_queue',
                      properties=pika.BasicProperties(
                            replyTo = callbackQueue,
                            ),
                      body=request)

# ... and some code to read a response message from the callback_queue ...
```
在basic_publish方法中可以指定消息属性properties，AMQP协议给消息预定义了一系列的14个属性。常用的属性有以下几个：
* deliveryMode（投递模式）：将消息标记为持久的（值为2）或暂存的（除了2之外的其他任何值）。第二篇教程里接触过这个属性，记得吧？
* contentType（内容类型）:用来描述编码的mime-type。例如在实际使用中常常使用application/json来描述JOSN编码类型。
* replyTo（回复目标）：通常用来命名回调队列。
* correlationId（关联标识）：用来将RPC的响应和请求关联起来。

## 关联标识
在上边介绍的方法中，我们建议给每一个RPC请求新建一个回调队列，而这并不是一个高效的做法，更好的办法是我们可以为每个客户端只建立一个独立的回调队列，但这就会带来一个新问题，当此队列接收到一个响应的时候它无法辨别出这个响应是属于哪个请求的，correlationId就是为了解决这个问题而来的，我们给每个请求设置一个独一无二的值，当我们从回调队列中接收到一个消息的时候，我们就可以查看这条属性从而将响应和请求匹配起来。如果我们接收到的消息的correlationId是未知的，那就直接销毁掉它，因为它不属于我们的任何一条请求。  
  
为什么我们接收到未知消息的时候不抛出一个错误，而是要将它丢弃掉？这是为了解决服务器端有可能发生的竞争情况。尽管可能性不大，但RPC服务器还是有可能在已将应答发送给我们但还未将确认消息发送给请求的情况下死掉。如果这种情况发生，RPC在重启后会重新处理请求。这就是为什么我们必须在客户端处理重复响应，同时RPC也需要尽可能保持幂等性。

## 总结
* 当客户端启动的时候，它创建一个匿名独享的临时回调队列。
* 在RPC请求中，客户端发送带有两个属性的消息：一个是设置回调队列的replyTo属性，另一个是设置唯一值的correlationId属性。
* 将请求发送到一个rpc_queue队列中。
* RPC工作者（又名：服务器）等待请求发送到这个队列中来。当请求出现的时候，它执行他的工作并且将带有执行结果的消息发送给replyTo字段指定的队列。
* 客户端等待回调队列里的数据。当有消息出现的时候，它会检查correlationId属性。如果此属性的值与请求匹配，将它返回给应用。

## 完整示例
服务端RPCServer.java
```
public class RPCServer {

    private static final String RPC_QUEUE_NAME = "rpc_queue";

    private static int fib(int n) {
        if (n == 0) return 0;
        if (n == 1) return 1;
        return fib(n - 1) + fib(n - 2);
    }

    public static void main(String[] argv) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {
            channel.queueDeclare(RPC_QUEUE_NAME, false, false, false, null);
            channel.queuePurge(RPC_QUEUE_NAME);

            channel.basicQos(1);

            System.out.println(" [x] Awaiting RPC requests");

            Object monitor = new Object();
            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                AMQP.BasicProperties replyProps = new AMQP.BasicProperties
                        .Builder()
                        .correlationId(delivery.getProperties().getCorrelationId())
                        .build();

                String response = "";

                try {
                    String message = new String(delivery.getBody(), "UTF-8");
                    int n = Integer.parseInt(message);

                    System.out.println(" [.] fib(" + message + ")");
                    response += fib(n);
                } catch (RuntimeException e) {
                    System.out.println(" [.] " + e.toString());
                } finally {
                    channel.basicPublish("", delivery.getProperties().getReplyTo(), replyProps, response.getBytes("UTF-8"));
                    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
                    // RabbitMq consumer worker thread notifies the RPC server owner thread
                    synchronized (monitor) {
                        monitor.notify();
                    }
                }
            };

            channel.basicConsume(RPC_QUEUE_NAME, false, deliverCallback, (consumerTag -> { }));
            // Wait and be prepared to consume the message from RPC client.
            while (true) {
                synchronized (monitor) {
                    try {
                        monitor.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}
```
服务器端代码相当简单：
* 像往常一样，我们建立连接，声明队列
* 我们可能希望能运行多个服务器进程，为了能将负载平均地分摊到多个服务器，我们需要在channel.basicQos中将prefetchCount设置好。
* 我们为basicConsume声明了一个回调函数，这是RPC服务器端的核心。它执行实际的操作并且作出响应。
  
客户端RPCClient.java
```
public class RPCClient implements AutoCloseable {

    private Connection connection;
    private Channel channel;
    private String requestQueueName = "rpc_queue";

    public RPCClient() throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        connection = factory.newConnection();
        channel = connection.createChannel();
    }

    public static void main(String[] argv) {
        try (RPCClient fibonacciRpc = new RPCClient()) {
            for (int i = 0; i < 32; i++) {
                String i_str = Integer.toString(i);
                System.out.println(" [x] Requesting fib(" + i_str + ")");
                String response = fibonacciRpc.call(i_str);
                System.out.println(" [.] Got '" + response + "'");
            }
        } catch (IOException | TimeoutException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    public String call(String message) throws IOException, InterruptedException {
        final String corrId = UUID.randomUUID().toString();

        String replyQueueName = channel.queueDeclare().getQueue();
        AMQP.BasicProperties props = new AMQP.BasicProperties
                .Builder()
                .correlationId(corrId)
                .replyTo(replyQueueName)
                .build();

        channel.basicPublish("", requestQueueName, props, message.getBytes("UTF-8"));

        final BlockingQueue<String> response = new ArrayBlockingQueue<>(1);

        String ctag = channel.basicConsume(replyQueueName, true, (consumerTag, delivery) -> {
            if (delivery.getProperties().getCorrelationId().equals(corrId)) {
                response.offer(new String(delivery.getBody(), "UTF-8"));
            }
        }, consumerTag -> {
        });

        String result = response.take();
        channel.basicCancel(ctag);
        return result;
    }

    public void close() throws IOException {
        connection.close();
    }
}
```
客户端代码稍微有点难懂：
* 建立连接、通道并且为回复声明独享的临时回调队列。
* 我们的call函数将会发起真是的RPC请求。
* 我们首先生成一个唯一的correlationId数字并保存，因为我们消费者的回调函数将会使用它来匹配正确的响应。
* 接下来，我们为响应创建一个独有的队列并订阅它。
* 接下来，我们将带有replyTo和correlationId属性的消息发布出去。
* 现在我们可以坐下来，等待正确的响应到来。
* 因为我们的消费者的发布操作是一个隔离的线程，所以我们需要在响应到达之前将主线程挂起，使用BlockingQueue将能达到这个目的，这里我们创建一个容量为1的ArrayBlockingQueue，因为我们只需要等待一个响应。
* 消费者只是做了一个非常简单的操作，对已经响应的消息进行correlationId的校验，如果这个correlationId是跟我们的相匹配，那么就是将这个响应放到BlockingQueue中。
* 同时，主线程将会等待响应并从BlockingQueue中取出它。
* 最后，我们将响应返回给用户。

以上代码依旧非常简单，而且没有试图去解决一些复杂且重要的问题，如：
* 当没有服务器运行时，客户端如何作出反映。
* 客户端是否需要实现类似RPC超时的东西。
* 如果服务器发生故障，并且抛出异常，是否应该被转发到客户端。
* 在处理前，防止混入无效的信息（例如检查边界）。