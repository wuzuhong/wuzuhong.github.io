# 【分布式配置中心—Apollo】部署apollo服务端
apollo服务端基于Spring Boot和Spring Cloud开发，打包后可以直接运行，不需要额外安装Tomcat等应用容器。

从 https://github.com/ctripcorp/apollo/releases 中下载所需版本的源码，解压后可看到其中有很多的子工程，而我们需要部署的只有以下三个子工程：
* apollo-adminservice ，其中包括 Admin Service 模块
* apollo-configservice ，其中包括 Config Service 模块、 Meta Server 模块和 Eureka 模块
* apollo-portal ，其中包括 Portal 模块

除了以上三个子工程外，还需要部署一个 MySQL 来作为 apollo 的数据库，并且需要对 MySQL 进行初始化操作，初始化脚本有 `scripts\db\migration\configdb\V1.0.0__initialization.sql` 和`scripts\db\migration\portaldb\V1.0.0__initialization.sql` 两个。

数据库创建完成后，需要对 apollo-adminservice 和 apollo-configservice 工程的数据库连接参数进行配置。

需要注意的是： apollo-adminservice 工程、 apollo-configservice 工程和 MySQL 数据库在每个环境都需要单独部署；所有环境共用同一个 apollo-portal 工程。