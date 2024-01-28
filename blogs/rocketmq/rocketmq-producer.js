function getBlog(){
	return blog = {"content": "# 【消息中间件-RocketMQ】生产者\n## 消息的构成\n* Topic ： 消息主题，必填，无默认值\n* Tags ： 消息标签，必填，无默认值\n* Body ： 消息体，必填，无默认值\n* Keys ： 消息的业务关键词，会在消息轨迹中使用，选填，无默认值\n* TransactionId ： 事务ID，会在事务消息中使用，选填，无默认值\n* DelayTimeLevel ： 消息延时级别，0 表示不延时，大于 0 会延时特定的时间才会被消费，选填，默认值为 0\n* WaitStoreMsgOK ： 消息是否在服务器落盘后才返回应答，选填，默认值为 true\n* Flag ： 备用字段，由应用来设置，选填，默认值为 0\n\n注意： Topic 与 Tags 都是业务上用来归类的标识，区别在于 Topic 是一级分类，而 Tag 可以理解为是二级分类。使用 Tag 可以实现对 Topic 中的消息进行分类过滤。\n\n## 主题的创建\n发送消息前，需要确保目标主题已经被创建和初始化。可以利用 RocketMQ Admin 工具或者 RocketMQ Dashboard 创建目标主题。\n\nRocketMQ 部署安装包默认开启了 autoCreateTopicEnable 配置，会自动为发送的消息创建主题，但该特性仅推荐在初期测试时使用。生产环境强烈建议管理所有主题的生命周期，关闭自动创建参数，以避免生产集群出现大量无效主题，无法管理和回收，造成集群注册压力增大，影响生产集群的稳定性。\n\n创建主题时需要设置以下参数：\n* 主题名\n* 写队列数量\n* 读队列数量\n* perm ：用于设置对当前创建 Topic 的操作权限，2表示只写，4表示只读，6表示读写。\n\n#### 为什么创建主题时需要设置写队列数量和读队列数量\n无论是写队列还是读队列，都是在做路由信息时使用的。在消息发送时，按照写队列数量返回路由信息。在消息消费时，按照读队列数量返回路由信息。\n\n举个例子，如果设置的写队列数量是8，设置的读队列数量是4，这个时候生产者会往8个队列中写入消息，但消费者就只会消费前面4个队列中的消息，后面4个队列中的消息不会被消费。反过来，如果写队列数量是4，读队列数量是8，生产者只会往前面4个队列中写入消息，消费者则会消费8个队列中的消息，当然后面4个队列中压根就没有消息。\n\n最佳实践是写队列数量等于读队列数量。\n\n设置写队列数量和读队列数量的目的在于方便队列的扩容和缩容。\n\n举个列子，如果设置的写队列数量和读队列数量都为16，现在要缩容至8，并且要确保一定不会丢失消息以及无需重启应用，那么可以先将写队列数量调整为8，等到原来的其余8个写队列中的消息全部消费完，再将读队列数量调整为8。同时缩容写队列和读队列可能会导致部分消息未被消费。\n\n## 普通消息\n* 同步发送：生产者发出一条消息后，会同步等待服务端的响应。适用场景最广泛，如重要的通知消息、短消息通知等等。\n* 异步发送：生产者发出一条消息后，不会同步等待服务端的响应，而是通过回调接口异步接收服务端的响应。适用于链路耗时较长，对响应时间较为敏感的业务场景。例如，视频上传后通知启动转码服务，转码完成后通知推送转码结果等。\n* 单向模式发送：生产者发出一条消息后，不会同步等待服务端的响应，并且也不会通过回调接口异步接收服务端的响应，即只发送请求不接收响应。适用于某些耗时非常短，但对可靠性要求并不高的场景，例如日志收集。\n\n需要注意的是，创建生产者时需要填写生产组的名称，生产者组是指同一类生产者的集合，这类生产者发送同一类消息且发送逻辑一致，通常是同一个应用的不同实例。生产组的名称在事务消息中会用到。\n\n## 顺序消息\n在 Apache RocketMQ 中支持分区顺序消息。相同 ShardingKey 的消息会被分配到同一个队列中，并按照顺序被消费。 ShardingKey 可以在生产者发送消息时指定。除此之外，还需要保证：\n* 单一生产者：不同生产者分布在不同的系统，即使设置相同的 ShardingKey ，不同生产者之间产生的消息也无法判定其先后顺序，因为多进程的生产者的发送顺序是不可控的。\n* 串行发送：如果生产者使用多线程并行发送，则不同线程间产生的消息将无法判定其先后顺序，因为多线程的生产者的发送顺序是不可控的。\n\n#### 可用性和严格顺序\n如果一个Broker掉线，那么此时队列总数是否会发化？如果发生变化，那么同一个 ShardingKey 的消息就会发送到不同的队列上，造成乱序，但可以保证可用性。如果不发生变化，那消息将会发送到掉线 Broker 的队列上，必然是失败的，但可以保证顺序。\n\n因此 Apache RocketMQ 提供了两种模式。默认会保证可用性。如果要保证严格顺序，那么在创建 Topic 时要指定 -o 参数为true，表示顺序消息，并且要在 NameServer 中的配置 orderMessageEnable 和 returnOrderTopicConfigToBroker 为 true 。\n\n## 延迟消息\n延迟消息发送是指消息发送到 Apache RocketMQ 后，并不期望立马投递这条消息，而是延迟一定时间后才投递到消费者进行消费。\n\nApache RocketMQ 不支持自定义延迟时间，而是内置了 18 个等级的延迟投递，每个等级对应不同的延迟时间。\n\n## 批量消息\n在对吞吐率有一定要求的情况下， Apache RocketMQ 可以将一些消息聚成一批以后进行发送，可以增加吞吐率，并减少 API 和网络调用次数。\n\n需要注意的是批量消息的大小不能超过 1 MiB ，否则需要自行分割，并且同一批消息的 topic 必须相同。\n\n## 事务消息\n由于普通消息无法像数据库事务一样，具备提交、回滚和统一协调的能力，所以普通消息和本地事务无法保证一致。\n\n而基于 RocketMQ 的分布式事务消息功能，在普通消息基础上，支持二阶段的提交能力。将二阶段提交和本地事务绑定，实现全局提交结果的一致性。\n\n事务消息发送步骤如下：\n1. 生产者将半事务消息发送至 Broker。\n2. Broker 将消息持久化成功之后，向生产者返回 Ack 确认消息已经发送成功，此时消息暂不能投递，为半事务消息。\n3. 生产者开始执行本地事务逻辑。\n4. 生产者根据本地事务执行结果向 Broker 提交二次确认结果（ Commit 或是 Rollback ）。 Broker 收到确认结果后处理逻辑为：二次确认结果为 Commit 时， Broker 将半事务消息标记为可投递，并投递给消费者。二次确认结果为 Rollback 时， Broker 将回滚事务，不会将半事务消息投递给消费者。\n5. 在断网或者是生产者应用重启的特殊情况下，若 Broker 未收到发送者提交的二次确认结果，或 Broker 收到的二次确认结果为 Unknown 未知状态，经过固定时间后， Broker 将对生产者集群中任一生产者实例发起事务消息回查。事务消息回查步骤为：生产者收到消息回查后，需要检查对应消息的本地事务执行的最终结果（可以通过查询数据库的数据来检查，以主键作为事务ID），生产者根据检查得到的本地事务的最终状态再次提交二次确认， Broker 仍按照步骤 4 对半事务消息进行处理。需要注意的是， Broker 仅仅会按照参数尝试指定次数，超过次数后事务会强制回滚，因此未决事务的回查时效性非常关键，需要按照业务的实际风险来设置。\n\n需要注意的是，事务消息的生产组名称 ProducerGroupName 不能随意设置。事务消息有回查机制，回查时 Broker 端如果发现原生产者已经崩溃，则会联系同一生产者组的其他生产者实例回查本地事务执行情况以 Commit 或 Rollback 半事务消息。\n\n#### 消息回查时为什么可以通过查询数据库的数据来检查\n回查过程属于另外一个事务，由于事务的隔离性，如果发送消息的本地事务未提交，那么回查过程是查不到数据的。消息回查时会把消息体作为回调参数传过来，从消息体中可以拿到主键ID，由此来查询数据库的数据即可。\n\n#### 把本地数据库逻辑放在消息发送的前面的做法是否可以替代事务消息\n不可以。\n\n本地数据库逻辑放在消息发送的前面的做法，看上去是可以实现消息发送失败报错后回滚本地事务，但是由于 Spring 事务是基于切面实现的，如果本地数据库逻辑和消息发送逻辑都成功了，但是在执行切面逻辑时宕机了，那么会导致本地事务没有提交而消息已经发送了的不一致的问题。\n", "title": "【消息中间件-RocketMQ】生产者"}
}