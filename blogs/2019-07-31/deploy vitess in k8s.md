# 【Vitess】在k8s中使用operator部署vitess
## 在k8s集群中创建动态pv

## 部署vitess（需要在k8s中安装helm）
### 第一步：从 https://github.com/helm/charts/tree/master/stable/etcd-operator 中下载 etcd-operator 的 chart ，从 https://github.com/vitessio/vitess-operator 中下载 vitess-operator

### 第二步：部署 etcd-operator 的 chart
* 执行以下命令
```
helm install etcd-operator/ --name vitess-etcd
```

### 第三步：部署 vitess-operator
* 先进入 vitess-operator 目录
```
cd vitess-operator/
```
* 然后修改my-vitess.yaml文件添加mysql相关参数，用于暴露mysql的3306端口和设置密码
```
mysqlProtocol:
  enabled: true
  username: root
  # this is the secret that will be mounted as the user password
  # kubectl create secret generic myuser_password --from-literal=password=abc123
  passwordSecret: 123456
```
，添加完了之后的代码片段如下（用于定位添加的位置）：
```
apiVersion: vitess.io/v1alpha2
kind: VitessCluster
metadata:
  name: vt
  labels:
    app: vitess
spec:
  lockserver:
    metadata:
      name: global
    spec:
      type: etcd2
      etcd2:
        address: etcd-global-client:2379
        pathPrefix: /vitess/global
  cells:
  - metadata:
      name: zone1
    spec:
      mysqlProtocol:
        enabled: true
        username: root
        # this is the secret that will be mounted as the user password
        # kubectl create secret generic myuser_password --from-literal=password=abc123
        passwordSecret: 123456
      lockserver:
        metadata:
          name: zone1
        spec:
          type: etcd2
          etcd2:
            address: etcd-zone1-client:2379
            pathPrefix: /vitess/zone1
      defaults:
        replicas: 1
        image: vitess/vttablet:helm-1.0.4
```
* 然后执行部署命令
```
kubectl apply -R -f deploy
kubectl apply -f my-vitess.yaml
```

## 更新vitess
只需要对my-vitess.yaml文件进行修改，然后执行命令：
```
kubectl apply -f my-vitess.yaml
```
即可更新。

这个方式适用于对vitess中的cell、keyspace、shard、tablet对象进行增删改操作。至于schema、vschema对象的增删改建议使用vtctl的http方式进行操作（如何将vtctl转换为http请求可以参考本网站中的博客【通过http请求对vitess中的所有资源对象进行增删改查】）。

## 卸载vitess
### 第一步：卸载 vitess-operator
* 先进入 vitess-operator 目录
```
cd vitess-operator/
```

* 然后执行卸载命令
```
kubectl delete -f my-vitess.yaml
kubectl delete -R -f deploy
```

### 第二步：卸载 etcd-operator 的 chart
* 执行以下命令：
```
helm delete vitess-etcd
```

### 第三步：删除对应的pvc和pv
* 执行以下命令：
```
kubectl delete pvc xxx
kubectl delete pv  xxx
```

* 如果删除不掉，则需要强制删除
```
kubectl delete pvc xxx –-force --grace-period=0
kubectl delete pv  xxx –-force --grace-period=0
```
