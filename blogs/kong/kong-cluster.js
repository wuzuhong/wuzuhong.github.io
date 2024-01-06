function getBlog(){
	return blog = {"content": "# 【微服务—kong】kong集群\n* 搭建kong集群可以提高kong的可用性，也可以提高kong处理请求的能力，一般来说，需要建立一个负载均衡器用于将流量分发给kong集群中的各个节点。\n* 凡是连接同一个数据库的kong节点都是这个集群中的一个节点，也就是说要想让多个kong节点组成一个集群，只需要将他们连接同一个数据库即可。\n* 出于性能的考虑，kong不会在进行反向代理时去连接数据库，它会在启动时首次将数据库中的所有核心实体数据进行缓存，包括 Services、Routes、Consumers、Plugins、Credentials，因此所有通过管理端口对数据库进行变更的节点都需要告知这次变更给其他节点，但在kong的实现里面并不是被动告知，而是主动去异步轮询数据库以获得任何更新，并在有更新时从缓存中清除相关实体，然后重新缓存最新数据，轮询的频率可以在配置文件kong.conf中通过修改db_update_frequency（单位为秒，默认为5秒）来实现，这可以在一定程度上保证kong集群的数据一致性，因为在db_update_frequency这个范围内数据还是有可能会不一致，还有一个叫做db_cache_ttl（单位为秒，默认为0秒）的配置项可以用于强制指定kong缓存更新的间隔，但是这个配置一般用不到，因为一般kong的缓存是不会丢失的并且任何数据更新都会导致kong缓存更新，所有除了一些对数据一致性要求很高的场景，一般用不到这个配置。\n", "title": "【微服务—kong】kong集群"}
}