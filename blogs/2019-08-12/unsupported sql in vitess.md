# 【Vitess】vitess中不支持的sql类型
## vitess还在CNCF基金会的孵化过程中，仍然不支持以下的sql类型：（最后更新：2019-08-12）
* 平均聚合
  * 示例sql：SELECT avg(sn) FROM user;
  * 说明：在单个shard中支持，在多个shard中不支持。
* 分组
  * 示例sql：SELECT name_, sn FROM user GROUP BY sn LIMIT 0, 1000;
  * 说明：GROUP BY后面仅支持数值类型，不支持其他类型。
* 排序
  * 示例sql：SELECT sn, name_ FROM user ORDER BY sn LIMIT 0, 1000;
  * 说明：ORDER BY后面字段必须在SELECT中指定，并且不能在sql的内层结构中使用order by语句。
* 关联查询
  * 示例sql：SELECT aa.name_ AS userid, abr.name_ AS rolename FROM user aa JOIN role abr ON aa.id = abr.user_id;
  * 说明：聚合函数不能和关联查询整合在一起使用。其他情况下支持。
* 子查询
  * 示例sql：SELECT NAME_ FROM role WHERE user_id in (SELECT ID_ FROM user WHERE SN <= 10);
  * 说明：子查询中要指定返回的列，而不能用*。其他情况下支持。
* UNION
  * 示例sql：SELECT NAME_ FROM user WHERE SN <= 10 UNION ALL SELECT NAME_ FROM role WHERE ID IN('ID_100', 'ID_20000');
  * 说明：不支持。
* 无列名插入
  * 示例sql：INSERT INTO role VALUES ('aa2', 'aa2', 'aa2', '1', 'aa2');
  * 说明：不支持。
* 用户角色权限相关操作
  * 说明：不支持。