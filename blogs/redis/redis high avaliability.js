function getBlog(){
	return blog = {"content": "# 【Redis-5.0】高可用\n* 参考1：https://www.cnblogs.com/twinhead/p/9900659.html\n* 参考2：http://www.redis.cn/topics/cluster-tutorial.html\n\n通常都是使用Redis单副本，采用单个Redis节点部署架构，没有备用节点实时同步数据，不提供数据持久化和备份策略，简单方便，适用于数据可靠性要求不高的纯缓存业务场景。\n\n为了提高Redis的可靠性，需要采用其高可用方案，目前可以通过主从模式、哨兵模式和集群模式来部署Redis，从而达到高可用的目的。\n\n## 主从复制模式（Replication）\n采用主从署结构，相较于单副本而言最大的特点就是主从实例间数据实时同步。\n\n主从实例部署在不同的物理服务器上，根据公司的基础环境配置，可以实现同时对外提供服务和读写分离策略。\n\n![主从模式](./images/redis01.jpg)\n\n#### 优点\n* 高可靠性：一方面，采用双机主备架构，能够在主库出现故障时自动进行主备切换，从库提升为主库提供服务，保证服务平稳运行\n* 读写分离策略：从节点可以扩展主库节点的读能力，有效应对大并发量的读操作\n\n#### 缺点\n* 故障恢复复杂，当主库节点出现故障时，需要手动将一个从节点晋升为主节点，同时需要通知业务方变更配置，并且需要让其它从库节点去复制新主库节点，整个过程需要人为干预，比较繁琐\n* 主库的写能力和存储能力受到单机的限制，可以考虑分片\n* 主从复制过程中可能会阻塞请求，影响服务器性能\n\n## 哨兵模式（Sentinel）\nRedis Sentinel是社区版本推出的原生高可用解决方案，其部署架构主要包括两部分：Redis Sentinel集群和Redis数据集群。\n\n其中Redis Sentinel集群是由若干Sentinel节点组成的分布式集群，可以实现故障发现、故障自动转移、配置中心和客户端通知。Redis Sentinel的节点数量要满足2n+1（n>=1）的奇数个。\n\n![哨兵模式](./images/redis02.jpg)\n\n#### 优点\n* Redis Sentinel集群部署简单\n* 能够解决Redis主从模式下的高可用切换问题，当主库节点出现故障时，能够自动将一个从节点晋升为主节点\n* 可以实现一套Sentinel监控一组Redis数据节点或多组数据节点\n\n#### 缺点\n* 部署相对Redis主从模式要复杂一些，原理理解更繁琐\n* 资源浪费，Redis数据节点中slave节点作为备份节点，其不对外提供服务\n* 不能解决读写分离问题，实现起来相对复杂\n\n## 集群模式（Cluster）\n\n#### Redis 集群的简要介绍\nRedis 集群是一个提供在多个Redis间节点间共享数据的程序集。\n\nRedis 集群是去中心化的，每个节点都维护着集群所有节点的信息。因此使用Jedis客户端的JedisCluster时只需配置一个节点即可访问整个集群。\n\nRedis 集群并不支持处理多个keys的命令，因为这需要在不同的节点间移动数据，从而达不到像Redis那样的性能，在高负载的情况下可能会导致不可预料的错误。\n\nRedis 集群通过分区来提供一定程度的可用性，在实际环境中当某个节点宕机或者不可达的情况下继续处理命令。Redis 集群的优势：\n* 自动分割数据到不同的节点上\n* 在整个集群的部分节点失败或者不可达的情况下能够继续处理命令\n\n#### Redis 集群的数据分片\nRedis 集群没有使用一致性hash，而是引入了哈希槽的概念。Redis 集群有16384个哈希槽，每个key通过CRC16校验后对16384取模来决定放置哪个槽。集群的每个节点负责一部分hash槽，举个例子，比如当前集群有3个节点，那么：\n* 节点 A 包含 0 到 5500号哈希槽\n* 节点 B 包含5501 到 11000 号哈希槽\n* 节点 C 包含11001 到 16384号哈希槽\n\n哈希槽结构很容易添加或者删除节点。比如如果想新添加个节点D，只需要从节点 A、B、C 中得部分槽转移到 D 上。如果想移除节点A，只需要将 A 中的槽移到 B 和 C 节点上，然后将没有任何槽的 A 节点从集群中移除即可。由于从一个节点将哈希槽移动到另一个节点并不会停止服务，所以无论添加删除或者改变某个节点的哈希槽的数量都不会造成集群不可用的状态。\n\n可以通过hashtag来将某一类数据存储到相同的槽（相同的实例）中，其实现方式是将key或者key的某一部分加上{}，这样就只会计算{}中数据来决定放置到哪个槽。使用了hashtag可以使用redis的所有命令，因为这些key都存在于同一个实例。\n\n#### Redis 集群的主从复制模型\n为了保证在部分节点失败或者大部分节点无法通信的情况下集群仍然可用，集群使用了主从复制模型，每个节点都会有N-1个复制品。\n\n在上面的例子中具有 A、B、C 三个节点的集群，在没有主从复制模型的情况下，如果节点B失败了，那么整个集群就会以为缺少 5501-11000 这个范围的槽而导致不可用。\n\n然而如果在集群创建的时候（或者过一段时间）为每个节点添加一个从节点 A1、B1、C1，那么整个集群便有三个master节点和三个slave节点组成，这样在节点B失败后，集群便会选举B1为新的主节点继续服务，整个集群便不会因为槽找不到而不可用了。不过当B和B1都失败后，集群是不可用的。\n\n#### 选举机制\n\n参与选举的是所有的master，所有的master之间维持着心跳，如果一半以上的master确定某个master失联（所以主节点最少为3个，数量为单数），则集群认为该master挂掉，此时发生主从切换。\n\n通过选举机制来确定哪一个从节点升级为master。选举的依据是网络连接更正常和复制偏移量较小和运行id较小等等。选举之后将该slave升为新master。\n\n#### Redis 集群的一致性保证\nRedis 并不能保证数据的强一致性，这意味这在实际中集群在特定的条件下可能会丢失写操作。\n\n第一个原因是因为集群是用了异步复制，写操作过程:\n* 客户端向主节点B写入一条命令\n* 主节点B向客户端回复命令状态\n* 主节点将写操作复制给它的从节点 B1, B2 和 B3\n\n主节点对命令的复制工作发生在返回命令回复之后，因为如果每次处理命令请求都需要等待复制操作完成的话，那么主节点处理命令请求的速度将极大地降低（必须在性能和一致性之间做出权衡）。\n\n#### 网络分区异常下的 Redis 集群\nRedis 集群另外一种可能会丢失命令的情况是集群出现了网络分区，并且一个客户端与至少包括一个主节点在内的少数实例被孤立。\n\n举个例子，假设集群包含 A、B、C、A1、B1、C1 六个节点，其中 A、B、C 为主节点，A1、B1、C1 为 A、B、C 的从节点，还有一个客户端 Z1，假设集群中发生网络分区（集群中的有些节点的网络不是互通的），那么集群可能会分为两方，大部分的一方包含节点 A、C、A1、B1 和 C1，小部分的一方则包含节点 B 和客户端 Z1。\n\nZ1 仍然能够向主节点 B 中写入，如果网络分区发生时间较短，那么集群将会继续正常运作，如果分区的时间足够让大部分的一方将 B1 选举为新的 master，那么Z1写入B中得数据便丢失了，因为此时 B 已经不是 master 并且写操作已经结束，不会再写入 B1。\n\n注意，在网络分区出现期间，客户端 Z1 可以向主节点 B 发送写命令的最大时间是有限制的，这一时间限制称为节点超时时间，是 Redis 集群的一个重要的配置。\n\n#### 优点\n* 去中心化\n* 数据按照哈希槽存储分布在多个节点，节点间数据共享，可动态调整数据分布\n* 高扩展性，可线性扩展到16384多个节点（和哈希槽的数量一致），节点可动态添加或删除\n* 高可用性，部分节点不可用时，集群仍可用。通过增加Slave做standby数据副本，能够实现故障自动failover，节点之间通过gossip协议交换状态信息，用投票机制完成Slave到Master的角色提升\n\n#### 缺点\n* 数据通过异步复制，不保证数据的强一致性\n* Key批量操作（如mset、mget）限制，目前只支持具有相同哈希槽的Key执行批量操作。对于映射为不同哈希槽的Key，由于Keys不支持跨哈希槽的查询，所以对执行mset、mget、sunion等操作的支持不友好\n* Key事务操作支持有限，只支持多key在同一节点上的事务操作，当多个Key分布于不同的节点上时无法使用事务功能\n* Key作为数据分区的最小粒度，不能将一个很大的键值对象如hash、list等映射到不同的节点。\n* 不支持多数据库空间，单机下的redis可以支持到16个数据库，集群模式下只能使用1个数据库空间，即db 0\n* 不建议使用pipeline和multi-keys操作，以减少max redirect异常的产生", "title": "【Redis-5.0】高可用"}
}