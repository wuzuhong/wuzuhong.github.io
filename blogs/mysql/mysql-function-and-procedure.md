# 【mysql】函数与存储过程
## 概述
函数和存储过程都可以执行一系列的sql语句集，有入参和返回值，并且其逻辑中可以定义变量、执行IF判断语句、执行WHILE循环语句等等

## 函数与存储过程的区别
* 存储过程可以有多个返回值,而自定义函数只有一个返回值

* 存储过程一般独立的来执行,而函数往往是作为其他SQL语句的一部分来使用

## 存储过程存在的好处
存储过程就是把经常使用的SQL语句或业务逻辑封装起来，预编译保存在数据库中，当需要的时候从数据库中直接调用，省去了编译的过程，提高了运行速度，同时降低网络数据传输量。

## 创建存储过程
```
DELIMITER $
CREATE PROCEDURE count_book ( IN typeId INT,OUT count_num INT)
BEGIN 
    SELECT COUNT(*) FROM tb_book WHERE type_id=typeId;
END $
DELIMITER ;
```

## 创建函数
```
DELIMITER $
CREATE FUNCTION select_book (bookId INT)
RETURNS VARCHAR(20)
BEGIN 
    RETURN ( SELECT book_name FROM tb_book WHERE id=bookId );
END $
DELIMITER ;
```

## 调用存储过程
```
CALL count_book(1, @total);
select @total;
```

## 调用函数
```
SELECT select_book(2);
```