# 【kubernetes】helm
## 概述
* helm 可以帮助我们方便快速的在 kubernetes 中部署应用，而不需要我们手动定义应用需要的各种复杂的清单文件，因为 helm 有一个专门存放各类应用所需要的各种清单文件的仓库；在 helm 中把 helm 程序包称为 chart，chart 中包含了应用程序部署清单的定义，并不包含镜像；helm 仓库也称为 chart 仓库（chart repository），里面存的就是 chart，它就是一个 http/https 服务器。
* helm 一般安装在集群外部的一台主机上，每一个 chart 必须先从远程仓库下载到 helm 所在的主机本地并被 helm 管理。
* helm 作为客户端与集群中的 tiller 组件进行交互，tiller 是集群中的守护进程，为 helm 客户端提供服务；helm 的请求先到 tiller，然后 tiller 再将请求发送给 apiserver，由 apiserver 完成创建步骤；当一个 chart 经过一些配置文件添加参数并在集群中部署运行后，它就不叫 chart 了，而是 release，release 就是特定的 chart 部署于目标集群上的一个实例。

## helm 核心术语
* chart：一个 helm 程序包；
* repository：chart 仓库，就是一个http/https服务器；
* release：特定的 chart 部署于目标集群上的一个实例。

## helm 程序架构
* helm：客户端，管理本地的 chart 仓库，管理 chart，与 tiller 服务器交互，发送 chart 和实例安装、查询、卸载等操作请求；
* tiller：服务端，接收 helm 发来的 chart，然后与config文件进行合并，最后执行生成 release。

## 安装 helm
* 首先下载 helm 安装包到一台集群外的主机上并解压
```
wget https://storage.googleapis.com/kubernetes-helm/helm-v2.12.0-linux-amd64.tar.gz
tar  xf helm-v2.12.0-linux-amd64.tar.gz
```

* 然后进入解压后的目录中，将 helm 文件夹移动到 /usr/bin 目录下，并查看 helm 的命令说明
```
mv helm /usr/bin/
helm --help
```

* 在使用 helm 时，它会去联系集群中的apiserver，因此需要保证 helm 所在的主机上有 kubeconfig 文件。

* 安装完 helm 后，就要去集群内安装 tiller，并且 tiller 需要有较大的管理权限，一般使用 ClusterRoleBinding 将其绑定在 cluster-admin 角色之上，新增一个文件，命名为rbac-config.yaml，并输入以下内容，用于创建一个serviceaccount并使用 ClusterRoleBinding 将其绑定在 cluster-admin 角色之上，以下是yaml文件示例：
```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tiller
  namespace: kube-system
 ---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: tiller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: tiller
    namespace: kube-system
```
然后使用
```
kubectl apply -f rbac-config.yaml
```
即可创建 serviceaccount 和 ClusterRoleBinding。

* 在 helm 所在主机上执行
```
helm init --service-account tiller
```
来初始化 helm，之后会在集群中自动创建 tiller 的 deployment，不过需要提前将 tiller 的镜像准备好：
```
docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/tiller:v2.12.0
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/tiller:v2.12.0 gcr.io/kubernetes-helm/tiller:v2.12.0
docker rmi registry.cn-hangzhou.aliyuncs.com/google_containers/tiller:v2.12.0
```

* 使用
```
helm repo update
```
来更新本地 chart 仓库，需要翻墙

* 到这里算安装完成了，可以直接使用了，例如：在 helm 所在主机上执行
```
helm install --name redis stable/redis
```
即可使用 redis 的 chart 来自动安装默认配置的 redis，需要翻墙；可以通过
```
helm install --name redis stable/redis --values values-production.yaml
```
来指定安装时的配置信息，这个配置文件使得chart变为动态可配的了；helm 会帮我们安装应用所需的所有kubernetes资源，如：pod、service、deployment……等等。

* 官方可用的 chart 列表： https://hub.kubeapps.com/ ，其中的每一个 chart 都有详细的使用说明，包括配置参数。

## 创建自定义chart
* chart文件目录

![chart文件目录](./images/kubernetes-chart.jpg)

其中Chart.yaml文件、README.md文件、values.yaml文件、templates/目录是必须的，其他都是可选的。
Chart.yaml文件是对当前chart的描述；README.md文件是当前chart的使用说明；templates/目录是存放kubernetes资源定义的yaml文件的；values.yaml文件相当于java中的常量类，其中定义的常量可以在templates/目录中资源定义的yaml文件中所引用（需要使用go模板语言），并且在安装chart的时候可以通过--set参数对values.yaml文件中的常量进行覆盖。

* 开源的chart：https://github.com/helm/charts/tree/master/stable，可通过这个仓库来查看目前已开源的chart，也可以根据这些开源的chart学会如何自定义chart