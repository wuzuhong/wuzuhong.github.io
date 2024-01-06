# 【Vitess】vitess中不支持的sql类型
## vitess还在CNCF基金会的孵化过程中，仍然不支持以下的sql类型：（最后更新：2019-08-12）
* 平均聚合
  * 示例sql：SELECT avg(sn_) FROM demo;
  * 说明：在单个shard中支持，在多个shard中不支持。
* 分组
  * 示例sql：SELECT name_, sn_ FROM demo GROUP BY sn_ LIMIT 0, 1000;
  * 说明：GROUP BY后面仅支持数值类型，不支持其他类型。
* 排序
  * 示例sql：SELECT sn_, name_ FROM demo ORDER BY sn_ LIMIT 0, 1000;
  * 说明：ORDER BY后面字段必须在SELECT中指定，并且不能在sql的内层结构中使用order by语句。
* 关联查询
  * 示例sql：SELECT demo1.name_, demo2.sn_ FROM demo1 JOIN demo2 ON demo1.id = demo2.demo1_id;
  * 说明：聚合函数不能和关联查询整合在一起使用。其他情况下支持。
* 子查询
  * 示例sql：SELECT name_ FROM demo1 WHERE demo2_id in (SELECT id_ FROM demo2 WHERE sn_ <= 10);
  * 说明：子查询中要指定返回的列，而不能用*。其他情况下支持。
* UNION
  * 说明：不支持。
* 无列名插入
  * 说明：不支持。
* 用户角色权限相关操作
  * 说明：不支持。