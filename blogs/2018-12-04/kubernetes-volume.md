# 【kubernetes】存储卷
## kubernetes存储卷是pod级别的
查看所有存储卷类型
```
kubectl explain pods.spec.volumes
```

在存储卷类型中有一个叫persistentVolumeClaim的，简称 pvc，翻译后为持久存储申请，它是帮我们创建存储卷的，因为自己创建存储卷很难，需要深入了解各类存储系统。

## 典型的kubernetes存储卷详解
* emptyDir
它是pod级别的，当pod删除后，该类存储卷也会被删除，它即可以使用pod硬盘空间，也可以使用pod内存空间来存储数据。下面是创建一个自主式的pod并挂载emptyDir存储卷的yaml文件示例：
```
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: demo
  name: demo
  namespace: default
spec:
  containers:
    - image: daocloud.io/library/tomcat:8.0.38-jre8-alpine
      name: tomcat
      ports: 
        - name: http
          containerPort: 8080
      #定义容器挂载参数    
      volumeMounts: 
          #指定要挂载的存储卷名称
        - name: html
          #指定要挂载的容器内目录
          mountPath: /usr/local/tomcat/webapps/ROOT/html
  #定义存储卷        
  volumes: 
      #定义存储卷名称
    - name: html
      #定义存储卷类型为emptyDir，这里省略了emptyDir定义的细节，而用{}来使用默认的配置
      emptyDir: {}
```

* hostPath
它是节点级别的，使用宿主机的硬盘空间来存储数据的，所以在pod被删除后，该类存储卷和其中的数据依然会存在，但是如果节点宕机了，存储卷和数据也就没了，相应的，它在跨节点调度时，数据也是会丢失的。下面是创建一个自主式的pod并挂载hostPath存储卷的yaml文件示例：
```
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: demo
  name: demo
  namespace: default
spec:
  containers:
    - image: daocloud.io/library/tomcat:8.0.38-jre8-alpine
      name: tomcat
      ports: 
        - name: http
          containerPort: 8080
      volumeMounts: 
        - name: html
          mountPath: /usr/local/tomcat/webapps/ROOT/html
  volumes: 
    - name: html
      #定义存储卷类型为hostPath
      hostPath: 
        #宿主机的目录
        path: /data/pod/volume1
        #类型。访问https://kubernetes.io/docs/concepts/storage/volumes/#hostpath查看可定义的类型
        type: DirectoryOrCreate
```

* nfs
若想存储卷和数据永不丢失，并且可以跨节点调用，那么就需要使用集群外部主机上的网络文件系统（例如：nfs），需要在一个主机上创建 nfs，然后确保集群中的node节点支持nfs，然后在node节点上使用
```
mount -t nfs store01:/data/volumes /mnt
```
来挂载node节点上的/data/volumes目录到store01主机（装有nfs的集群外部主机）上。

下面是创建一个自主式的pod并挂载nfs存储卷的yaml文件示例：
```
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: demo
  name: demo
  namespace: default
spec:
  containers:
    - image: daocloud.io/library/tomcat:8.0.38-jre8-alpine
      name: tomcat
      ports: 
        - name: http
          containerPort: 8080
      volumeMounts: 
        - name: html
          mountPath: /usr/local/tomcat/webapps/ROOT/html
  volumes: 
    - name: html
      #定义存储卷类型为nfs
      nfs: 
        #宿主机的目录
        path: /data/pod/volumes
        #是否为只读
        readOnly: false
        #nfs服务器地址
        server: store01
```

## pvc（persistentVolumeClaim，持久存储申请）和pv（persistentVolume，持久存储）
![pv和pvc](./images/kubernetes-pv-pvc1.png)
![pv和pvc](./images/kubernetes-pv-pvc2.png)

pvc和pv都是kubernetes中的一种资源，通过kubectl explain可以查看其定义方式。

pv和pvc的原理和流程：系统上应该有一个存储设备，由存储工程师在上面划分好许多个可被单独使用的存储空间；然后由k8s集群运维工程师将这些存储空间都引入到k8s集群中并定义成pv；用户或开发工程师在k8s集群中创建pod之前要先定义并创建一个pvc，用于去k8s集群中找一个可用的pv，也就是存储空间；pv和pvc是对应的，如果一个pv被某个pvc占用了，那么这个pv就不能再被其他pvc使用了，这个pv的状态会变为Bound；一个pvc被创建以后，这个pvc就相当于一个存储卷，这个存储卷可以被多个pod挂载；在创建pvc之前需要创建好pv，如果没有创建好pv，那么这个pvc会变为pedding状态。

以下是创建一个pv、pvc和deployment并让这个deployment的目录挂载到这个pvc上的yaml文件示例：
先创建pv：
```
apiVersion: v1
kind: PersistentVolume
metadata:
  annotations:
    creator: wuzuhong 
    name: kong网关-数据库存储卷
  labels:
    cluster: admin
    pvname: admin.kong-pgs-storage
  name: admin.kong-pgs-storage
  namespace: admin
spec:
  accessModes:
  - ReadWriteMany
  capacity:
    storage: 10Gi
  # nfs相关信息
  nfs:
    path: /data/admin/kong/pgs/dev
    server: 192.168.56.101
  # 指定pv的回收策略，Retain表示在pv删除后保留文件
  persistentVolumeReclaimPolicy: Retain
```
然后创建pvc
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  annotations:
    nfs.path: /data/admin/kong/pgs/dev'
  labels:
    cluster: admin
  name: kong-pgs-storage
  namespace: admin
spec:
  accessModes:
  - ReadWriteMany
  resources:
    limits:
      storage: 10Gi
    requests:
      storage: 10Gi
  # pv的名字
  volumeName: admin.kong-pgs-storage
```
最后创建deployment，并挂载pvc
```
apiVersion: apps/v1
kind: Deployment
metadata:
  annotations:
    creator: wuzuhong 
    name: kong网关-数据库
  labels:
    cluster: admin
    application: dev-kong-pgs
    env: dev
  name: dev-kong-pgs'
  namespace: admin
spec:
  replicas: 1
  selector:
    matchLabels:
      application: dev-kong-pgs
  template:
    metadata:
      labels:
        application: dev-kong-pgs
    spec:
      containers:
      - env:
        - name: POSTGRES_USER
          value: kong
        - name: POSTGRES_DB
          value: kong
        - name: POSTGRES_PASSWORD
          value: kong
        image: postgres:9.6
        imagePullPolicy: IfNotPresent
        name: env-kong-pgs
        ports:
        - containerPort: 5432
          protocol: TCP
        resources:
          limits:
            cpu: "1"
            memory: 2Gi
        volumeMounts:
          # 指定需要挂载的存储卷名称
        - name: kong-pgs-storage
          # 指定要挂载的容器目录
          mountPath: /var/lib/postgresql/data
      nodeSelector:
        cluster: admin
      restartPolicy: Always
      #定义存储卷
      volumes:
        # 定义存储卷的名称
      - name: kong-pgs-storage
        # 指定pvc
        persistentVolumeClaim:
          # pvc的名称
          claimName: kong-pgs-storage
```

# configmap和secret
假如我们有20个pod，由deployment管理，如果我们要对这20个pod进行更新，可能就是更新一个很小的配置，我们就需要做灰度更新，这样代价太大。因此，我们不把配置写死在镜像中，而是用一种kubernetes资源，叫做configmap，configmap中放的是配置信息，当我们启动这20个pod的时候，他们可以共享使用同一个configmap资源，configmap资源对象可以当存储卷来挂载到配置文件目录下使用，也可以从环境变量中读取配置信息并将这些信息注入到容器中使用。若configmap中的配置信息改变了，configmap会通知所有pod，pod会自动重载配置。configmap中的数据是明文存储的，而secret拥有与configmap相同的功能，但是secret中的数据是用base64编码后存储的。configmap 和 secret 都是pod存储卷的一种，同时也都是kubernetes的资源。

* 创建configmap
新增一个配置文件www.conf，里面新增以下自定义配置信息：
```
server {
  server_name myapp xiaowu.com;
  listen 80;
  root /data/web/html/;
}
```
然后使用
```
kubectl create configmap nginx-www --from-file=./www.conf
```
即可创建一个基于这个配置文件的configmap，这个configmap的名称是nginx-www

* 使用configmap
以下是创建一个pod并且其中的环境变量引用自configmap的yaml文件示例：
```
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: demo
  name: demo
  namespace: default
spec:
  containers:
    - image: daocloud.io/library/tomcat:8.0.38-jre8-alpine
      name: tomcat
      ports: 
        - name: http
          containerPort: 8080
      #环境变量
      env: 
        - name: NGINX_SERVER_LISTEN
          #一般的环境变量这里应该写value，但是我们现在要引用configmap，所以要写成valueFrom
          valueFrom:
            configMapKeyRef: 
              #configmap的名字 
              name: nginx-www
              #所引用的configmap中的value对应的的key
              key: listen
              #这个字段用于指定当前的key是否必须在configmap中定义，true表示不是必须的
              optional: true
        - name: NGINX_SERVER_NAME
          valueFrom:
            configMapKeyRef:
              #configmap的名字 
              name: nginx-www
              #所引用的configmap中的value对应的的key
              key: server_name
              #这个字段用于指定当前的key是否必须在configmap中定义，true表示不是必须的
              optional: true
```

* 以上都是在容器级别使用configmap，现在通过挂载configmap存储卷的形式来定义pod级别的configmap
```
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: demo
  name: demo
  namespace: default
spec:
  containers:
    - image: daocloud.io/library/tomcat:8.0.38-jre8-alpine
      name: tomcat
      ports: 
        - name: http
          containerPort: 8080
      volumeMounts: 
        - name: nginxconf
          #挂载configmap中配置信息到容器的指定目录
          mountPath: /etc/nginx/config.d/
          readOnly: true
  volumes: 
    - name: nginxconf
      #指定存储卷类型为 configMap
      configMap: 
        #configmap 的名字
        name: nginx-www
```
启动后，只要configmap的配置改变后，容器内部的配置目录文件中的信息也会随之自动改变，不过有的已经被容器加载的配置，需要让容器重载才能生效。

创建secret和创建configmap相类似，需要注意的是，创建secret时有三种可选类型：
docker-registry（用于docker镜像拉取时去连接docker私有仓库做认证的）、tls（用于放置证书和私钥的）、generic（其他用法都用当前类型）