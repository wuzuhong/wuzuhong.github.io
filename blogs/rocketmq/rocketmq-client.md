# 【消息中间件-RocketMQ】客户端的使用
## 添加依赖
```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-spring-boot-starter</artifactId>
    <version>2.2.2</version>
</dependency>
```

## 添加配置
```properties
# NameServer 的地址
rocketmq.name-server=localhost:9876
# 生产组的名称
rocketmq.producer.group=demo_producer_group
# 生产者开启消息轨迹
rocketmq.producer.enable-msg-trace=true
```

## 代码示例
#### 消息体对象
```java
public class DemoMessage {
    private String id;
    private String name;
    private String type;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
```

#### 生产者
```java
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.apache.rocketmq.spring.support.RocketMQHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
public class DemoProducer {
	@Resource
	private RocketMQTemplate rocketMQTemplate;

	@GetMapping("/produce")
	public void produce() {
		String id = UUID.randomUUID().toString();
		System.out.println(id);

		DemoMessage msg = new DemoMessage();
		msg.setId(id);
		msg.setName("DemoMessage");
		msg.setType("DemoType");

		// 同一个 shardingKey 的消息会被分配到同一个队列中，并按照顺序被消费。为保证同类型中的消息有序性，设置分区标准为当前消息所对应的类型
		String shardingKey = msg.getType();
		// 在业务层面为每条消息设置唯一标识码。可以在消息轨迹中将其作为查询条件
		String key = msg.getId();

		//顺序消息
		rocketMQTemplate.syncSendOrderly("demo_topic:demo_tag",
				MessageBuilder.withPayload(msg).setHeader(RocketMQHeaders.KEYS, key).build(), shardingKey);

//		// 延迟消息
//		rocketMQTemplate.syncSendOrderly("demo_topic:demo_tag",
//				MessageBuilder.withPayload(msg)
//						.setHeader(RocketMQHeaders.KEYS, key)
//						.setHeader(RocketMQHeaders.DELAY, "5") // 延迟投递等级为 5 ，延迟时间为 1 分钟
//						.build(), shardingKey);

//		// 批量消息
//		List<Message<DemoMessage>> messages = new ArrayList<>();
//		Message<DemoMessage> message1 = MessageBuilder.withPayload(msg).setHeader(RocketMQHeaders.KEYS, key).build();
//		messages.add(message1);
//		Message<DemoMessage> message2 = MessageBuilder.withPayload(msg).setHeader(RocketMQHeaders.KEYS, key).build();
//		messages.add(message2);
//		rocketMQTemplate.syncSendOrderly("demo_topic:demo_tag", messages, shardingKey);
	}
}
```

#### 消费者
```java

import org.apache.rocketmq.spring.annotation.ConsumeMode;
import org.apache.rocketmq.spring.annotation.MessageModel;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.stereotype.Component;

@Component
@RocketMQMessageListener(topic = "demo_topic", // 主题
        selectorExpression = "demo_tag", // 标签
        consumerGroup = "demo_consumer_group", // 消费组的名称。一般为应用的唯一标识
        consumeMode = ConsumeMode.ORDERLY, // 消费模式。为保证消息的有序性，所以设置为顺序消费
        messageModel = MessageModel.CLUSTERING, // 消息模式，为保证任意一条消息只需要被消费组内的任意一个消费者处理即可，所以设置为集群模式
        enableMsgTrace = true) // 消费者开启消息轨迹
public class DemoConsumer implements RocketMQListener<DemoMessage> {

    @Override
    public void onMessage(DemoMessage msg) {
        System.out.println(msg.getId());
        System.out.println(msg.getName());
    }

}
```

#### 事务消息生产者
```java
import demo.rocketmq.DemoMessage;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.apache.rocketmq.spring.support.RocketMQHeaders;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.UUID;

@RestController
public class TransactionProducer {
	@Resource
	private RocketMQTemplate rocketMQTemplate;

	@GetMapping("/transactionproduce")
	public void produce() {
		String id = UUID.randomUUID().toString();
		System.out.println(id);

		DemoMessage msg = new DemoMessage();
		msg.setId(id);
		msg.setName("DemoMessage");
		msg.setType("DemoType");

		// 在业务层面为每条消息设置唯一标识码。可以在消息轨迹中将其作为查询条件
		String key = msg.getId();

		// 事务消息
		rocketMQTemplate.sendMessageInTransaction("demo_topic:demo_tag",
				MessageBuilder.withPayload(msg)
						.setHeader(RocketMQHeaders.KEYS, key)
						.build(), null);
	}
}
```

#### 事务消息监听器
```java
import org.apache.rocketmq.spring.annotation.RocketMQTransactionListener;
import org.apache.rocketmq.spring.core.RocketMQLocalTransactionListener;
import org.apache.rocketmq.spring.core.RocketMQLocalTransactionState;
import org.springframework.messaging.Message;

@RocketMQTransactionListener
public class RocketMQLocalTransactionListenerImpl implements RocketMQLocalTransactionListener {

    /*
     * 根据本地事务执行结果向 Broker 提交二次确认结果
     */
    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        // 可以通过查询数据库来判断本地事务是否已经提交
        // query db

        return RocketMQLocalTransactionState.COMMIT;
    }

    /*
     * 事务消息回查
     */
    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
        // 可以通过查询数据库来判断本地事务是否已经提交
        // query db

        return RocketMQLocalTransactionState.COMMIT;
    }
}
```
