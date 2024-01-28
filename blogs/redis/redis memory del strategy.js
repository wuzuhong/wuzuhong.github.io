function getBlog(){
	return blog = {"content": "# 【Redis-5.0】内存淘汰策略\n\n## Redis 是如何判断那些已经设置了过期时间的数据是否已经过期\n\n#### 过期时间的存储结构\nRedis 使用**过期字典**来保存数据的过期时间。其中过期字典的 key 就是 Redis 中的 key ，过期字典的 value （长整型）就是过期时间戳。过期检查也就是检查这个过期字段。\n\n#### 过期数据的删除策略\n* 惰性删除：只会在获取 key 才会对数据进行过期检查并删除。\n* 定期删除：每隔一段时间抽取一批 key 进行过期检查并删除。\n\nRedis 采用的是：惰性删除 + 定期删除。\n\n## Redis 是如何在需要存储的数据量大于内存容量的情况下进行内存淘汰的\n当内存不足以容纳新写入的数据时， Redis 提供 8 种内存淘汰策略（默认的淘汰策略为 no-envicition ）：\n1. no-envicition （默认） ：当内存不足以容纳新写入的数据时，新写入操作会报错。\n2. allkeys-random ：随机选取数据进行淘汰。\n3. allkeys-lru ：选取最近最少使用的数据进行淘汰。\n4. volatile-random ：在已经设置过期时间的数据中随机选取数据进行淘汰。\n5. volatile-ttl ：在已经设置过期时间的数据中选取即将要过期的数据进行淘汰。\n6. volatile-lru ：在已经设置过期时间的数据中选取最近最少使用的数据进行淘汰。\n7. volatile-lfu ：在已经设置过期时间的数据中选取某段时间内最少使用的数据进行淘汰。\n8. allkeys-lfu ：选取某段时间内最少使用的数据进行淘汰。", "title": "【Redis-5.0】内存淘汰策略"}
}