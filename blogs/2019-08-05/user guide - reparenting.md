# 【Vitess】用户指南之Reparenting
reparenting是将一个切片的主tablet从一个tablet切换到另一个tablet，或者是将一个副tablet指向另外一个主tablet的过程。reparenting可以手动发起，也可以根据特定的数据库条件自动触发。例如，可能会在维护过程中手动reparenting一个切片或tablet，或者在主tablet死亡时自动触发reparenting。

本章节将会介绍vitess支持的reparenting类型：
* Active reparenting：当vitess工具链管理整个reparenting过程时发生。
* External reparenting：当另一个工具处理reparenting过程时发生，Vitess工具链仅更新其topology服务器、replication graph和serving graph，以准确反映主从关系。

注意：<code>InitShardMaster</code>命令定义了切片中初始的parenting关系。这个命令指定切片中的一个tablet成为主tablet，其他的tablet成为副tablet，副tablet从主tablet中复制数据。

## MySQL的需求
### GTIDs
Vitess要求在其操作中使用全局事务标识符(GTIDs)：
* 在Active reparenting过程中，vitess使用GTIDs来初始化主从复制过程，然后依赖GTID流在reparenting时确保正确性。（在外部reparenting过程中，vitess假定外部的工具管理了reparenting过程）。
* 在重新切片过程中，vitess使用GTIDs进行过滤复制，这个过程将源tablet的数据传输到正确的tablet。

### 半同步复制
vitess不依赖与半同步复制，但如果它被实现，它还是有效的。较大的vitess部署通常都会实现半同步复制。

### Active Reparenting
可以使用以下vtctl命令来执行reparenting操作：
* <code>PlannedReparentShard</code>
* <code>EmergencyReparentShard</code>

这两个命令都将锁定全局topology服务器中的切片记录。这两个命令不能同时执行，也都不能和<code>InitShardMaster</code>命令同时执行。

这两个命令都依赖于可用的全局topology服务器，并且他们都会在topology服务器的<code>_vt.reparent_journal</code>数据库表中插入行数据。因此，您可以通过查看该表来查看数据库的reparenting历史记录。

### PlannedReparentShard
当当前主tablet不可用时，可以使用<code>PlannedReparentShard</code>命令强制将其重定向到新的主tablet。该命令假定无法从当前主tablet检索数据，因为它已死或无法正常工作。

因此，此命令完全不依赖于当前主tablet将数据复制到新的主tablet。相反，它确保在所有可用的副tablet中，主选tablet具有最新的复制位置。

注意：在执行这个命令之前，必须首先确定具有最高级复制位置的副tablet，因为必须将该副tablet指定为新的主tablet。可以使用<code>vtctl ShardReplicationPositions</code>命令来确定当前切片的副tablet的当前复制位置。

这个命令将会执行以下操作：
1. 确定所有副tablet的当前复制位置，并确认主选tablet具有最新的复制位置。
2. 推广主选tablet成为新的主tablet。除了将其tablet类型更改为master之外，主选tablet还会执行新状态可能需要的任何其他更改。
3. 通过以下步骤确保复制正常运行：
* 在主选tablet上，vitess在测试数据库表中插入一个条目，然后更新全局切片对象的<code>MasterAlias</code>记录。
* 在每个副tablet上并行地(不包括旧的主tablet)，vitess设置主tablet并等待测试条目复制到副tablet上。(在调用命令之前没有复制的副tablet将保留在当前状态，在reparenting过程之后不会开始复制)。

## External Reparenting
External reparenting在另一个工具处理改变切片的主tablet的进程时发生。当它发生之后，这个工具需要调用<code>vtctl TabletExternallyReparented</code>命令来确保topology server，replication graph和serving graph进行相应的更新。

这个命令将会执行以下操作：
1. 在全局的topology server中将当前的切片进行锁定。
2. 从全局的topology server读取读取当前切片对象。
3. 读取切片的replication graph中的所有tablet。在这个步骤中，vitess允许部分读取，这意味着即使数据中心关闭，只要包含新的主tablet的数据中心可用，vitess也会继续执行。
4. 确保新的主tablet的状态被正确更新，并且新的主tablet不是另一个主tablet的副本。它运行MySQL的<code>show slave status</code>命令，最终目的是确认MySQL的<code>reset slave</code>命令已经在tablet上执行。
5. 更新topology server记录和replication graph，以反映新的主tablet。如果老的主tablet在这一步没有成功返回，vitess将其tablet类型更改为spare，以确保它不会干扰正在进行的操作。
6. 更新切片对象以指定新的主tablet。

<code>TabletExternallyReparented</code>命令将会在下面的情况中执行失败：
* 全局topology server不能用于锁定和修改。在这种情况下，操作将会完全失败。

在任何依赖External Reparenting的体系中，Active Reparenting可能是一种危险的做法。您可以在启动vtctld时通过将<code>--disable_active_reparents</code>标志设置为true来禁用Active Reparenting。(在启动vtctld后，不能设置该标志)。

## Fixing Replication
如果在reparenting操作正在运行时无法使用tablet，那么在reparenting之后，tablet就会成为孤儿，但随后会恢复。在这种情况下，您可以使用<code>vtctl ReparentTablet</code>命令手动将这个tablet的主tablet重置为当前切片的主tablet。然后，如果tablet已经停止复制了，那么通过调用<code>vtctl StartSlave</code>命令来使tablet重新启动复制。