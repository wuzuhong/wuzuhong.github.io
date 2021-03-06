# 【Vitess】用户指南之备份和恢复数据
本章节描述了如何在vitess中创建数据备份以及如果从备份中恢复数据。vitess使用数据备份有两个目的：
* 为tablet上的数据提供一个时间点备份。
* 在已存在切片中添加新的tablet。

## 前提条件
Vitess将数据备份存储在存储服务上，这是一个可插入的接口，目前支持以下存储服务的插件：
* network-mounted路径（例如：NFS）
* Google Cloud Storage
* Amazon S3
* Ceph

在备份或还原tablet之前，您需要确保tablet知道您正在使用的备份存储系统。为此，在启动具有访问存储备份位置的vttablet时可以使用以下命令行参数。

<table><thead><tr><th colspan="2" align="left">命令行参数</th></tr></thead><tbody><tr><td><code>backup_storage_implementation</code></td><td>指定要使用的备份存储接口的实现类型。<br><br>当前可用的插件类型是:<ul><li><code>file</code>: NFS或其他filesystem-mounted网络驱动。</li><li><code>gcs</code>: Google Cloud Storage.</li><li><code>s3</code>: Amazon S3.</li><li><code>ceph</code>: Ceph Object Gateway S3 API.</li></ul></td></tr><tr><td><code>backup_storage_hook</code></td><td>如果设置了，每个要备份的文件的内容都被发送到一个钩子。钩子接收stdin上每个文件的数据。它会将转换后的数据回显到stdout。钩子打印到stderr的任何内容都将打印在vttablet日志中。<br>钩子应该位于<code>VTROOT</code>目录的<code>vthook</code>子目录。<br>钩子根据数据处理的方向接收一个<code>-operation write</code>或者一个
<code>-operation read</code>参数。例如，<code>write</code>用于加密，<code>read</code>用于解密。<br></td></tr><tr><td><code>backup_storage_compress</code></td><td>这个参数用于控制备份是否要被Vitess代码压缩。
默认情况下，它被设置为true。使用
<code>-backup_storage_compress=false</code>来禁用，<br>这要与已经压缩数据的<code>-backup_storage_hook</code>一起使用，以避免对数据进行两次压缩。</td></tr><tr><td><code>file_backup_storage_root</code></td><td>对于<code>file</code>类型的插件，这将标识用于备份的根目录。</td></tr><tr><td><code>gcs_backup_storage_bucket</code></td><td>对于<code>gcs</code>类型的插件，这将标识被使用的<a href="https://cloud.google.com/storage/docs/concepts-techniques#concepts">bucket</a>。</td></tr><tr><td><code>s3_backup_aws_region</code></td><td>对于<code>s3</code>类型的插件，这将用于标识AWS的域。</td></tr><tr><td><code>s3_backup_storage_bucket</code></td><td>对于<code>s3</code>类型的插件，这将用于标识AWS S3 bucket。</td></tr><tr><td><code>ceph_backup_storage_config</code></td><td>对于<code>ceph</code>类型的插件，这将标识以JSON对象作为配置的文本文件的路径。这个JSON对象需要包含以下的key：<code>accessKey</code>, <code>secretKey</code>,
<code>endPoint</code> and <code>useSSL</code>。Bucket的名字是根据keyspace的名字和切片的名字来生成的，并且每一对keyspaces/shards所生成的名字都是不一样的。</td></tr><tr><td><code>restore_from_backup</code></td><td>这将标识，从空MySQL实例启动时，tablet从指定的存储插件恢复最近的备份。</td></tr></tbody></table>

## 权限认证
需要注意的是，对于Google Cloud Storage插件来说，目前只支持<a href="https://developers.google.com/identity/protocols/application-default-credentials">Application Default Credentials</a>。这就意味着，由于已经在Google Compute Engine或者Container Engine中运行，因此可以自动授予对云存储的访问权限。

要实现这一点，必须让创建的GCE实例允许对云存储进行读写访问。当使用了Container Engine，您可以通过向<code>gcloud container clusters create</code>命令中添加<code>--scope storage-rw</code>来为它创建的所有实例执行此操作，如<a href="../../get-started/kubernetes#start-a-container-engine-cluster">Vitess on Kubernetes guide</a>所示。

## 创建备份
执行以下vtctl命令来创建备份：
```
vtctl Backup <tablet-alias>
```
为了响应这个命令，指定的tablet将会按顺序执行以下操作：
1. 将当前tablet的类型转变为<code>BACKUP</code>。然后当前的tablet就不再被vgate使用并且也不再提供任何的查询服务。
2. 停止复制，获取当前复制的位置（将会随着数据一起保存在备份中）。
3. 停止MySQL后台进程。
4. 将必要的文件复制到启动tablet时指定的备份存储器中。注意，如果这个操作失败了，我们仍然会继续接下来的操作，这样tablet就不会因为存储失败而处于不稳定状态。
5. 重启MySQL后台进程。
6. 重启主从复制（使用与其原始类型对应的正确半同步标志）。
7. 将当前tablet的类型转变为原来的类型。之后，它很可能在复制上落后，vtgate在它赶上来之前不会使用它来提供服务。

## 从备份中恢复数据
当一个tablet启动后，vitess将会检查命令行参数<code>-restore_from_backup</code>的值来决定是否要从一个备份中恢复这个tablet的数据。
* 如果这个命令行参数存在，vitess将会在启动这个tablet的时候从备份存储系统中取出最新的备份数据进行恢复操作。
* 如果这个命令行参数不存在，vitess将不会进行数据恢复操作。这和在一个新的切片中启动一个新的tablet是一样的。

就像前提条件部分所述，通常在一个切片中始终会为所有tablet启用该命令行参数。默认情况下，如果vitess在备份存储系统中无法找到一个备份，那么这个tablet将会空着启动。这允许您在任何备份存在之前初始化新的切片。

如果命令行参数<code>-wait_for_backup_interval</code>被设置为比0大的数值，那么tablet将会以该值为间隔时间进行持续检查是否出现备份。这可以用来确保在为切片进行初始备份的同时并发地启动tablet(例如，从硬存储库上传或由其他tablet创建)，直到适当的时间停止检查，然后在准备好时拉出新的备份。
```
vttablet ... -backup_storage_implementation=file \
             -file_backup_storage_root=/nfs/XXX \
             -restore_from_backup
```

## 管理备份
vtctl提供了两个命令来管理备份：
* <code>ListBackups</code>展示当前 keyspace/shard 中存在的备份，按创建时间的先后排序。
```
vtctl ListBackups <keyspace/shard>
```
* <code>RemoveBackup</code>删除当前 keyspace/shard 中指定的备份。
```
RemoveBackup <keyspace/shard> <backup name>
```

## 创建一个新的tablet
创建一个新的tablet和恢复现有的tablet几乎是相同的。唯一需要注意的是，当tablet在topology中注册自己时，它指定了它的keyspace、切片和tablet类型。具体来说，请确保在创建一个新的tablet的时候设置了以下vttablet参数
```
-init_keyspace <keyspace>
-init_shard <shard>
-init_tablet_type replica|rdonly
```

新建的tablet将会从备份中恢复数据，然后通过重新启动复制应用备份后发生的更改。

## 频繁备份
建议定期备份数据，比如设置一个定时器来进行定期备份数据。

要确定创建备份的适当频率，请考虑保存复制日志的时间，并需要保证有足够的时间在备份操作失败时排查和修复问题。

例如，假设保存复制日志的时间周期为4天并且每天都会进行数据备份。在这种情况下，即使数据备份失败了，您至少有几天的时间来排查和修复问题。

## 并发性
备份和恢复进程同时复制和压缩或解压多个文件，以提高吞吐量。可以使用以下命令行参数来控制并发性：
* vtctl的<code>Backup</code>命令使用<code>-concurrency</code>参数。
* vttablet使用<code>-restore_concurrency</code>参数。

如果网络连接够快的话，则并发性与备份或恢复过程中进程的CPU使用情况会相匹配。
