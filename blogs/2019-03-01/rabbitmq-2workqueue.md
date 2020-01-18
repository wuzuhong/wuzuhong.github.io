# 【消息中间件—rabbitmq】工作队列
## 概述
Work Queues，工作队列。在程序运行时会遇到一些资源密集型的任务，如果它们被立即执行了，那么程序就必须等待直到它执行完成，为了防止这种情况出现，我们希望能够调度这些任务，让它过一会儿再执行，这就是工作队列的主要目的。工作队列就是将任务转换成消息的形式并发送到队列中，运行在后台的工作进程将会把这些任务一个一个取出来并执行，当我们运行了多个后台工作进程，那么这些任务将会均分给这些多个后台进程。工作队列的概念在高并发、计算量大的web应用中非常管用。
工作队列的实现也是基于消费者和生产者的，我们可以把生产者当作产生任务消息的web应用，把消费者当作执行任务的工作进程，这样就实现了一个工作队列。
## 消息确认
在当前版本的RabbitMQ中，已经发送给消费者的消息将会被RabbitMQ服务端立即标记为删除状态。这样的话，在工作队列中，如果我们的后台工作进程在运行时突然宕机了，那么我们会丢失所有已经发送给后台工作进程并且还没有执行完成的任务。这种情况是我们不希望看到的，我们希望在一个后台工作进程宕机后，我们可以将这些已经发送但是没有执行完成的任务发送给另外一个后台工作进程。
为了确保消息永远不会被丢失，RabbitMQ支持消息确认机制。消息确认就是消费者给RabbitMQ服务端的回复，以此来通知RabbitMQ服务端当前消息已经接收并且任务成功执行完成，可以将该消息删除了。
如果消费者在给RabbitMQ服务端进行回复的时候宕机了，那么RabbitMQ服务端将会认为这条消息没有完全被执行并且会重新将这条消息加入队列，然后发送给其他消费者。这样就能保证消息永远不会被丢失。
消息确认是在消费者中开启的，示例：
```
//接受broker发过来的消息，异步阻塞式
DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    String message = new String(delivery.getBody(), "UTF-8");
    System.out.println("【消费者日志】接收到了消息：" + message + "'");
    try {
        //业务代码
    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        //如果业务代码执行出现异常，也需要进行消息确认，
        //因为只有进行了消息确认，RabbitMQ才会把这条消息删除，从而能释放更多的空间。
        //这里是因为业务代码的问题，所以这条消息是可以进行确认的。
        //这里必须在接收消息的那个通道里进行消息确认，否则将会导致异常。
        //这里的false表示只确认当前提供的Delivery Tag中的消息；如果是true，则表示确认当前通道中的所有的消息。
        boolean multiple = false;
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), multiple);
    }
};
//这里的false表示开启消息确认
boolean autoAck = false;
channel.basicConsume(QUEUE_NAME, autoAck, deliverCallback, cancelCallback -> {
    System.out.println("【消费者日志】当前消费者被取消了");
});
```
## 消息持久化
通过消息确认机制可以保证我们的消息永不丢失，但这都是建立在我们的RabbitMQ服务端正常运行的前提之上的。如果我们的RabbitMQ服务端宕机了，我们的消息还是可能会丢失，为了防止这种情况，我们需要将消息进行持久化存储。
首先需要在声明消息队列的时候指定durable参数为true（表示消息为持久化的，消费者和生产者都需要这样做）：
```
boolean durable = true;
channel.queueDeclare("hello", durable, false, false, null);
```
需要注意的是不能改变一个已经存在的消息队列的参数，否则会报错。
然后需要在生产者发送消息时指定消息为持久化存储：
```
channel.basicPublish("", QUEUE_NAME, MessageProperties.PERSISTENT_TEXT_PLAIN, message.getBytes());
```
通过以上两个步骤就完成了消息持久化。

## 消息公平分发
可能存在这么一种情况，有两个后端工作进程，一个负载很高，另一个负载很小，RabbitMQ服务端中有一些消息，这些消息中有一部分计算量极大，另一部分几乎没有什么计算量，但是这时RabbitMQ服务端并不知道那两个后端工作进程的情况，它还是会把这些消息平均的分发（注意：平均并不是公平）给两个后端工作进程。这不是我们希望看到的。
我们可以在一些负载很高的消费者中添加如下两行代码（位于接收消息的代码之前）：
```
//用于来告诉RabbitMQ一次只发送一条消息过来，并且只有在上一条消息被确认后才发过来。
int prefetchCount = 1;
channel.basicQos(prefetchCount);

//接受消息
DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    String message = new String(delivery.getBody(), "UTF-8");
    System.out.println("【消费者日志】接收到了消息：" + message + "'");
    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
};
channel.basicConsume(QUEUE_NAME, true, deliverCallback, cancelCallback -> {
    System.out.println("【消费者日志】当前消费者被取消了");
});
```