# 【消息中间件—rabbitmq】路由选择
这里我们介绍另一种交换器类型：direct，消息只会发送给那些在绑定交换器时指定的routing key与生产者发送消息时指定的routing key相匹配的消费者。可以将routing key的作用理解为是对消息做进一步细分。
## 完整示例
EmitLogDirect.java
```
public class EmitLogDirect {
  //交换器名称
  private static final String EXCHANGE_NAME = "direct_logs";

  public static void main(String[] argv) throws Exception {
    ConnectionFactory factory = new ConnectionFactory();
    factory.setHost("localhost");
    try (Connection connection = factory.newConnection();
        Channel channel = connection.createChannel()) {
      //创建一个direct类型的交换器
      channel.exchangeDeclare(EXCHANGE_NAME, "direct");

      //将消息发布到那些在绑定direct交换器时具有routing key为black的消费者
      channel.basicPublish(EXCHANGE_NAME, "black", null, "this is a message".getBytes("UTF-8"));
      System.out.println(" [x] Sent '" + severity + "':'" + message + "'");
    }
  }
}
```
ReceiveLogsDirect.java
```
public class ReceiveLogsDirect {
  //交换器名称
  private static final String EXCHANGE_NAME = "direct_logs";

  public static void main(String[] argv) throws Exception {
    ConnectionFactory factory = new ConnectionFactory();
    factory.setHost("localhost");
    Connection connection = factory.newConnection();
    Channel channel = connection.createChannel();
    //创建一个direct类型的交换器
    channel.exchangeDeclare(EXCHANGE_NAME, "direct");
    //创建一个临时队列
    String queueName = channel.queueDeclare().getQueue();

    if (argv.length < 1) {
      System.err.println("Usage: ReceiveLogsDirect [info] [warning] [error]");
      System.exit(1);
    }

    for (String severity : argv) {
      //将队列绑定多个交换器，这些交换器只有routing key不同，也就是说能接收当前交换器中不同routing key中的消息，其中就包含EmitLogDirect.java中black这个routing key
      channel.queueBind(queueName, EXCHANGE_NAME, severity);
    }
    System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

    DeliverCallback deliverCallback = (consumerTag, delivery) -> {
      String message = new String(delivery.getBody(), "UTF-8");
      System.out.println(
          " [x] Received '" + delivery.getEnvelope().getRoutingKey() + "':'" + message + "'");
    };
    channel.basicConsume(queueName, true, deliverCallback, consumerTag -> {
    });
  }
}
```