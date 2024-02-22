function getBlog(){
	return blog = {"content": "# 【Redis-5.0】缓存穿透、雪崩、击穿\n缓存穿透、雪崩、击穿这三个问题出现的根本原因是Redis缓存未命中，请求压力直接到达数据库。以下是其描述以及解决方法：\n* **缓存穿透：疯狂请求不存在的key。**解决方法可以是对空值进行缓存，比如第一次查询时数据库返回空并将空值缓存到Redis，在数据新增或更新时再主动更新Redis。\n* **缓存雪崩：大量key集体过期。**解决方法可以是进行缓存预热，并且不设置过期时间，在数据新增或更新或删除时再主动更新Redis。\n* **缓存击穿：热点key过期。**解决方法可以是进行缓存预热，并且不设置过期时间，在数据新增或更新或删除时再主动更新Redis。", "title": "【Redis-5.0】缓存穿透、雪崩、击穿"}
}