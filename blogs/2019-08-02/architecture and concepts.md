# 【Vitess】vitess的架构及其核心概念
## vitess的架构
![架构图](./images/VitessOverview.png)
### Topology
Topology Service服务是一个包含了运行中的服务器、切片约束以及副本关系图信息的元数据库。Topology Service依靠一个持久化的数据库，在kubernetes中，这个数据库是etcd，并且Vitess也支持ZooKeeper。我们可以通过vtctl（一个命令行工具）和vtctld（一个可视化的web界面）来查看Topology Service。
### vtgate
vtgate是一个轻量级的代理服务器，用于转发流量到正确的vttablet中并且给客户端返回整理过后的结果。客户端的请求就是发送给vtgate的。因此，因为客户端只需要去找到一个vtgate实例即可，所以对于客户端来说是非常简单的。  

为了转发请求，vtgate会考虑分片约束、所需的延迟、tablets及其底层MySQL实例的可用性。
### vttablet
vttablet是一个位于MySQL数据库前面的代理服务器。在vitess中，每一个MySQL实例都会带有一个vttablet。vttablet执行的任务试图最大限度地提高吞吐量，同时保护MySQL不受有害查询的影响。它的功能包括连接池、查询重写以及查询去重。此外，vttablet执行vtctl发起的管理任务，它还提供用于过滤副本和数据导出的数据流服务。  

轻量级的Vitess实现了使用vttablet作为一个智能连接代理，为单个MySQL数据库提供查询服务。通过在MySQL数据库前面运行vttablet并且修改应用程序的MySQL驱动为vitess客户端，应用程序可以受益于vttablet的连接池、查询重写和查询去重的功能。
### vtctl
vtctl是一个用户管理一个vitess集群的命令行工具。它允许人工或者应用程序与vitess实现轻松交互。通过vtctl，可以区分主节点和备份数据库，创建数据库表，故障转移，执行分片操作等等。  

当vtctl执行操作时，它根据需要更新锁服务器。其他Vitess服务器会观察这些变化并做出相应的反应。例如，如果使用vtctl将故障转移到新主数据库，vtgate将看到更改并将未来的写操作指向新主数据库。
### vtctld
vtctld是一个能够查询存储在锁服务器上的信息的http服务器。它对于故障诊断或者获得服务器及其当前状态的全局概览非常有用。
### vtworker
vtworker用于承载长时间运行的进程。它支持插件，并提供各种库，以便可以轻松地选择要使用的tablets。插件可用于以下类型的任务：
* 重新分片的任务用于在分片和连接期间检查数据完整性。
* 垂直切割的任务用于在垂直切割和连接期间检查数据完整性。  

vtworker也能让我们轻松的添加其他的校验过程。我们可以执行tablet内完整性检查来验证类似于外键的关系，或者进行交叉碎片完整性检查，例如，校验一个键空间中的索引表是否引用了另一个键空间中的数据。

## 核心概念
### Cell
一个Cell是一组服务器和网络基础设施组合成的一个区域，并与其他的Cell是失败隔离的。它通常是一个完整的数据中心或者是一个数据中心的子集，有时被称为一个区域或者是可用性区域。vitess能够优雅的处理Cell级别的故障，例如一个Cell断网了。  

在vitess的实现中，每一个Cell里面都有一个local topology service。这个topology service包含了这个Cell中的tablets的大部分信息。这个允许一个Cell作为一个单元来卸载和重建。  

vitess限制了Cell之间的数据和元数据的流量。虽然将读流量路由到单个Cell可能很有用，但Vitess目前只提供本地Cell的读取。写操作将在必要时跨Cell执行，并将其发送到该切片的主服务器所在的位置。
### Keyspace
一个keyspace就是一个逻辑数据库。如果我们使用了分片，那么一个keyspace就对应多个MySQL数据库；如果我们没有使用分片，一个keyspace就直接对应一个MySQL数据库。在这两种情况下，一个keyspace对于应用程序来说都是单个数据库。  

从一个keyspace中读取数据就像是从一个MySQL数据读取数据一样。取决于对读取操作的一致性要求，vitess可能会从一个主数据库和一个副数据库请求数据。因为vitess会转发每一个查询请求到正确的数据库中，所以我们的代码可以保持和从单个MySQL数据库读取数据的一样。
### Keyspace Graph
keyspace graph可以让Vitess决定为给定的keyspace、cell和tablet类型分配哪组切片。
#### Partitions（分区）
在水平切片中（切割或者合并切片），多个切片之间可能会有重叠的key。例如，被分割的源切片的key范围为c0-d0，而它会被分割成多个切片，其中一个切片的key范围为c0-c8，另一个为c8-d0。

因为这些切片在迁移过程中必须同时存在，所以keyspace graph中维护了一个由切片组成的列表（称为分区），其key范围覆盖了所有可能的keyspace id值，同时不重叠且连续。可以将切片移进或移出这个列表，以确定这些切片是否处于活跃状态。

keyspace graph中为每一对对象（cell, tablet类型）都存储了单独的分区，因此迁移操作可以在多个阶段中进行：首先迁移rdonly和replica类型的tablet的请求，每次只迁移一个cell的，最后迁移master类型的tablet的请求。
#### ServedFrom
在垂直切片中（将某些数据库表从一个keyspace移出来并组合成一个新的keyspace），多个keyspace中可能存在相同的数据库表。

因为这些数据库表的多个副本在迁移过程中必须同时存在，所以keyspace graph支持keyspaces的重定向（称为ServedFrom记录）。这使得迁移的流程如下所示：
1. 创建一个新的keyspace并且将它的ServedFrom指向老的keyspace。
2. 更新应用程序去新的keyspace中查询那些被移动的数据库表。此时，vitess还是会自动重定向这些请求到老的keyspace。
3. 执行垂直切割克隆，将数据复制到新的keyspace并开始过滤主从复制。
4. 移除ServedFrom的重定向记录，然后开始真正接受新的keyspace的服务。
5. 删除老的keyspace中的那些已经复制过的数据库表。

keyspace graph中为每一对对象（cell, tablet类型）都存储了单独的ServedFrom记录，因此迁移操作可以在多个阶段中进行：首先迁移rdonly和replica类型的tablet的请求，每次只迁移一个cell的，最后迁移master类型的tablet的请求。
### Keyspace ID
Keyspace ID用于确定一行记录是存在于哪一个切片中。基于范围的切片是指创建的每一个切片都会覆盖一定范围的keyspace ID。

使用这个技术意味着，我们可以使用两个或更多的切片来代替指定的切片，这些新的切片组合起来将会覆盖原有的切片的keyspace ID范围，而无需移动其他切片中的任何记录。

keyspace ID本身是使用我们数据中的某一列的函数来计算出来的，例如user_id。vitess允许我们从多个列的函数（vindexes）中选择一个来执行这个计算。这允许我们选择正确的一个，以实现跨切片的数据的最佳分布。
### Replication Graph
replication graph标识主数据库及其各自副本之间的关系。在主数据库故障转移期间，replication graph允许vitess将所有的副本指向一个新指定的主数据库，以便主从复制可以继续。
### Shard（切片）
一个切片是一个keyspace中的一个分区。一个切片通常包含一个MySQL主数据库和多个副MySQL。

一个切片中的每一个MySQL实例都有相同的数据（除了一些复制延迟）。那些副MySQL能够为只读请求提供服务（保证最终一致性），以及运行长时间执行的数据分析工具，或者执行一些管理任务（数据备份，数据恢复，数据差异比较等等）。

一个未被切分的keyspace实际上只有一个切片，vitess默认会将这个切片命名为0。当被切分后，一个keyspace可以拥有多个切片，并且这些切片中数据没有重叠。
#### Resharding（重新切片）
vitess支持动态重新切片，即在一个可用的集群上更改切片的数量。这既能将一个或多个切片切割成更小的片段，也能将相邻的切片整合成更大的片段。

在重新切片过程中，数据将会从源切片中复制到目标切片中，以便弥补主从复制，然后会与源数据进行对比以确保数据的完整性。然后将可用的服务基础设施转移到目标切片，并删除源切片。
### Tablet
一个tablet是由一个mysqld进程和相对应的一个vttablet进程组合而成的，通常在同一台机器上运行。

每一个tablet都会被指定一个tablet类型，用于指定这个tablet当前所扮演的角色。
#### Tablet Types
* master - 当前刚好是这个切片的主数据库的replica。
* replica - 一种有资格被提升为主数据库的从数据库。通常，这些为服务于实时的、面向用户的请求而保留的(比如来自网站前端的请求)。
* rdonly - 一种不能被提升为主数据库的从数据库。通常，这些是用于后台处理任务，例如备份，将数据转储到其他系统、大量的分析查询、MapReduce和重新分片。
* backup - 一种在一致性快照下停止主从复制的tablet，这样它就能够为它的切片上传一个新的备份，当它完成之后，它将会继续进行主从复制并且变回到以前的tablet类型。
* restore - 一种在启动后没有任何数据的tablet，并且正在从最新的备份中恢复数据。当它完成之后，它将在备份的GTID位置开始进行主从复制并成为replica或rdonly类型的tablet。
* drained - 由vitess后台进程保留的tablet（比如用于重新分片的rdonly）。
### Topology Service（也称为TOPO或锁服务）
Topology Service是一组运行在不同服务器上的后端进程。这些服务器存储拓扑数据以及提供一个分布式锁服务。

Vitess使用一个插件系统来支持各种后端去存储拓扑数据，这些后端需要能够保证提供了一个分布式的、一致的键值存储，这些后端包括zookeeper插件和etcd等等。

topology service的存在有以下几个原因：
* topology service使tablet能够成为一个集群彼此协调。
* topology service使vitess能够发现所有的tablet，这样vitess就能够知道将请求转发到哪里去。
* topology service存储数据库管理员提供的Vitess配置，集群中的许多不同服务器都需要这些配置，并且必须在服务器重启的时候持久化这些配置。

一个vitess集群有一个全局的topology service，并且在每一个cell中都有一个本地的topology service。由于集群是一个重量级术语，而且每个Vitess集群都有自己的全局topology service，这一点使其有别于其他集群，因此我们将每个Vitess集群称为拓扑层。
#### 全局的topology service
全局的topology service存储这不经常更改的vitess范围的数据。具体来说，它包含关于keyspace和切片以及每个切片的tablet的别名数据。

全局的topology service常用于一些操作，包括重新选举和重新切片。按照设计，全局的topology service并不经常使用。

为了在任何一个Cell出现故障时存活下来，全局topology service应该在多个Cell中有节点，在某个Cell出现故障时，其他的节点足以维护仲裁。
#### 本地的topology service
每一个本地的topology service都包含与其自身Cell相关的信息。具体来说，它包含这个Cell中的tablet、keyspace graph和replication graph信息。

本地的topology service必须保证可用性，以便在tablet加入和移除的时候发现tablet并调整请求转发逻辑。然而，在稳定状态下提供查询的关键路径中不调用topology service，这就意味着在topology service暂时不可用期间，仍然可以提供查询服务。
### VSchema
VSchema用于描述数据在keyspace和切片中是如何组织的。VSchema中的信息用于转发查询请求，同时也用于重新切片操作。

对于keyspace，VSchema能够指定这个keyspace是否被切分。对于已经被切分的keyspace，VSchema能够指定每一张数据库表的vindexes集合。

Vitess还支持序列生成器，可用于生成新的id，其工作原理类似于MySQL自动递增列。VSchema允许您将数据库表的一些列关联到序列表，关联之后，如果没有为这些列指定值，那么VTGate将会使用序列表为它生成一个新值。