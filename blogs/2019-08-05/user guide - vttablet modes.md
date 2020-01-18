# 【Vitess】用户指南之VTTablet模型
可以将vttablett配置为在多个级别下控制mysql。在控制最多的级别中，vttablet能够执行备份和恢复，响应来自vtctld的重新选举命令，自动修复副本，并强制执行半同步设置。

在控制最少的级别中，vttablet只是将应用程序的查询请求发送到MySQL。所需的控制级别是通过各种命令行参数实现的，如下所述。
## 被vitess管理的MySQL
在最高级控制模式下，vttablet可以进行备份，它还可以自动地从现有备份中恢复到新的副本。对于这个模式来说，vttablet需要和MySQL在相同的主机下运行，并且能够访问MySQL的my.cnf文件。此外，命令中不能包含任何连接参数，比如-db_host或者-db_socket，vttablet将会从my.cnf文件中获取socket信息并且使用这个信息去连接本地MySQL。

vttablet也会从my.cnf文件中获取一些其他信息，比如数据文件的路径等等。当vttablet接收到一个备份请求时，它会将MySQL停掉，然后复制这个MySQL的数据文件到后备存储器，然后重启MySQL。

可以通过以下方式指定my.cnf文件：
* 隐式指定：如果mysql是由mysqlctl工具初始化的，那么vttablet只需要通过-tablet-path参数就能找到my.cnf文件，my.cnf文件默认是在$VTDATAROOT/vt_<tablet-path>/my.cnf路径下。
* 使用-mycnf-file参数：如果my.cnf文件不在默认路径下，那么可以使用-mycnf-file参数。
* 使用-my_cnf_server_id参数和其他的命令行参数：可以通过命令行来指定所有my.cnf文件中的属性值，vttablet将会像从my.cnf文件中读取一样来读取这些命令行中指定的这些属性值。
  
在命令行中指定-db_host或-db_socket参数将会导致vttablet不会加载my.cnf文件，并且会导致vttablet的备份和恢复功能被禁用。

## -restore_from_backup参数
这个参数的值默认为false。如果被设置为true，并且my.cnf文件成功加载，那么vttablet就能够像下面一样执行自动恢复数据操作。

如果启动了一个没有数据文件的MySQL实例，vttablet将会从备份集合中查找出一个最新的备份，然后执行数据恢复操作。之后，vttablet会将这个MySQL实例指向当前的主节点并且等待去赶上数据复制，一旦复制达到指定的容忍限制，它将把自己宣传为可用服务。这将会使vtgates将其添加到健康的tablet列表中，以提供查询服务。

如果这个参数被设置为true，但my.cnf文件没有被加载，那么vttablet将会直接停止并给出错误信息。

可以使用-restore_concurrency参数来控制数据恢复操作的并发级别。这在云环境中非常有用，可以通过消耗所有可用的磁盘IOPS来保证恢复过程。

## 不被vitess管理的MySQL或者远程的MySQL
只需在命令行上指定连接参数-db_host和-db_port，就可以针对远程MySQL启动vttablet。在这个模式下，数据备份和数据恢复将会被禁用。如果针对本地mysql启动vttablet，则可以指定-db_socket参数，这仍然会使vttablet将这个MySQL视为远程。

具体来说，如果没有my.cnf文件指定给vttablet则表示它正在连接到一个远程MySQL。

## 被vitess部分管理的MySQL
对于一个远程的MySQL，vttablet仍然可以对其进行一些管理功能。例如：
* -disable_active_reparents：如果设置了这个参数，则不允许任何reparent或slave相关的命令，包括InitShardMaster、PlannedReparent、PlannedReparent、emergency cyreparent和ReparentTablet。在这种模式下，您应该使用TabletExternallyReparented命令通知vitess当前的master。
* -master_connect_retry：当mysql将从服务器连接到主服务器时，这个值作为重试持续时间参数提供给mysql。
* -enable_replication_reporter：如果设置了这个参数，那么vttablet将向vtgate传输与复制延迟相关的信息，这将允许它更好地负载均衡。此外，如果停止复制，启用此功能还将导致vttablet重新启动复制。但是，只有在未启用-disable_active_reparents时才会这样做。
* -enable_semi_sync：这个选项将自动在新的副本上启用半同步，也可以在任何转换为副本类型的tablet上启用半同步。这包括将主服务器降级为从服务器。
* -heartbeat_enable和-heartbeat_interval_duration：导致vttablet将心跳写入边车数据库。复制报告程序也使用此信息来评估复制延迟。

## 常用的vttablet命令行参数
### 只支持查询服务的最小化vttablet
```
$TOPOLOGY_FLAGS
-tablet-path $alias
-init_keyspace $keyspace
-init_shard $shard
-init_tablet_type $tablet_type
-port $port
-grpc_port $grpc_port
-service_map 'grpc-queryservice,grpc-tabletmanager,grpc-updatestream'
```
$alias必须为<cell>-id的形式，并且cell应该匹配topology中创建的一个本地cell。id的左边可以用零填充，例如cell-100和cell-000000100是一样的。
  
TOPOLOGY_FLAGS在zookeeper之类的lockserver中示例：
```
-topo_implementation zk2 -topo_global_server_address localhost:21811,localhost:21812,localhost:21813 -topo_global_root /vitess/global
```

### 启用集群管理的附加参数
```
-enable_semi_sync
-enable_replication_reporter
-backup_storage_implementation file
-file_backup_storage_root $BACKUP_MOUNT
-restore_from_backup
-vtctld_addr http://$hostname:$vtctld_web_port/
```

### 用于在prod中运行的附加参数
```
-queryserver-config-pool-size 24
-queryserver-config-stream-pool-size 24
-queryserver-config-transaction-cap 300
```
还可以使用更多的调优参数，但是为了满足合理的生产流量，上面的参数绝对是必需的。

### 将vttablet连接到已经运行的MySQL
```
-db_host $MYSQL_HOST
-db_port $MYSQL_PORT
-db_app_user $USER
-db_app_password $PASSWORD
```

## 执行多种不同操作时需要提供的额外的用户凭据
```
-db_allprivs_user
-db_allprivs_password
-db_appdebug_user
-db_appdebug_password
-db_dba_user
-db_dba_password
-db_filtered_user
-db_filtered_password
```

还有很多其他的参数可以用于进行更加完善的控制。
