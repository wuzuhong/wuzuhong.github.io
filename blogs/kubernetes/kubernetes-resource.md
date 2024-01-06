# 【kubernetes】kubernetes中的资源

## 资源类型
* 工作负载级别的资源：Pod、ReplicaSet、Deployment、StatefulSet、DaemonSet、Job、Cronjob等等。
* 服务发现及负载均衡级别的资源：Service、Ingress等等。
* 配置和存储级别的资源：Volume、CSI、ConfigMap等等。
* 集群级别的资源：Namespace、Node、Role、ClusterRole、RoleBinding、ClusterRoleBinding等等。
* 元数据型资源：PodTemplate、LimitRange等等。

## 创建资源的方法
apiserver仅接受JSON格式的资源定义；若使用yaml格式提供配置清单，apiserver可自动将其转为JSON格式（因为yaml格式可以无损转为JSON，而且yaml格式比JSON格式更加简单易懂），然后再提交。因此我们通常是通过定义一个yaml文件来创建资源。
创建好了yaml文件后可以通过以下命令来创建一个资源
```
kubectl create -f pod-demo.yml
```

## 定义资源的yaml文件
通过
```
kubectl get pods nginx-deploy-6c884698c9-6jfz5 -o yaml
```
可以获取已经存在的资源的yaml文件定义。

也可以通过 
```
kubectl explain pods
# 或者
kubectl explain pods.metadata
```
来获取资源的定义方式，这里可以一直点下去。

所有的资源对象都有标签。例如在定义pod资源清单的时候可以指定一个 nodeSelector 字段（节点标签选择器），这个字段可以指定当前的 pod 要运行在哪个或哪类节点上。
许多资源支持内嵌字段定义其使用的标签选择器，例如：matchLabels（直接给定键值对）、matchExpressions（基于给定的表达式来定义使用的标签选择器：{key:"KEY", operator:"OPERATOR", value:["VALUE1, VALUE2……"]}，其中的操作符有：In, NotIn、Exists、NotExists，这些操作符中的字段值必须为非空列表）。

一个资源yaml文件可以定义多个资源，用 --- 作为分行符隔开即可。