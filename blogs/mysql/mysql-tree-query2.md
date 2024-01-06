# 【mysql】通过左右值编码来实现树查询
## 通过左右值编码来实现树查询
### 修改数据库表
为了能够通过左右值编码来实现树查询，我们只需要在我们的数据库表中加上代表左值和代表右值的两个字段；并且我们不再需要id和pid去维护父子关系，因此我们可以将pid字段删除。

### 原理
基于树的前序遍历设计的一种全新的无递归查询、无限分组的左右值编码方案，来保存该树的数据。例如我们的表数据是这样的：（这里用Lft代表左值，用Rgt代表右值）

![Treetable](./images/mysql-treetable.jpg)

那么我们将其树结构画出来就是这样的：

![Tree](./images/mysql-tree.jpg)

当用手指指着表中的数字从1数到18，就会发现手指移动的顺序就是对这棵树进行前序遍历的顺序，如下图所示。当我们从根节点Food左侧开始，标记为1，并沿前序遍历的方向，依次在遍历的路径上标注数字，最后我们回到了根节点Food，并在右边写上了18。
  
依据此设计，我们可以推断出所有左值大于2，并且右值小于11的节点都是Fruit的后续节点，整棵树的结构通过左值和右值存储了下来。
  
左右值的确定方式是按照深度优先，由左到右的原则遍历整个树，从1开始给每个节点标注上left值和right值，并将这两个值存入name对应的行之中。

### 查询
#### 获取某个节点下的所有子孙节点，以Fruit为例
```
SELECT * FROM Tree WHERE Lft > 2 AND Lft < 11 ORDER BY Lft ASC
```

#### 获取子孙节点总数
```
子孙总数 = (右值–左值–1)/2，以Fruit为例，其子孙总数为：(11–2–1)/2 = 4
```

#### 获取节点在树中所处的层数，以Fruit为例
```
SELECT COUNT(*) FROM Tree WHERE Lft <= 2 AND Rgt >=11
```

#### 获取当前节点所在路径，也就是按顺序获取其父节点和其本身，以Fruit为例
```
SELECT * FROM Tree WHERE Lft <= 2 AND Rgt >=11 ORDER BY Lft ASC
```

#### 在日常的处理中我们经常还会遇到的需要获取某一个节点的直属上级、同级、直属下级。
为了更好的描述层级关系，我们可以为Tree建立一个视图，添加一个层次列，该列数值可以编写一个自定义函数来计算：
```
CREATE FUNCTION `CountLayer`(`_node_id` int)
 RETURNS int(11)
BEGIN
	DECLARE _result INT;
	DECLARE _lft INT;
	DECLARE _rgt INT;
	IF EXISTS(SELECT Node_id FROM Tree WHERE Node_id = _node_id)
	THEN
		SELECT Lft,Rgt FROM Tree WHERE Node_id = _node_id INTO _lft,_rgt;
		SET _result = (SELECT COUNT(1) FROM Tree WHERE Lft <= _lft AND Rgt >= _rgt);	
		RETURN _result;
	ELSE
		RETURN 0;
	END IF;
END;
```
在添加完函数以后，我们创建一个a视图，添加新的层次列（当然也可以不用视图，直接新增一个层次列）
```
CREATE VIEW `NewView`AS 
SELECT Node_id, Name, Lft, Rgt, CountLayer(Node_id) AS Layer FROM Tree ORDER BY Lft ;
```

#### 获取当前节点父节点,以Fruit为例
```
SELECT * FROM treeview WHERE Lft <= 2 AND Rgt >=11 AND Layer=1
```

#### 获取所有直属子节点，以Fruit为例
```
SELECT * FROM treeview WHERE Lft BETWEEN 2 AND 11 AND Layer=3
```

#### 获取所有兄弟节点，以Fruit为例
```
SELECT * FROM treeview WHERE Rgt > 11 AND Rgt < (SELECT Rgt FROM treeview WHERE Lft <= 2 AND Rgt >=11 AND Layer=1) AND Layer=2
```

#### 返回所有叶子节点，也就是最底层的节点
```
SELECT * FROM Tree WHERE Rgt = Lft + 1
```

### 新增
首先我们需要为新增的这个数据腾出空间，比如说我们想在Fruit下面新增一个数据，那么就需要将所有右值大于等于Fruit右值的节点的右值加上2并且将所有左值大于Fruit右值的节点的左值加上2，这样就为新插入的值腾出了空间
```
UPDATE Tree SET Rgt = Rgt + 2 WHERE Rgt >= 11;
UPDATE Tree SET Lft = Lft + 2 WHERE Lft > 11;
```
然后就可以在腾出的空间里建立一个新的数据节点了，它的左值为原来的Fruit的右值，它的右值为原来的Fruit的右值加上1
```
INSERT INTO Tree SET Node_id=10 ,Name='Strawberry', Lft=11, Rgt=12, ;
```

### 删除
与新增相反，删除是要将这个被删除的数据所遗留的空间去除（其子孙节点也会被删除），首先需要计算其他节点左右值需要变化的量
```
变化量=被删除节点的右值-被删除节点的左值+1
```
然后，所有右值大于被删除节点右值的节点的左右值都需要减去这个变化量。以删除Fruit节点为例（其子孙节点也会被删除），变化量就是10，那么其他节点就需要进行相应的变更
```
UPDATE Tree SET Lft = Lft - 10, Rgt = Rgt - 10 WHERE Lft > 11;
```

### 修改
修改还没有什么好的解决方法，现在能想到的就是先删除，然后再新增，由此来实现修改。

## 通过左右值编码来实现树查询和通过递归来实现树查询的优缺点
* 后者在新增、删除、修改的速度上比前者要快
* 前者在查询的速度上比后者要快

### 推荐使用左右值编码来实现树查询，因为即使在新增、删除、修改的速度上稍微逊色一点，但是也只需要遍历一次数据库，并且在查询的速度上可以达到极致，并在在通常情况下，查询的场景要比新增、删除、修改的使用场景更加常见和频繁