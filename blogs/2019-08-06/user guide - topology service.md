# 【Vitess】用户指南之Topology服务
Topology服务是vitess架构中的关键部分。Topology服务会公开给所有vitess进程，用于存储有关vitess集群的一小部分配置数据，并提供集群范围的锁。它还支持监听和主tablet的选举。

具体来说，Topology服务的特性是通过一个锁服务器来实现的，这个锁服务器在本文档的其余部分中称为Topology服务器。vitess使用插件实现并且支持多种锁服务器（例如：Zookeeper，etcd，Consul等等）来作为Topology服务的后端。

## 必要条件和使用方式
Topology服务是用于存储Keyspace、切片、Tablet、Replication Graph和Serving Graph等对象的相关信息，只存储每个对象少量的数据结构（大概几百字节左右）。

必须要确保Topology服务器的高可用和一致性，尽管这将带来更高的延迟成本和非常低的吞吐量。

vitess从不将Topology服务器用作RPC机制，也不将其用作日志存储系统。vitess从不依赖Topology服务器去对每一个查询请求进行高速响应。

Topology服务器还必须支持监听接口，以便在节点上发生某些情况时发出信号。例如，它用于知道keyspace topology何时发生变化(例如，用于重新分片)。

### 全局的和本地的
关于Topology服务器两种实例：全局实例，和每个Cell中的本地实例：
* 全局实例用于存储关于topology的全局数据，这些topology不会经常更改，例如关于keyspace和切片的实例信息。数据独立于单独的实例和cell，需要在cell完全崩溃时存活。
* 每个cell有一个本地实例，它包含cell特定的信息，还包含来自全局 + 本地cell的汇总数据，以便客户端更容易地找到数据。vitess本地进程不应该使用全局topology实例，而应该尽可能多地使用本地topology服务器中的数据。

全局实例可以暂停一段时间而不影响本地cell(一个例外是，如果需要处理reparent，则可能无法工作)。如果一个本地实例宕机，它只会影响该实例中的本地tablet(然后该cell通常处于糟糕的状态，不应该使用)。

而且，vitess进程不会使用全局Topology服务器或者本地Topology服务器来服务查询请求。只会在启动时使用Topology服务器来获取Topology信息，但从不直接服务于查询请求。

### 恢复
如果一个本地Topology服务器宕机了或者不可恢复了，它可以被彻底删除，然后这个cell中的所有tablet都需要重启，然后重新初始化它们的topology记录（但它们不会丢失任何的MySQL数据）。

如果全局Topology服务器宕机了或者不可恢复了，这是一个更大的问题，所有的Keyspace/Shard对象必须被重建，然后所有的cell都可以恢复了。

## 全局数据
本小节描述存储在topology服务器全局实例中的数据结构。
### Keyspace
Keyspace对象包含了多种信息，大部分是关于切片的，包括：keyspace是如何切片的、用于切片的列是哪一个、当前的keyspace是否还在提供数据服务、如何切分当前查询请求等等。

整个keyspace都可以被锁定。例如，当我们更改切片所服务的keyspace中的内容时，在重新分片时会使用这个锁，。这样，我们保证同时只有一个操作更改keyspace数据。

### 切片
一个切片包含了一个keyspace中的子数据集。全局topology中的切片包含了以下记录：
* 这个切片中的主tablet的别名。
* 这个切片在这个keyspace中的所覆盖的键的范围。
* 这个切片中所有可提供服务的tablet类型。
* 如果是在过滤复制期间，源切片将从这个切片中复制。
* 在这个切片中拥有tablet的cell集合。
* 全局的切片tablet控制，像黑名单表一样，任何tablet都不应该在这个切片中使用。

这个切片都可以被锁定。我们在进行那些会影响切片记录或者会影响一个切片中的多个tablet的时候会使用这个锁，所以多个操作不会并发的对数据进行修改。

### VSchema数据
VSchema数据中包含了VTGate V3接口中的切片和请求转发的信息。

## 本地数据
本小节描述存储在topology服务器本地实例（每一个cell）中的数据结构。
### Tablet
Tablet记录中有许多关于在Tablet中运行的单个vttablet进程（以及MySQL进程）的信息：
* 唯一标识tablet的tablet别名(cell + 惟一id)。
* tablet的主机名、IP地址和端口映射。
* 当前所有的tablet类型。
* 当前tablet是属于哪一个keyspace和切片的。
* 当前tablet所服务的键范围。
* 用户指定的标签映射（例如，用于存储每个实例的安装数据）。

Tablet记录是在Tablet运行之前创建的(通过<code>vtctl InitTablet</code>或将<code>init *</code>参数传递给vttablet进程)。tablet记录更新的唯一方式就是：
* vttablet进程本身在运行时拥有记录，并且可以更改它。
* 在初始化时间，并在tablet启动之前。
* 停止后，当tablet被删除的时候。
* 当tablet变得无法响应的时候，它可能会被迫闲置，以便在重启时变成不健康状态。

### Replication graph
Replication graph让我们可以找出给定的 cell/keyspace/shard 中的所有tablet。它曾经包含关于哪台tablet正在复制哪台tablet的信息，但这太复杂了，无法维护，现在它只包含了一个tablet列表。

### Serving graph
Serving graph是客户端用来查找keyspace的每个cell的topology的。它是全局数据的汇总（keyspace和切片）。vtgates只打开这些对象中的一小部分，并快速获得vtgates所需的所有内容。
#### SrvKeyspace
SrvKeyspace是Keyspace的本地化形式，它包含关于使用什么切片来获取数据(不包含关于每个切片的信息)：
* 分区映射由tablet类型作为键，值是可提供服务的切片列表。
* 它还包含全局keyspace字段，复制过来用于快速访问。

SrvKeyspace能够通过<code>vtctl RebuildKeyspaceGraph</code>命令来重建。当一个cell中的一个tablet启动了并且当前 cell/keyspace 还不存在的时候，SrvKeyspace将会自动重建。SrvKeyspace在垂直切片和水平切片的过程中也可以被修改。

#### SrvVSchema
SrvVSchema在一个对象中包含所有keyspace的VSchema。

SrvVSchema能够通过<code>vtctl RebuildVSchemaGraph</code>命令来重建。当使用命令<code>vtctl ApplyVSchema</code>的时候，SrvVSchema将会自动重建（除非是被一些参数限制了）。

## 涉及到Topology服务器的工作流
Topology服务器在很多工作流中被调用。

当一个tablet初始化后，我们就会创建tablet记录，并且会把这个tablet添加到Replication Graph中。如果这个tablet是切片中的主tablet，那么我们还会更新全局的切片记录。

管理工具需要能够找到给定的Keyspace/Shard中的所有tablet：首先，我们得到拥有用于切片的tablet的cell列表(全局topology切片记录有这些)，然后我们使用 Cell/Keyspace/Shard对应的Replication Graph来找到所有的tablet，然后我们就能读取每一条tablet记录。

当一个切片被reparenting了之后，我们需要使用新的主tablet的别名去更新全局的切片记录。

寻找一个tablet来提供数据服务分两个阶段完成：vtgate保持与所有可能的tablet的健康检查连接并且这些tablet将会报告它们所服务的keyspace、切片和tablet类型。vtgate也会读取SrvKeyspace对象，以找到切片的映射。有了这两块的信息，vtgate就能将查询请求转发到正确的vttablet中。

在重新切片的事件中，我们也会对topology进行大量的修改。水平切片会改变全局的切片记录和本地的SrvKeyspace记录。垂直切片会修改全局的keyspace记录和本地的SrvKeyspace记录。

## 查看Topology服务器中的数据
所有的对象都是以proto3二进制数据存储的。

可以通过以下接口来进行数据查询：  
* Global Cell:
  * CellInfo接口：cells/{cell name}/CellInfo
  * Keyspace接口：keyspaces/{keyspace}Keyspace
  * Shard接口：keyspaces/{keyspace}/shards/{shard}/Shard
  * VSchema接口：keyspaces/{keyspace}/VSchema
* Local Cell:
  * Tablet接口：tablets/{cell-uid}/Tablet
  * Replication Graph接口：keyspaces/{keyspace}/shards/{shard}/ShardReplication
  * SrvKeyspace接口：keyspaces/{keyspace}/SrvKeyspace
  * SrvVSchema接口：SvrVSchema
  
## Topology的具体实现
Topology服务器的实现代码都在<code>go/vt/topo/</code>文件夹下，具体的实现是在<code>go/vt/topo/{name}</code>文件中，这些实现的单元测试都在<code>go/vt/topo/test</code>目录下。

这一部分讲述的是vitess所有的Topology服务器实现类型，以及他们各自具体的操作。

如果您是从零开始，请使用<code>zk2</code>,<code>etcd2</code>或者<code>consul</code>插件。<code>zookeeper</code>和<code>etcd</code>的实现已经弃用了。如果您想执行迁移操作，请参阅下面的迁移部分。

### 用于etcd的<code>etcd2</code>插件
<code>etcd2</code>插件存在的目的是使用etcd集群来作为topology数据的后端存储器。这个topology服务插件支持3以上的etcd版本。这个插件实现被命名为<code>etcd2</code>，因为它取代了我们以前的实现<code>etcd</code>。注意，存储格式已随<code>etcd2</code>实现而更改，所以必须手动迁移先前<code>etcd</code>实现创建的数据(请参阅下面的迁移部分)。

要配置<code>etcd2</code>安装，让我们从全局cell服务开始。全局的cell服务由服务器的地址(逗号分隔的列表)和根目录来描述，以便将Vitess数据放入其中。例如，假设我们想让目录<code>/vitess/global</code>用于<code>http://global_server1,http://global_server2</code>这两个服务器：
```
# Set the following flags to let Vitess use this global server,
# and simplify the example below:
# -topo_implementation etcd2
# -topo_global_server_address http://global_server1,http://global_server2
# -topo_global_root /vitess/global
TOPOLOGY="-topo_implementation etcd2 -topo_global_server_address http://global_server1,http://global_server2 -topo_global_root /vitess/global
```
然后添加一个cell，这个cell的两个topology服务器<code>http://cell1_server1,http://cell1_server2</code>会将它们的数据存储在<code>/vitess/cell1</code>目录下：
```
# Reference cell1 in the global topology service:
# (the TOPOLOGY variable is defined in the previous section)
vtctl $TOPOLOGY AddCellInfo \
  -server_address http://cell1_server1,http://cell1_server2 \
  -root /vitess/cell1 \
  cell1
```
如果只有一个cell被使用了，那么相同的etcd实例集群能够同时被全局和本地数据使用。一个本地cell记录仍然需要被创建，只是使用相同的服务器地址以及不同的数据目录（非常重要）。

#### etcd2的实现细节
至于锁的话，我们使用一个子目录<code>locks</code>来进行锁操作，以及这个子目录下的一个临时文件（这个文件的有效时间可以通过<code>-topo_etcd_lease_duration</code>参数来设置，默认为30秒），具有最低ModRevision的临时文件具有锁，其他文件将等待具有较旧ModRevision的文件消失。

主tablet选举也使用子目录(以选举名称命名)，并使用类似于锁的方法，使用临时文件。

## 只在一个cell中运行
topology服务应该分布在多个cell中，并且能够在单个cell中断时存活下来。然而，通常的做法是在一个cell中运行一个vitess集群，本小节将会解释如何去做，并且如何在将来升级到多个cell。

如果在单个cell中运行，相同的topology服务能够同时被全局和本地数据使用。一个本地cell记录仍然需要被创建，只是使用相同的服务器地址以及不同的数据目录（非常重要）。

在这种情况下，仅为topology服务运行3台服务器可能就足够了。例如，3个etcd服务器。并将它们的地址用于本地cell。让我们使用一个简短的cell名称，比如local，因为该topology服务器中的本地数据稍后将被移动到另一个topology服务，该服务将具有实际的cell名称。

### 扩展到多个cell
为了在多个cell中运行，当前的topology服务需要被拆分成一个全局实例和一个本地实例。然而，初始设置有3个topology服务器(用于全局和本地数据)，我们建议跨所有cell运行5个全局服务器(用于全局topology数据)，每个cell运行3个本地服务器(用于每个cell的topology数据)。

要迁移到这样的设置，首先在第二个cell中添加3个本地服务器，并像在第一个cell中那样运行<code>vtctl AddCellinfo</code>命令。tablets和vtgates现在可以在第二个cell中启动，并正常使用。

然后，vtgate可以配置一个cell列表来查看tablet，使用<code>-cells_to_watch</code>命令行参数。然后，它可以使用所有cell中的所有tablet来路由流量。注意，这对于访问另一个cell中的主tablet是必要的。

扩展到两个cell之后，原始的topo服务同时包含全局topology数据和第一个cell的topology数据。我们所追求的更对称的配置是将原始服务分割成两个：一个全局服务只包含全局数据(跨两个cell)，另一个本地服务只包含原始cell。为了实现这种分割，需要执行以下步骤：
* 在原始cell中启动一个新的本地topology服务（该cell中还有3个本地服务器）。
* 为该cell选择一个不同于local的名称。
* 使用<code>vtctl AddCellInfo</code>命令来配置新的cell。
* 确保所有的vtgates都能感知到新的cell（使用<code>-cells_to_watch</code>命令行参数）。
* 重新启动所有vttablet，使其位于新的cell中，而不是以前使用的cell名称<code>local</code>。
* 使用<code>vtctl RemoveKeyspaceCell</code>命令删除所有keyspace中对<code>local</code>cell的所有数据。
* 使用<code>vtctl RemoveCellInfo</code>命令删除全局配置中所有关于<code>local</code>cell的信息。
* 删除位于旧的本地服务器根目录中的全局topology服务中的所有剩余数据。

分割之后，配置完全是对称的：
* 一个全局topology服务，在所有cell中都有服务器。只包含关于keyspace、切片和VSchema的全局topology数据。通常它有5个服务器，横跨所有cell。
* 每个cell的本地topology服务，只有该cell中的服务器。只包含有关tablet的本地topology数据，以及用于高效访问的全局数据的roll-ups。通常，每个单元中有3个服务器。