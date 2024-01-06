# 【Vitess】用户指南之VTExplain
VTExplain是一个用于解释有关Vitess是如何执行SQL语句的信息的工具，是Vitess版本的MySQL "EXPLAIN"。
## 前提条件
需要编译vtexplain的二进制文件，有关如何构建此二进制文件的说明，请参阅[从源码构建](https://vitess.io/docs/contributing/build-from-source/)。

## 解释一个查询语句
为了解释一个查询语句，你需要有一个schema和一个vschema的json文件。这两个文件的内容可以通过命令行或者文件的形式传递给vtexplain。

然后就可以使用vtexplain了，就像这样：
### Select
```
vtexplain -shards 8 -vschema-file /tmp/vschema.json -schema-file /tmp/schema.sql -replication-mode "ROW" -output-mode text -sql "SELECT * from demo"
----------------------------------------------------------------------
SELECT * from demo

1 mainkeyspace/-20: select * from demo limit 10001
1 mainkeyspace/20-40: select * from demo limit 10001
1 mainkeyspace/40-60: select * from demo limit 10001
1 mainkeyspace/60-80: select * from demo limit 10001
1 mainkeyspace/80-a0: select * from demo limit 10001
1 mainkeyspace/a0-c0: select * from demo limit 10001
1 mainkeyspace/c0-e0: select * from demo limit 10001
1 mainkeyspace/e0-: select * from demo limit 10001

----------------------------------------------------------------------
```
这个输出展示了查询运行的顺序。

在这个示例中，查询规划器是对所有切片的分散查询，从输出的信息中我们可以知道：
* 查询执行的逻辑顺序。
* 当前查询是在哪些keyspace/shard中执行的。

每个查询都是在时间1上运行的，这就表明vitess是并行执行这些查询，并且自动添加了10001限制，以防止出现较多的结果。

### Insert
```
vtexplain -shards 128 -vschema-file /tmp/vschema.json -schema-file /tmp/schema.sql -replication-mode "ROW" -output-mode text -sql "INSERT INTO demo (id, name) VALUES(1, 'john')"

----------------------------------------------------------------------
INSERT INTO demo (id, name) VALUES(1, 'john')

1 mainkeyspace/22-24: begin
1 mainkeyspace/22-24: insert into demo_name_idx(name, id) values ('john', 1) /* vtgate:: keyspace_id:22c0c31d7a0b489a16332a5b32b028bc */
2 mainkeyspace/16-18: begin
2 mainkeyspace/16-18: insert into demo(id, name) values (1, 'john') /* vtgate:: keyspace_id:166b40b44aba4bd6 */
3 mainkeyspace/22-24: commit
4 mainkeyspace/16-18: commit

----------------------------------------------------------------------
```
这个例子展示了Vitess是如何使用辅助查找vindex来处理对表的插入的。

首先，在时间1，一个事务在一个切片中被打开以执行在demo_name_idx数据库表中的插入操作。然后，在时间2，第二个事务在另一个切片中被打开以确保将数据插入到 demo 数据库表中。最后这两个事务分别在时间3和时间4被提交。

### 可选参数配置
可选参数--shards指定要模拟的切片数量。vtexplain总是为每个切片分配一个均匀划分的键范围。

可选参数--replication-mode用于控制是要模拟基于行的复制还是要模拟基于语句的复制。

你可以使用以下命令来找到更多关于vtexplain的使用方式：
```
vtexplain --help
```
