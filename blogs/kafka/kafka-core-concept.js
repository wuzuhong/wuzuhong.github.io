function getBlog(){
	return blog = {"content": "# 【消息中间件-Kafka】核心概念\nApache Kafka是一个事件流平台。事件流是以流的形式从事件源（例如：数据库、传感器、移动设备、云服务和软件应用程序）实时获取事件数据，再持久化存储事件数据以供后续检索和处理，最后根据需要将事件数据路由到不同的目标。\n\nApache Kafka 是一个由服务端和客户端组成的分布式系统，通过 TCP 网络协议进行通信。包括服务端和客户端，服务端也称为 Broker （支持单机或集群），客户端是以 Jar 包的形式集成在应用程序内部。\n\n## 事件（ event ）\n* 也称为消息，主要包括`key`、`value`、`timestamp`三个字段。\n* 以消息日志的形式，依赖于文件系统来存储和缓存消息。\n\n## 生产者（ producer ）\n生产者向 Broker 推送消息。\n\n#### 负载均衡\n生产者可以直接将数据发送给某个分区的主分区的 Broker 节点，而不需要任何中间的路由层。为了做到这一点，所有 Broker 节点都可以在任何给定时间内响应有关哪些 Broker 是存活的以及当前分区的主分区的 Broker 节点在哪里的请求。\n\n生产者客户端能够控制消息是要生产到哪个分区，这可以通过随机负载均衡（基于`key`的散列化）或语义分割函数来实现。可以通过实现语义分割接口来自定义控制分区逻辑。\n\n#### 异步发送（批处理）\n批处理是提高效率的重要方式。批处理开启后，生产者将会在内存中积累数据，并在单个请求中发送已积累的批量数据。可以设置批处理的批次大小和等待时间。\n\n## 消费者（ consumer ）\n消费者向 Broker 拉取消息。消费者向 Broker 发出请求并指定要消费的分区。消费者在每个请求中指定消息的偏移量，并从该位置开始接收消息，消费者对该位置具有重要的控制权，并且可以在需要时进行消息位点重置，倒回以重新消费数据。\n\n#### 消费者位点\n传统的消息确认机制（ACK）的缺点：\n* 消费者处理完成，但在发送消息确认时失败了，这时会触发 Broker 消息重发，就会导致消息重复消费。\n* 性能问题， Broker 必须为每个消息记录其多种状态并对这些状态进行处理（首先对其进行锁定，使其不会二次发送，等消息确认后，再改变其状态）。\n\n在 Kafka 中，主题会进行分区，一个分区只会有一个消费组中的一个消费者进行消费，所以每个分区中的消费者位点是一个整型。这就使得哪个消息被消费的问题变得非常简单，每个分区都只是一个整型。这就使得 Kafka 消息确认机制非常简单。\n\n在 Kafka 消费者中，可以使用消费者位点机制，实现倒回到旧的偏移量并重新消费数据。\n\n#### 静态成员关系\n静态成员关系能够提升流式应用、消费者组以及其他构建在组重平衡（ rebalance ）协议之上的应用的能力。\n\n重平衡（ rebalance ）协议依赖于组协调器将实体ID分配给组成员，这些生成的ID是短暂的，当成员重新启动和重新加入时将会变更，对于消费者来说，这种`动态成员关系`可能导致在部署、配置更新和重启等管理操作期间，大量消息被重新分配给不同的消费者实例，在处理之前，打乱的消息需要很长时间来恢复其状态，并导致消费者在这期间不可用。 Kafka 的组管理协议允许组成员提供持久的实体ID，基于这些ID的组成员关系保持不变，因此不会触发重平衡（ rebalance ）。可以通过以下方式来使用静态成员关系：\n* 对于消费者，在`ConsumerConfig`对象中设置`GROUP_INSTANCE_ID_CONFIG`字段，并且要确保每个消费者组下的每个消费者的这个值都唯一。\n* 对于流式应用，在每个`KafkaStreams`实例的`ConsumerConfig`对象中设置`GROUP_INSTANCE_ID_CONFIG`字段，独立于实例使用的线程数。\n\n## 主题（ topic ）\n* 事件是被组织并存储在主题中的。\n* 事件在被消费后不会被删除，可以通过单个主题的配置来设置事件保存在 Kafka 中的时间，超过这个时间的事件将会被丢弃。\n* Kafka 的性能在数据大小方面是恒定的，所以长时间存储数据是完全没问题的。\n\n## 分区（ partition ）\n* 主题是分区的，一个主题可以被分为多个分区，这些分区分布在不同的 Broker \n* 一个分区只会存在于一个 Broker ，一个 Broker 可以有多个分区\n* 相同`key`的事件会被保证顺序并被写到相同的分区\n* 一个分区只会分配给消费组中的一个消费者进行消费，因此如果消费者数大于分区数，那么一些消费者将不会接收到任何消息，如果消费者数小于分区数，那么一些分区将不会被消费，所以建议分区数等于消息组的消费者数\n* 相同分区中的事件在消费时是按顺序的\n* 多个生产者可以往单个分区写入\n* 分区对于扩缩容非常重要，因为它允许客户端同时从多个 Broker 读写数据。而且，一个消费者通常是一个线程，多个分区就可以对应多个消费者，即多个线程，由此提高了主题事件的处理能力。\n* 一个主题可以被分为多个分区，相同`key`的消息会被保证顺序并写到同一个分区，一个分区中的消息只能被一个消费者消费，一个消费者可以消费多个分区中的消息，一个消费组中可以有多个消费者，一个分区可以有多个副本，一个分区副本只会存在于一个Broker。\n\n## 副本（ replicated ）\n* 分区是支持多副本的，副本能够提高数据容错性和高可用性\n* 副本数必须小于或等于 Broker 节点数，生产环境建议副本数为3\n\n在 Kafka 中，每个分区的副本都有一个 leader 和零个或多个 follower 角色，所有的写操作都将转到分区的 leader ，而读操作可以转到分区的 leader 或 follower ，通常，分区比 Broker 多很多，并且 leader 在 Broker 之间均匀分布。 follower 的消息日志与 leader 的日志完全相同，它们都有相同的偏移量和相同顺序的消息。 follower 从 leader 那里消费消息，就像一个普通的 Kafka 消费者一样，并将它们应用到自己的日志中。\n\n在 Kafka 中，一个被称为 Controller 的特殊节点负责管理集群中 Broker 的注册， Broker 的存活判断依据：\n* 为了接收元数据更新， Broker 必须与 Controller 保持活跃会话，也就是心跳机制。如果在`broker.session.timeout.ms`配置的时间内无法获取心跳，那么当前判断不通过。\n* 作为 follower 的 Broker 必须复制 leader 的消息日志，不能太落后。如果在`replica.lag.time.max.ms`配置的时间内还无法追赶 leader 的最新消息，那么当前判断不通过。\n\nController 维护存活的 follower 的集合，这被称为 ISR ， leader 会跟踪 ISR 中的 follower。如果存活判断依据中的任何一个不能满足，那么作为 follower 的 Broker 将从 ISR 中删除。当 ISR 中的所有 follower 都将消息应用到它们的日志中时，就认为消息已提交。只有已提交的消息才会被发送给消费者，这意味着如果 leader 宕机，消费者不用担心会收到可能丢失的消息。生产者可以在`acks`中配置等待消息提交。 Kafka 允许副本重新加入 ISR ，但在重新加入之前，它必须再次完全重新同步。当 Controller 检测到 leader 宕机， Controller 会从 ISR  中任意选出一个 follower 作为新的 leader ，由于 ISR 机制及其确认提交机制， ISR 中的任意 follower 都可以成为 leader ，如果 Controller 宕机，则会选出另一个Controller 。\n\nKafka 使用轮询方式平衡集群内的分区，以避免在少量节点上为大容量主题聚集所有分区。用同样的方式平衡 leader ，以便每个节点在其分区中成为 leader 。", "title": "【消息中间件-Kafka】核心概念"}
}