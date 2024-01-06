# 【Vitess】在k8s中使用chart部署vitess
## 在k8s集群中创建动态pv

## 部署vitess（需要在k8s中安装helm）
1. 第一步：从 https://github.com/helm/charts/tree/master/stable/etcd-operator 中下载 etcd-operator 的 chart ，从 https://github.com/vitessio/vitess 中下载 vitess 的源码
2.  第二步：部署 etcd-operator 的 chart，执行以下命令
    ```
    helm install etcd-operator/ --name vitess-etcd
    ```
3. 第三步：部署vitess集群
```sh
# 先进入目录：
cd examples/helm
# 然后执行chart部署命令：
helm install ../../helm/vitess -f 101_initial_cluster.yaml
```

到这里一个简单的vitess集群就部署完成了，如果想对这个集群做进一步的操作，请参考源码目录下的examples/helm中的实例文件，这里面有所有vitess对象的增删改操作，从<code>101_initial_cluster.yaml</code>一直到<code>307_delete_shard_0.yaml</code>（按数字前缀的顺序执行）就可以部署一个未切片的keyspace和一个有两个切片的keyspace，这个执行过程可以参考官方文档中在k8s部署vitess的过程。