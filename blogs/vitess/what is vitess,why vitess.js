function getBlog(){
	return blog = {"content": "# 【Vitess】什么是vitess，为什么需要vitess\n## 什么是vitess？\nvitess是一个用于部署、扩展和管理大型MySQL实例集群的解决方案。它被设计成可以像在专用硬件上一样，在公共或私有云中有效地运行。它结合并扩展了许多重要的MySQL特性和NoSQL数据库的可伸缩性。\n\n## 为什么需要vitess？\n### vitess可以帮助我们解决以下问题：\n* 可以通过对MySQL进行切片来扩展MySQL，同时将应用程序的更改保持在最小。\n* 可以将MySQL从传统服务器迁移到私有或公有云。\n* 可以部署和管理大量的MySQL实例。  \n\nvitess中包括兼容的JDBC和使用原生查询协议的Go数据库驱动程序。此外，它还实现了几乎能够兼容其他任何语言的MySQL服务器协议。\n\n### vitess具备以下特性：\n* 性能\n  * 连接池——将前端应用程序查询复用到MySQL连接池上，以优化性能。\n  * 查询去重——对于正在执行的查询时接收到的任何相同请求，重用正在执行的查询的结果。\n  * 事务管理——限制并发事务的数量并管理截止日期以优化总体吞吐量。\n* 安全防护\n  * 查询重写和清理——限制并避免非确定性更新。\n  * 查询黑名单——自定义规则，以防止潜在的恶意查询去攻击数据库。\n  * 查询终止器——终止耗时太长的查询。\n  * 数据库表准入控制——根据连接的用户为数据库表指定访问权限。\n* 监控\n  * 性能分析——监控，诊断以及分析你的数据库性能的工具。\n  * 查询流量——使用传入的查询列表来进行OLAP工作负载分析。\n  * 更新流量——对数据库进行修改的服务器流量，可以用来传播这些更改到其他数据库的机制。\n* 拓扑管理工具\n  * 主节点管理工具。\n  * web界面管理工具。\n  * 可以用于多个数据中心或区域。\n* 切片\n  * 几乎无缝的动态的重新分片。\n  * 支持水平和垂直分片。\n  * 多个分片约束，具有插入自定义约束的能力。\n", "title": "【Vitess】什么是vitess，为什么需要vitess"}
}