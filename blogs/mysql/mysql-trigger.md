# 【mysql】触发器
## 概述
触发器可以用于在执行INSERT或UPDATE或DELETE的sql语句之前（BEFORE）或者之后（AFTER）执行自定义的sql语句集。

## 示例：创建一个触发器，在delete之后触发
```
DELIMITER $
CREATE TRIGGER trig_book2 AFTER DELETE 
ON t_book FOR EACH ROW
BEGIN
    UPDATE t_bookType SET bookNum=bookNum-1 WHERE old.bookTypeId=t_booktype.id;
    INSERT INTO t_log VALUES(NULL, NOW(), '在book表里删除了一条数据');
    DELETE FROM t_test WHERE old.bookTypeId=t_test.id;
END $
DELIMITER ;
```

## 查看所有已创建的触发器
```
SHOW TRIGGERS;
```

## 删除一个触发器
```
DROP TRIGGER trig_book2 ;
```