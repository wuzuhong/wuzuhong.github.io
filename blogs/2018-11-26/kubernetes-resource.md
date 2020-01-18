# 【kubernetes】kubernetes中的资源

## 资源类型
* 工作负载级别的资源：Pod、ReplicaSet、Deployment、StatefulSet、DaemonSet、Job、Cronjob等等。
* 服务发现及负载均衡级别的资源：Service、Ingress等等。
* 配置和存储级别的资源：Volume、CSI、ConfigMap等等。
* 集群级别的资源：Namespace、Node、Role、ClusterRole、RoleBinding、ClusterRoleBinding等等。
* 元数据型资源：PodTemplate、LimitRange等等。

## 创建资源的方法
apiserver仅接受JSON格式的资源定义；若使用yaml格式提供配置清单，apiserver可自动将其转为JSON格式（因为yaml格式可以无损转为JSON，而且yaml格式比JSON格式更加简单），然后再提交。因此我们通常是通过定义一个yaml文件来创建资源。
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

下面是一个pod资源的定义示例：
```
#用于指定当前创建的资源所属的 api 群组及其版本，一般为组名/版本的形式，
#可以使用 kubectl api-versions 命令来获取所有可用的apiVersion
apiVersion: v1
#资源类型
kind: Pod
#元数据
metadata:
  creationTimestamp: 2018-11-25T12:11:06Z
  generateName: nginx-deploy-6c884698c9-
  #资源的标签；
  #标签是键值对类型的数据，键和值都是自定义的，其中的键和值的字符数都不能大于63；
  #标签和资源是多对多的关系，一个标签可以添加至多个资源，一个资源也可拥有多个标签；
  #标签可以在资源创建之后通过命令来添加或删除资源的标签；
  #标签也可以在资源创建的时候指定，就如现在一样。
  labels:
    pod-template-hash: 6c884698c9
    run: nginx-deploy
  #资源的名称，在同一个名称空间中的同一个资源类型下的资源的名称必须唯一  
  name: nginx-deploy-6c884698c9-6jfz5
  #注解。
  #与labels不同的地方在于，它不能用于挑选资源对象，仅用于为对象添加元数据或叫做属性信息。
  annotations: 
    xiaowu.com/created-by: admin
  #资源的名称空间
  namespace: default 
  ownerReferences:
  - apiVersion: apps/v1
    blockOwnerDeletion: true
    controller: true
    kind: ReplicaSet
    name: nginx-deploy-6c884698c9
    uid: 13561a56-f0a3-11e8-90a1-080027abce14
  resourceVersion: "7939"
  #资源的引用路径
  selfLink: /api/v1/namespaces/default/pods/nginx-deploy-6c884698c9-6jfz5
  uid: 2fd3db34-f0ab-11e8-90a1-080027abce14
#当前资源被期望的状态，可由用户定义
spec:
  containers:
  - image: daocloud.io/library/nginx:1.14-alpine
    #镜像拉取策略，可选：IfNotPresent、Never、Always  
    imagePullPolicy: IfNotPresent
    name: nginx-deploy
    #生命周期，用于定义容器启动前后钩子
    lifecycle: 
      #容器刚启动后钩子
      postStart: 
        #在容器刚启动后执行shell命令来做一些操作
        exec: 
          command: ["/bin/sh","-c","mkdir -p /data"]
        #除了exec方式外，还可以使用httpGet的方式
        httpGet: 
          host: www.baidu.com
          httpHeaders:
          - name: Content-Type
            value: application/json    
          scheme: HTTP
          path: /index.html   
          port: 80           
      #容器即将停止前钩子，和postStart用法相似          
      preStop: 
    #存活状态探测
    livenessProbe:
      #通过exec方式执行一条命令来校验文件是否存在的方式来探测容器是否存活，若不存活，则会重启  
      exec: 
        command: ["test","-e","/tmp/healthy"]
      #除了exec方式外，还可以使用httpGet的方式，通过请求容器内部的指定端口和路径来探测容器是否存活，若不存活，则会重启  
      httpGet: 
        port: 80
        path: /index.html  
      #表示延迟1秒钟再开始探测  
      initialDelaySeconds: 1
      #表示每次探测的时间间隔
      periodSeconds: 3   
    #就绪状态探测
    readinessProbe: 
      #使用httpGet的方式，通过请求容器内部的指定端口和路径来探测容器是否存活，若不存活，则会重启
      httpGet: 
        port: 8080
        path: /users/apps  
      #表示延迟1秒钟再开始探测  
      initialDelaySeconds: 1
      #表示每次探测的时间间隔
      periodSeconds: 3  
    ports:
    - containerPort: 80
      protocol: TCP
    resources: {}
    terminationMessagePath: /dev/termination-log
    terminationMessagePolicy: File
    volumeMounts:
    - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
      name: default-token-45c8s
      readOnly: true
  dnsPolicy: ClusterFirst
  #指定当前pod要运行在哪一个节点之上
  nodeName: node1
  #节点标签选择器。
  #指定当前pod必须运行在有diskType标签，且它的值为ssd的node之上。
  nodeSelector: 
    diskType: ssd
  priority: 0
  #重启策略。可选：Always（默认值。只要容器停止了，就重启）,、OnFailure（只有因为错误而停止时才重启）、Never（从不重启）。
  restartPolicy: Always
  schedulerName: default-scheduler
  securityContext: {}
  serviceAccount: default
  serviceAccountName: default
  terminationGracePeriodSeconds: 30
  tolerations:
  - effect: NoExecute
    key: node.kubernetes.io/not-ready
    operator: Exists
    tolerationSeconds: 300
  - effect: NoExecute
    key: node.kubernetes.io/unreachable
    operator: Exists
    tolerationSeconds: 300
  volumes:
  - name: default-token-45c8s
    secret:
      defaultMode: 420
      secretName: default-token-45c8s
#当前资源目前的状态。本字段由kubernetes维护，用户不能自定义，
#也就是说以下内容不需要写入资源清单，即不需要写入yaml文件中
status:
  conditions:
  - lastProbeTime: null
    lastTransitionTime: 2018-11-25T12:11:06Z
    status: "True"
    type: Initialized
  - lastProbeTime: null
    lastTransitionTime: 2018-11-26T11:13:53Z
    status: "True"
    type: Ready
  - lastProbeTime: null
    lastTransitionTime: 2018-11-26T11:13:53Z
    status: "True"
    type: ContainersReady
  - lastProbeTime: null
    lastTransitionTime: 2018-11-25T12:11:06Z
    status: "True"
    type: PodScheduled
  containerStatuses:
  - containerID: docker://d6f34a2d56117223d01287c880c0b66c0507e328028d0313bdb0928eb4af6444
    image: daocloud.io/library/nginx:1.14-alpine
    imageID: docker-pullable://daocloud.io/library/nginx@sha256:9a7bc4c86e7ba9b704597296305b4fb811ccd951682c6d554101559e9239eb2c
    lastState:
      terminated:
        containerID: docker://5a6a02d8b3f1624e7ed46e2d2b94e30fd575c7383066bd0f3fc4c464bc5ac713
        exitCode: 0
        finishedAt: 2018-11-25T12:28:09Z
        reason: Completed
        startedAt: 2018-11-25T12:25:18Z
    name: nginx-deploy
    ready: true
    restartCount: 2
    state:
      running:
        startedAt: 2018-11-26T11:13:53Z
  hostIP: 192.168.56.102
  phase: Running
  podIP: 10.244.1.15
  qosClass: BestEffort
  startTime: 2018-11-25T12:11:06Z
```

也可以通过 
```
kubectl explain pods
# 或者
kubectl explain pods.metadata
```
来获取资源的定义方式，这里可以一直点下去。

所有的资源对象都有标签。例如在定义pod资源清单的时候可以指定一个 nodeSelector 字段（节点标签选择器），这个字段可以指定当前的 pod 要运行在哪个或哪类节点上。
许多资源支持内嵌字段定义其使用的标签选择器，例如：matchLabels（直接给定键值对）、matchExpressions（基于给定的表达式来定义使用的标签选择器：{key:"KEY", operator:"OPERATOR", value:["VALUE1, VALUE2……"]}，其中的操作符有：In, NotIn、Exists、NotExists，这些操作符中的字段值必须为非空列表）。

一个资源yaml文件可以定义多个资源，用 --- 隔开即可，例如：
```
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: demo
    tier: frontend
  name: pod-demo
  namespace: default
spec:
  containers:
  - image: daocloud.io/library/redis:3.2.10-alpine
    name: redis
  - image: daocloud.io/library/tomcat:8.0.38-jre8-alpine
    name: tomcat
---
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: demo2
    tier: frontend2
  name: pod-demo2
  namespace: default
spec:
  containers:
  - image: daocloud.io/library/kong:0.14.0
    name: kong
```