# 【kubernetes】存储卷
## kubernetes存储卷是pod级别的
查看所有存储卷类型
```
kubectl explain pods.spec.volumes
```

在存储卷类型中有一个叫persistentVolumeClaim的，简称 pvc，翻译后为持久存储申请，它是帮我们创建存储卷的，因为自己创建存储卷很难，需要深入了解各类存储系统。

## 典型的kubernetes存储卷详解
#### hostPath
它是节点级别的，使用宿主机的硬盘空间来存储数据的，所以在pod被删除后，该类存储卷和其中的数据依然会存在，但是如果节点宕机了，存储卷和数据也就没了，相应的，它在跨节点调度时，数据也是会丢失的。

#### nfs
若想存储卷和数据永不丢失，并且可以跨节点调用，那么就需要使用集群外部主机上的网络文件系统（例如：nfs），需要在一个主机上创建 nfs，然后确保集群中的node节点支持nfs，然后在node节点上使用
```
mount -t nfs store01:/data/volumes /mnt
```
来挂载node节点上的/data/volumes目录到store01主机（装有nfs的集群外部主机）上。

## pvc（persistentVolumeClaim，持久存储申请）和pv（persistentVolume，持久存储）
![pv和pvc](./images/kubernetes-pv-pvc1.png)
![pv和pvc](./images/kubernetes-pv-pvc2.png)

pvc和pv都是kubernetes中的一种资源，通过kubectl explain可以查看其定义方式。

pv和pvc的原理和流程：系统上应该有一个存储设备，由存储工程师在上面划分好许多个可被单独使用的存储空间；然后由k8s集群运维工程师将这些存储空间都引入到k8s集群中并定义成pv；用户或开发工程师在k8s集群中创建pod之前要先定义并创建一个pvc，用于去k8s集群中找一个可用的pv，也就是存储空间；pv和pvc是对应的，如果一个pv被某个pvc占用了，那么这个pv就不能再被其他pvc使用了，这个pv的状态会变为Bound；一个pvc被创建以后，这个pvc就相当于一个存储卷，这个存储卷可以被多个pod挂载；在创建pvc之前需要创建好pv，如果没有创建好pv，那么这个pvc会变为pedding状态。

## configmap和secret
假如我们有20个pod，由deployment管理，如果我们要对这20个pod进行更新，可能就是更新一个很小的配置，我们就需要做灰度更新，这样代价太大。因此，我们不把配置写死在镜像中，而是用一种kubernetes资源，叫做configmap，configmap中放的是配置信息，当我们启动这20个pod的时候，他们可以共享使用同一个configmap资源，configmap资源对象可以当存储卷来挂载到配置文件目录下使用，也可以从环境变量中读取配置信息并将这些信息注入到容器中使用。若configmap中的配置信息改变了，configmap会通知所有pod，pod会自动重载配置。configmap中的数据是明文存储的，而secret拥有与configmap相同的功能，但是secret中的数据是用base64编码后存储的。configmap 和 secret 都是pod存储卷的一种，同时也都是kubernetes的资源。

创建secret和创建configmap相类似，需要注意的是，创建secret时有三种可选类型：docker-registry（用于docker镜像拉取时去连接docker私有仓库做认证的）、tls（用于放置证书和私钥的）、generic（其他用法都用当前类型）