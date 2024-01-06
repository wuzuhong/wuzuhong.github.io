# 【其他】MySQL数据库的当前连接数超过了应用的数据库连接池的最大连接数
## 应用配置
* 当前MySQL数据库只有当前应用使用。
* 使用的是DBCP数据库连接池：
    ```xml
    <dependency>
        <groupId>commons-dbcp</groupId>
        <artifactId>commons-dbcp</artifactId>
        <version>1.4</version>
    </dependency>
    ```
* 数据库连接池的配置如下：
    ```properties
    initialSize=50
    minIdle=50
    maxIdle=100
    maxActive=100
    ```

## 正常情况
* 应用启动后，MySQL数据库的当前连接数为50（minIdle和initialSize中取其中的最大值），当流量上来后，会到达80左右，但绝对不会超过200（maxIdle+maxActive）。

## 异常情况
* 在某个夜晚，MySQL数据库的当前连接数到达1000，已经远远超过了数据库连接池的上限，导致业务异常。

## 异常分析
* 应用启动时，DBCP数据库连接池的`BasicDataSource`类中的`createDataSource`方法中会根据minIdle或initialSize来循环调用`connectionPool.addObject()`来创建数据库连接，但如果其中某一次创建数据库连接的时候刚好遇到网络波动导致异常，则会抛出异常，导致`dataSource`无法返回，导致`dataSource`为空，并且不会销毁已经创建的数据库连接，而且会导致`createDataSource`方法触发重试，并且在应用运行时每次查数据库也都会触发，这样就会再次根据minIdle或initialSize来循环调用`connectionPool.addObject()`来创建数据库连接，也就是会创建不可估量的数据库连接，导致MySQL数据库的连接数爆满。

## 解决方法
* 升级commons-dbcp到commons-dbcp2：
    ```xml
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-dbcp2</artifactId>
        <version>2.9.0</version>
    </dependency>
    ```

## 解决原理
* commons-dbcp2的2.9.0版本中会对`connectionPool.addObject()`进行异常捕获，如果发生异常，则销毁已经创建的数据库连接。
