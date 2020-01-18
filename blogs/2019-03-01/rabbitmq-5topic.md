# 【消息中间件—rabbitmq】主题
对于direct交换器类型来说，它是有缺陷的，因为它只能根据一个特定的routing key来进行路由，而不能根据多条件来路由，比如我们想订阅error类型和debug类型等多种类型的日志，这个时候direct交换器就无法满足我们的需求，进而我们就需要使用topic类型的交换器。
topic中的routing key不能只有一个单词，必须是多个单词，并且以点号隔开，例如："stock.usd.nyse"，总长度不能超过255个字节。
topic和direct的实现逻辑相似，在发送时带有特定routing key的消息将会被传递给所有绑定当前routing key的所有队列。在消费者中绑定routing key时可以使用*来代替一个单词，也可以使用#来代替一个或多个单词，例如："*.orange.*"、"lazy.#"，这两个占位符使得topic能够根据多条件来路由，如果没有指定这两个占位符，topic就变得和direct一样了。
## 完整示例
生产者：
```
public class EmitLogTopic {

  private static final String EXCHANGE_NAME = "topic_logs";

  public static void main(String[] argv) throws Exception {
    ConnectionFactory factory = new ConnectionFactory();
    factory.setHost("localhost");
    try (Connection connection = factory.newConnection();
         Channel channel = connection.createChannel()) {

        channel.exchangeDeclare(EXCHANGE_NAME, "topic");

        String routingKey = getRouting(argv);
        String message = getMessage(argv);

        channel.basicPublish(EXCHANGE_NAME, routingKey, null, message.getBytes("UTF-8"));
        System.out.println(" [x] Sent '" + routingKey + "':'" + message + "'");
    }
  }
  //..
}
```
消费者：
```
public class ReceiveLogsTopic {

  private static final String EXCHANGE_NAME = "topic_logs";

  public static void main(String[] argv) throws Exception {
    ConnectionFactory factory = new ConnectionFactory();
    factory.setHost("localhost");
    Connection connection = factory.newConnection();
    Channel channel = connection.createChannel();

    channel.exchangeDeclare(EXCHANGE_NAME, "topic");
    String queueName = channel.queueDeclare().getQueue();

    if (argv.length < 1) {
        System.err.println("Usage: ReceiveLogsTopic [binding_key]...");
        System.exit(1);
    }

    for (String bindingKey : argv) {
        channel.queueBind(queueName, EXCHANGE_NAME, bindingKey);
    }

    System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

    DeliverCallback deliverCallback = (consumerTag, delivery) -> {
        String message = new String(delivery.getBody(), "UTF-8");
        System.out.println(" [x] Received '" +
            delivery.getEnvelope().getRoutingKey() + "':'" + message + "'");
    };
    channel.basicConsume(queueName, true, deliverCallback, consumerTag -> { });
  }
}
```