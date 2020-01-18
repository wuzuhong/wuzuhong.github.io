# 【mysql】常用sql语句
## 数据库和数据库表
* 创建数据库，并指定字符集为 utf8
```
CREATE DATABASE IF NOT EXISTS aa DEFAULT CHARACTER SET='utf8';
```

* 删除数据库
```
DROP DATABASE IF EXISTS aa;
```

* 显示所有数据库
```
SHOW DATABASES;
```

* 使用指定数据库，从此所有操作都将只对这个数据库产生影响
```
USE aa;
```

* 创建数据库表
```
CREATE TABLE IF NOT EXISTS USER (
  id INT(16) NOT NULL AUTO_INCREMENT,
  username VARCHAR(32) NOT NULL,
  age INT(4) DEFAULT NULL,
  sex CHAR DEFAULT NULL,
  PRIMARY KEY(id)
)
```

* 删除数据库表
```
DROP TABLE usertable;
```

* 查看表结构的详细信息
```
DESC USER;
```

* 查看创建数据库表时所用的语句
```
SHOW CREATE TABLE USER;
```

* 修改数据库表的名字
```
ALTER TABLE USER RENAME usertable;
```

* 修改数据库表中某一列的名称和类型
```
ALTER TABLE usertable CHANGE username name2 VARCHAR(32);
```

* 在数据库表的第一列添加一列
```
ALTER TABLE usertable ADD identity INT(32) FIRST;
```

* 在数据库表的某一列后面添加一列
```
ALTER TABLE usertable ADD identity2 INT(32) AFTER identity;
```

* 删除数据库中某一列
```
ALTER TABLE usertable DROP identity2; 
```

## 新增
* 为所有列新增数据
```
INSERT INTO t_book VALUES(NULL,'我爱我家',20,'张三',1);
```

* 只为某些列上新增数据，其他列自动为NULL
```
INSERT INTO t_book(bookName,author) VALUES('我爱我家','张三');
```

## 修改
```
UPDATE t_book SET bookName='Java编程思想',price=120 WHERE id=1;
```

## 删除
```
DELETE FROM t_book WHERE id=5;
```

## 查询
* 根据是否为NULL来查询
```
SELECT * FROM t_student WHERE sex IS NULL;
SELECT * FROM t_student WHERE sex IS NOT NULL;
```

* 根据是否存在于某个数据集合中来查询
```
SELECT * FROM t_student WHERE age IN (21,23);
SELECT * FROM t_student WHERE age NOT IN (21,23);
```

* 根据是否在某个范围之内来查询
```
SELECT * FROM t_student WHERE age BETWEEN 21 AND 24;
SELECT * FROM t_student WHERE age NOT BETWEEN 21 AND 24;
```

* 模糊查询
```
SELECT * FROM t_student WHERE stuName LIKE '张三%';
SELECT * FROM t_student WHERE stuName LIKE '%张三';
SELECT * FROM t_student WHERE stuName LIKE '%张三%';
```

* 多条件查询
```
SELECT * FROM t_student WHERE gradeName='一年级' AND age=23
SELECT * FROM t_student WHERE gradeName='一年级' OR age=23
```

* 排序
```
SELECT * FROM t_student ORDER BY age ASC;
SELECT * FROM t_student ORDER BY age DESC;
```

* 分组
```
SELECT * FROM t_student GROUP BY gradeName;
```

* 将分组后的每一组中所有的值连接起来，返回一个字符串结果列
```
SELECT gradeName,GROUP_CONCAT(stuName) FROM t_student GROUP BY gradeName;
```

* 将分组后的每一组中值的数量进行计数，返回一个数量结果列
```
SELECT gradeName,COUNT(stuName) FROM t_student GROUP BY gradeName;
```

* 将分组后的数据进行条件筛选
```
SELECT gradeName,COUNT(stuName) FROM t_student GROUP BY gradeName HAVING COUNT(stuName)>3;
```

* 先将数据进行分组，然后在分组的基础上进行某些字段的统计，会在最后一行返回统计结果，只对count、sum等一些统计类数学函数起作用
```
SELECT gradeName,COUNT(stuName) FROM t_student GROUP BY gradeName WITH ROLLUP;
```

* 统计类查询
```
SELECT stuName,COUNT(*) FROM t_grade GROUP BY stuName;
SELECT stuName,SUM(score) FROM t_grade WHERE stuName="张三";
SELECT stuName,SUM(score) FROM t_grade GROUP BY stuName;
SELECT stuName,AVG(score) FROM t_grade WHERE stuName="张三";
SELECT stuName,AVG(score) FROM t_grade GROUP BY stuName;
SELECT stuName,course,MAX(score) FROM t_grade WHERE stuName="张三";
SELECT stuName,MAX(score) FROM t_grade GROUP BY stuName;
SELECT stuName,course,MIN(score) FROM t_grade WHERE stuName="张三";
SELECT stuName,MIN(score) FROM t_grade GROUP BY stuName;
```

* 左连接，where条件只影响右表，也就是tbl2，这里会返回tbl1的所有数据和tbl2中满足where条件的数据
```
select * from tbl1 Left Join tbl2 where tbl1.ID = tbl2.ID
```

* 右连接，where条件只影响左表，也就是tbl1，这里会返回tbl2的所有数据和tbl1中满足where条件的数据。
```
select * from tbl1 Right Join tbl2 where tbl1.ID = tbl2.ID
```

* 内连接
```
# 内连接
select * FROM tbl1 INNER JOIN tbl2 ON tbl1.ID = tbl2.ID
# 内连接和以下sql的功能相同
select * from tbl1,tbl2 where tbl1.id=tbl2.id
```

* 子查询，就是一个SELECT语句的查询结果能够作为另一个语句的输入值，不但能够出现在Where子句中，也能够出现在from子句中，作为一个临时表使用
```
SELECT * FROM t_book WHERE booktypeId IN (SELECT id FROM t_booktype);
```

* ANY 和 ALL
```
SELECT * FROM t_book WHERE price>= ANY (SELECT price FROM t_pricelevel);
SELECT * FROM t_book WHERE price>= ALL (SELECT price FROM t_pricelevel);
```

* 分页，注意：order by要放在limit之前
```
SELECT * FROM t_student ORDER BY age ASC LIMIT 0,5;
```

* 日期选择
```
# 查询每月最后一天入职的员工信息
SELECT * FROM employees WHERE hire_date = LAST_DAY(hire_date)
# 查询每月倒数第二天入职的员工信息
SELECT * FROM employees WHERE hire_date = LAST_DAY(hire_date)-1
```

* 字符串处理
```
SELECT userName,CHAR_LENGTH(userName),UPPER(userName),LOWER(userName) FROM t_t;
```

* md5加密
```
INSERT INTO t_t VALUES(NULL,'2013-1-1','a',1,MD5('123456'));
```

* 数学运算
```
# ABS()用于求绝对值
SELECT num,ABS(num) FROM t_t;
# SQRT()用于求平方根，MOD()用于求余
SELECT SQRT(4),MOD(9,4) FROM t_t;
```