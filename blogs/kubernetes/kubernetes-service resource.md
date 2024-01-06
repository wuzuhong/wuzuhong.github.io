# 【kubernetes】service资源
## service资源的工作模式
* userspace

![service的工作模式—userspace](./images/kubernetes-service-userspace.png)

* iptables

![service的工作模式—iptables](./images/kubernetes-service-iptables.png)

* ipvs（默认的工作模式）

![service的工作模式—ipvs](./images/kubernetes-service-ipvs.png)

## service资源的类型
* ExternalName ：让集群内部可以访问集群外部的服务。
* ClusterIP（默认） ：让集群内部之间可以互相访问。
* NodePort ：让集群外部可以访问集群内部的服务，可以通过集群内任意节点的ip加上service暴露的随机端口进行访问。
* LoadBalancer ：用于自动在集群外部创建负载均衡器。

## 创建service资源
查看service资源的定义方式，可以一直点下去
```
kubectl explain service
```

定义service资源的yaml文件示例，service-demo.yml ：
```
#用于指定当前创建的资源所属的 api 群组及其版本，一般为组名/版本的形式，
#可以使用 kubectl api-versions 命令来获取所有可用的apiVersion
apiVersion: v1
#资源类型
kind: Service
#元数据
metadata:
  #资源的名称，在同一个名称空间中的同一个资源类型下的资源的名称必须唯一  
  name: redis-service
  #资源的名称空间
  namespace: default 
spec: 
  #service的类型
  type: ClusterIP
  ports: 
    - port: 6379
      targetPort: 6379
  #标签选择器，用于选择要被当前 service 所代理的 pod 资源
  selector: 
    app: redis
```

定义好service资源的yaml文件后就可以创建service资源了
```
kubectl apply -f service-demo.yml
```

查看当前已创建的service资源
```
kubectl get svc -o wide
```

查看某个已创建的service资源的详细信息；
```
kubectl describe svc redis-service
```