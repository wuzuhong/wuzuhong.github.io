# 【消息中间件—rabbitmq】发布和订阅
为了去阐述发布和订阅模式，我们这里将会编写一个简单的日志系统，它包含了两个程序，第一个程序用于发布日志消息，第二个程序用于接收日志消息并打印到控制台。
## 交换器
Exchanges，交换器。RabbitMQ消息模型的核心思想在于生产者从不直接发送任何消息到队列中，生产者也不知道消息是否会被发送到队列中，相反，生产者只能发送消息到交换器。
交换器是一个非常简单的东西，它一方面接收生产者的消息，另一方面发送消息到队列中，交换器必须知道如何去处理接收到的消息，是应该将这条消息添加到一条指定的队列中？还是将这条消息添加到多个队列中？还是应该将这条消息丢？不同类型的交换器对于这些处理方式有不同的定义。
当前版本可用的交换器类型有：
* "" ：默认的交换器类型，将消息发送给指定的队列。
* direct ：
* topic ：
* headers ：
* fanout ：将所有接收到的消息发送给所有它已知的队列。
```
//创建一个交换器类型
channel.exchangeDeclare("logs", "fanout");
//在生产者中将消息发送到已创建的交换器中，指定了交换器类型就不需要指定队列名称了。
channel.basicPublish( "logs", "black", null, message.getBytes());
```
## 临时队列
在某些情况下，我们可能希望在连接Rabbit服务端的时候，Rabbit服务端会自动为我们创建一个随机的、全新的队列并且当我们消费者断开连接的时候这个队列会被自动删除。这个时候我们就需要用到临时队列了，通过以下代码可以创建一个临时队列：
```
//创建一个非持久的、唯一的、自动删除的队列。queueName是一个随机值。
String queueName = channel.queueDeclare().getQueue();
```
## 绑定交换器和队列
在消费者中绑定指定队列到指定交换器，绑定可以理解为当前队列会接收指定交换器的消息。
```
channel.queueBind(queueName, "logs", "black");
```
## 完整示例
EmitLog.java
```
public class EmitLog {

  //交换器名称
  private static final String EXCHANGE_NAME = "logs";

  public static void main(String[] argv) throws Exception {
    ConnectionFactory factory = new ConnectionFactory();
    factory.setHost("localhost");
    try (Connection connection = factory.newConnection();
        Channel channel = connection.createChannel()) {
      //创建一个交换器
      channel.exchangeDeclare(EXCHANGE_NAME, "fanout");

      String message = argv.length < 1 ? "info: Hello World!" : String.join(" ", argv);
      //将消息发送到交换器。
      channel.basicPublish(EXCHANGE_NAME, "black", null, message.getBytes("UTF-8"));
      System.out.println(" [x] Sent '" + message + "'");
    }
  }
}
```
ReceiveLogs.java
```
public class ReceiveLogs {
  
  //交换器名称
  private static final String EXCHANGE_NAME = "logs";

  public static void main(String[] argv) throws Exception {
    ConnectionFactory factory = new ConnectionFactory();
    factory.setHost("localhost");
    Connection connection = factory.newConnection();
    Channel channel = connection.createChannel();

    //创建一个交换器
    channel.exchangeDeclare(EXCHANGE_NAME, "fanout");
    //创建一个临时队列
    String queueName = channel.queueDeclare().getQueue();
    //将临时队列绑定到交换器。
    channel.queueBind(queueName, EXCHANGE_NAME, "black");

    System.out.println(" [*] Waiting for messages. To exit press CTRL+C");
    //从交换器已绑定的队列中接收消息
    DeliverCallback deliverCallback = (consumerTag, delivery) -> {
      String message = new String(delivery.getBody(), "UTF-8");
      System.out.println(" [x] Received '" + message + "'");
    };
    channel.basicConsume(queueName, true, deliverCallback, consumerTag -> {
    });
  }
}
```