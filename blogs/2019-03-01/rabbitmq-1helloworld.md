# 【消息中间件—rabbitmq】HelloWorld
## 简介
RabbitMQ是一个消息中间件，它能接收、存储和转发消息。
## 基本概念
* producer：生产者，向RabbitMQ服务端发送消息。
* consumer：消费者，阻塞式的接收RabbitMQ服务端的消息。
* queue：队列，用于存储消息，它存在于RabbitMQ服务端内部，可以存储在缓存或磁盘中；可以同时存在多个队列，以队列名称作区分；多个生产者可以往同一个队列中发送消息，多个消费者可以从同一个队列中接收消息。
## HelloWorld
### 使用docker启动RabbitMQ服务端
```
docker run -d --hostname my-rabbit --name my-rabbit -p 5672:5672 rabbitmq:3.7.12-alpine
```
### 使用java编写生产者和消费者
生产者，Producer.java
```
public class Producer {
  // 队列名称
  private final static String QUEUE_NAME = "queue_helloworld";
  // broker的host，可以是ip或者域名
  private final static String BROKER_HOST = "127.0.0.1";
  // broker的端口，默认为5672
  private final static int BROKER_PORT = 5672;

  public static void main(String[] args) {
    // 创建连接工厂对象
    ConnectionFactory factory = new ConnectionFactory();
    // 设置连接工厂中broker的host和port，若host指定的是ip，则需要指定端口，若host指定的是域名，则不需要指定端口.
    factory.setHost(BROKER_HOST);
    factory.setPort(BROKER_PORT);
    // 需要注意的是我们不需要在代码里显示的关闭Connection和Channel，因为Connection和Channel都在try中并且都实现了java.lang.AutoCloseable接口，如果程序发生异常或执行完成，它们会自动关闭。
    try (Connection connection = factory.newConnection();// 创建一个连接。
        Channel channel = connection.createChannel()) {// 创建一个通道，通道里面有我们想要的所有 api。
      // 定义一个队列。如果这个队列不存在，则会自动创建
      channel.queueDeclare(QUEUE_NAME, false, false, false, null);
      // 定义一个消息。
      String message = "Hello World";
      // 发送消息到指定的队列。因为这里的消息体格式是一个字节数组，所以可以与任意数据格式互相转换
      channel.basicPublish("", QUEUE_NAME, null, message.getBytes());
      System.out.println("【生产者日志】发送了消息：" + message);
    } catch (IOException e) {
      e.printStackTrace();
    } catch (TimeoutException e) {
      e.printStackTrace();
    }
  }
}
```
消费者，Consumer.java
```
public class Consumer {
  // 队列名称
  private final static String QUEUE_NAME = "queue_helloworld";
  // broker的host，可以是ip或者域名
  private final static String BROKER_HOST = "127.0.0.1";
  // broker的端口，默认为5672
  private final static int BROKER_PORT = 5672;

  public static void main(String[] args) throws Exception {
    // 创建连接工厂对象
    ConnectionFactory factory = new ConnectionFactory();
    // 设置连接工厂中broker的host和port，若host指定的是ip，则需要指定端口，若host指定的是域名，则不需要指定端口.
    factory.setHost(BROKER_HOST);
    factory.setPort(BROKER_PORT);
    // 需要注意的是我们这里不需要关闭Connection和Channel，因为作为一个消费者，是要和程序共存亡的。
    // 创建一个连接。
    Connection connection = factory.newConnection();
    // 创建一个通道。通道里面有我们想要的所有 api。
    Channel channel = connection.createChannel();
    // 定义一个队列。如果这个队列不存在，则会自动创建
    channel.queueDeclare(QUEUE_NAME, false, false, false, null);
    //接受指定队列中的消息，异步阻塞式
    DeliverCallback deliverCallback = (consumerTag, delivery) -> {
      String message = new String(delivery.getBody(), "UTF-8");
      System.out.println("【消费者日志】接收到了消息：" + message + "'");
    };
    channel.basicConsume(QUEUE_NAME, true, deliverCallback, cancelCallback -> {
      System.out.println("【消费者日志】当前消费者被取消了");
    });
  }
}
```