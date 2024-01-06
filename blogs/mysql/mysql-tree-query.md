# 【mysql】通过递归来实现树查询
## 通过递归来实现树查询
### 修改mysql的group_concat函数的最大字符长度（默认为1024，若超过这个长度的字符串会被截取掉），设置为-1表示采用最大长度
```
SET GLOBAL group_concat_max_len = -1
```

此方法重启mysql会失效，可以通过修改mysql配置文件的方式来达到永久有效的目的。

### 创建查询子节点的函数，入参可以是以逗号分隔的集合
#### 步骤
* 第一步：将当前入参作为父节点的id，查出属于这个父节点的一级子节点的id（注意：只查找一级子节点）
* 第二步：将上一步查出来的子节点的id集合作为本次查找的父节点id集合，查出属于这些父节点集合的一级子节点（注意：只查找一级子节点）
* 第三步：若第二步有值，则循环执行第二步，若第二步没有值，则退出循环。

#### 函数
```
DELIMITER $$
CREATE FUNCTION `getChildList`(parentId VARCHAR (21845)) RETURNS VARCHAR(21845) CHARSET utf8
  BEGIN
    DECLARE childList VARCHAR (21845) ;
    DECLARE cTemp VARCHAR (21845) ;
    SET childList = '' ;
    SET cTemp = CAST(parentId AS CHAR) ;
    WHILE cTemp IS NOT NULL DO 
      --CONCAT函数用于及字符串拼接
      SET childList = CONCAT(cTemp, ',', childList) ;
      --GROUP_CONCAT函数用于将查出来的所有id进行拼接，默认使用逗号分隔，注意这里的pid不能与函数中的变量或入参的名字冲突
      SELECT GROUP_CONCAT(id) INTO cTemp FROM testtable WHERE FIND_IN_SET(pid, cTemp) > 0 ;
    END WHILE ;
    --LEFT(str,n)函数用于截取字符串str左边的n个字符，并返回截取到的字符串，用于去除末尾的逗号
    SET childList = LEFT(childList, LENGTH(childList) - 1) ;
    RETURN childList ;
  END$$
DELIMITER ;
```

### 调用函数来查询子节点，getChildList()中传入的为pid
```
SELECT 
* 
FROM
testtable 
WHERE FIND_IN_SET(id, getChildList('aa'))
```

### 创建查询父节点的函数，入参可以是以逗号分隔的集合
#### 步骤，步骤与查询子节点的函数类似

#### 函数
```
DELIMITER $$
CREATE FUNCTION `getParentList`(cid VARCHAR(21845)) RETURNS VARCHAR(21845) CHARSET utf8
  BEGIN
    DECLARE parentList VARCHAR(21845);  
    DECLARE pTemp VARCHAR(21845); 
    SET parentList = '' ;
    SET pTemp =CAST(cid AS CHAR); 
    WHILE pTemp IS NOT NULL DO 
      --CONCAT函数用于及字符串拼接
      SET parentList = CONCAT(pTemp,',',parentList); 
      --GROUP_CONCAT函数用于将查出来的所有id进行拼接，默认使用逗号分隔，注意这里的id不能与函数中的变量或入参的名字冲突
      SELECT GROUP_CONCAT(pid) INTO pTemp FROM testtable WHERE FIND_IN_SET(id,pTemp)>0; 
    END WHILE; 
    --LEFT(str,n)函数用于截取字符串str左边的n个字符，并返回截取到的字符串，用于去除末尾的逗号
    SET parentList = LEFT(parentList, LENGTH(parentList) - 1) ;
    RETURN parentList; 
  END$$
DELIMITER ;
```

### 调用函数来查询父节点，getParentList()中传入的为id
```
SELECT 
* 
FROM
testtable 
WHERE FIND_IN_SET(id, getParentList('aa'))
```