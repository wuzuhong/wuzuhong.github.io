# 【mysql】常用sql语句
## 数据库表
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
CREATE TABLE IF NOT EXISTS book (
  id_ INT(8) NOT NULL AUTO_INCREMENT,
  name_ VARCHAR(32) NOT NULL,
  PRIMARY KEY(id_)
)
```

* 删除数据库表
```
DROP TABLE book;
```

* 查看表结构的详细信息
```
DESC book;
```

* 查看创建数据库表时所用的语句
```
SHOW CREATE TABLE book;
```

* 修改数据库表的名字
```
ALTER TABLE book RENAME tb_book;
```

* 修改数据库表中某一列的名称和类型
```
ALTER TABLE book CHANGE name_ name2_ VARCHAR(64);
```

* 在数据库表的第一列添加一列
```
ALTER TABLE book ADD desc_ VARCHAR(255) FIRST;
```

* 在数据库表的某一列后面添加一列
```
ALTER TABLE book ADD desc_ VARCHAR(255) AFTER name_;
```

* 删除数据库中某一列
```
ALTER TABLE book DROP desc_; 
```

## 新增
* 为所有列新增数据
```
INSERT INTO book VALUES(NULL,'haha');
```

* 只为某些列上新增数据，其他列自动为NULL
```
INSERT INTO book(desc_) VALUES('haha_desc');
```

## 修改
```
UPDATE book SET name_='haha11' WHERE id_=1;
```

## 删除
```
DELETE FROM book WHERE id_=5;
```

## 查询
* 根据是否为NULL来查询
```
SELECT id_ FROM t_student WHERE sex_ IS NULL;
SELECT id_ FROM t_student WHERE sex_ IS NOT NULL;
```

* 根据是否存在于某个数据集合中来查询
```
SELECT id_ FROM t_student WHERE age_ IN (21,23);
SELECT id_ FROM t_student WHERE age_ NOT IN (21,23);
```

* 根据是否在某个范围之内来查询
```
SELECT id_ FROM t_student WHERE age_ BETWEEN 21 AND 24;
SELECT id_ FROM t_student WHERE age_ NOT BETWEEN 21 AND 24;
```

* 模糊查询
```
SELECT id_ FROM t_student WHERE name_ LIKE '张三%';
SELECT id_ FROM t_student WHERE name_ LIKE '%张三';
SELECT id_ FROM t_student WHERE name_ LIKE '%张三%';
```

* 多条件查询
```
SELECT id_ FROM t_student WHERE grade_name='一年级' AND age_=23
SELECT id_ FROM t_student WHERE grade_name='一年级' OR age_=23
```

* 排序
```
SELECT id_ FROM t_student ORDER BY age_ ASC;
SELECT id_ FROM t_student ORDER BY age_ DESC;
```

* 分组
```
SELECT id_ FROM t_student GROUP BY grade_name;
```

* 将分组后的每一组中所有的值连接起来，返回一个字符串结果列
```
SELECT grade_name,GROUP_CONCAT(name_) FROM t_student GROUP BY grade_name;
```

* 将分组后的每一组中值的数量进行计数，返回一个数量结果列
```
SELECT grade_name,COUNT(age_) FROM t_student GROUP BY grade_name;
```

* 将分组后的数据进行条件筛选
```
SELECT grade_name,COUNT(age_) count_num FROM t_student GROUP BY grade_name HAVING count_num>3;
```

* 先将数据进行分组，然后在分组的基础上进行某些字段的统计，会在最后一行返回统计结果，只对count、sum等一些统计类数学函数起作用
```
SELECT grade_name,COUNT(age_) FROM t_student GROUP BY grade_name WITH ROLLUP;
```

* 统计类查询函数COUNT、SUM、AVG、MAX、MIN

* 左连接，where条件只影响右表，也就是tb2，这里会返回tb1的所有数据和tb2中满足where条件的数据
```
select * from tb1 left join tb2 on tb1.id_ = tb2.id_
```

* 右连接，where条件只影响左表，也就是tb1，这里会返回tb2的所有数据和tb1中满足where条件的数据。
```
select * from tb1 right join tb2 on tb1.id_ = tb2.id_
```

* 内连接
```
# 内连接
select * from tb1 inner join tb2 on tb1.id_ = tb2.id_
# 内连接和以下sql的功能相同
select * from tb1,tb2 where tb1.id_=tb2.id_
```

* 子查询，就是一个SELECT语句的查询结果能够作为另一个语句的输入值，不但能够出现在Where子句中，也能够出现在from子句中，作为一个临时表使用
```
SELECT * FROM t_book WHERE book_type_id IN (SELECT id_ FROM t_booktype);
```

* ANY 和 ALL
```
SELECT * FROM t_book WHERE price_ >= ANY (SELECT price_ FROM t_pricelevel);
SELECT * FROM t_book WHERE price_ >= ALL (SELECT price_ FROM t_pricelevel);
```

* 分页，注意：order by要放在limit之前
```
SELECT * FROM t_student ORDER BY age_ ASC LIMIT 0, 5;
```

* 日期选择
```
# 查询hire_date所在月份的最后一天入职的员工信息
SELECT * FROM employees WHERE hire_date = LAST_DAY(hire_date)
# 查询hire_date所在月份倒数第二天入职的员工信息
SELECT * FROM employees WHERE hire_date = LAST_DAY(hire_date)-1
```

* 字符串处理
```
SELECT name_,CHAR_LENGTH(name_),UPPER(name_),LOWER(name_) FROM t_student;
```

* md5加密
```
INSERT INTO t_student VALUES(NULL,'2013-1-1','a',1,MD5('123456'));
```

* 数学运算
```
# ABS()用于求绝对值
SELECT num_, ABS(num_) FROM t_student;
# SQRT()用于求平方根，MOD()用于求余
SELECT SQRT(4),MOD(9,4) FROM t_student;
```