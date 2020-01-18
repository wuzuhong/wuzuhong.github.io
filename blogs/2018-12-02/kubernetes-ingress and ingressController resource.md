# 【kubernetes】Ingress和IngressController资源
IngressController独立运行的一个或一组pod资源，通常就是一个拥有七层反向代理能力和转发能力的应用程序，其需要Ingress做支持；Ingress资源是结合service资源来工作的，它将service收集到的pod网络ip定义成upstream server，并把这些信息反映在Ingress当中，然后由Ingress动态注入到IngressController当中，也就是说pod变化了，service就变化，Ingress也随之变化并注入到IngressController当中。

![Ingress和IngressController](./images/kubernetes-ingress-and-ingressController.png)

首先由外部的负载均衡器（externalLB）将请求转发到一个NodePort类型的service上来（这个service是可选的，如果不用这个service的话，可以将IngressController定义成共享节点网络名称空间的DaemonSet来控制，并运行在特定节点上，注意，这里是特定节点，而不是所有集群节点），然后由这个service将请求转发至IngressController，然后IngressController根据Ingress中的定义将请求转发至ClusterIP类型的service资源上，最后再转发至pod中。

## 创建IngressController
* 首先创建一个名称空间
```
kubectl create namespace ingress-nginx
```

* 然后新建 mandatory.yaml 文件，并写入以下内容
```
apiVersion: v1
kind: Namespace
metadata:
  name: ingress-nginx

---

apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: default-http-backend
  labels:
    app.kubernetes.io/name: default-http-backend
    app.kubernetes.io/part-of: ingress-nginx
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: default-http-backend
      app.kubernetes.io/part-of: ingress-nginx
  template:
    metadata:
      labels:
        app.kubernetes.io/name: default-http-backend
        app.kubernetes.io/part-of: ingress-nginx
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: default-http-backend
          # Any image is permissible as long as:
          # 1. It serves a 404 page at /
          # 2. It serves 200 on a /healthz endpoint
          image: k8s.gcr.io/defaultbackend-amd64:1.5
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
              scheme: HTTP
            initialDelaySeconds: 30
            timeoutSeconds: 5
          ports:
            - containerPort: 8080
          resources:
            limits:
              cpu: 10m
              memory: 20Mi
            requests:
              cpu: 10m
              memory: 20Mi

---
apiVersion: v1
kind: Service
metadata:
  name: default-http-backend
  namespace: ingress-nginx
  labels:
    app.kubernetes.io/name: default-http-backend
    app.kubernetes.io/part-of: ingress-nginx
spec:
  ports:
    - port: 80
      targetPort: 8080
  selector:
    app.kubernetes.io/name: default-http-backend
    app.kubernetes.io/part-of: ingress-nginx

---

kind: ConfigMap
apiVersion: v1
metadata:
  name: nginx-configuration
  namespace: ingress-nginx
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx

---

kind: ConfigMap
apiVersion: v1
metadata:
  name: tcp-services
  namespace: ingress-nginx
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx

---

kind: ConfigMap
apiVersion: v1
metadata:
  name: udp-services
  namespace: ingress-nginx
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx

---

apiVersion: v1
kind: ServiceAccount
metadata:
  name: nginx-ingress-serviceaccount
  namespace: ingress-nginx
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx

---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRole
metadata:
  name: nginx-ingress-clusterrole
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
rules:
  - apiGroups:
      - ""
    resources:
      - configmaps
      - endpoints
      - nodes
      - pods
      - secrets
    verbs:
      - list
      - watch
  - apiGroups:
      - ""
    resources:
      - nodes
    verbs:
      - get
  - apiGroups:
      - ""
    resources:
      - services
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - "extensions"
    resources:
      - ingresses
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - ""
    resources:
      - events
    verbs:
      - create
      - patch
  - apiGroups:
      - "extensions"
    resources:
      - ingresses/status
    verbs:
      - update

---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: Role
metadata:
  name: nginx-ingress-role
  namespace: ingress-nginx
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
rules:
  - apiGroups:
      - ""
    resources:
      - configmaps
      - pods
      - secrets
      - namespaces
    verbs:
      - get
  - apiGroups:
      - ""
    resources:
      - configmaps
    resourceNames:
      # Defaults to "<election-id>-<ingress-class>"
      # Here: "<ingress-controller-leader>-<nginx>"
      # This has to be adapted if you change either parameter
      # when launching the nginx-ingress-controller.
      - "ingress-controller-leader-nginx"
    verbs:
      - get
      - update
  - apiGroups:
      - ""
    resources:
      - configmaps
    verbs:
      - create
  - apiGroups:
      - ""
    resources:
      - endpoints
    verbs:
      - get

---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: RoleBinding
metadata:
  name: nginx-ingress-role-nisa-binding
  namespace: ingress-nginx
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: nginx-ingress-role
subjects:
  - kind: ServiceAccount
    name: nginx-ingress-serviceaccount
    namespace: ingress-nginx

---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: nginx-ingress-clusterrole-nisa-binding
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: nginx-ingress-clusterrole
subjects:
  - kind: ServiceAccount
    name: nginx-ingress-serviceaccount
    namespace: ingress-nginx

---

apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx-ingress-controller
  namespace: ingress-nginx
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: ingress-nginx
      app.kubernetes.io/part-of: ingress-nginx
  template:
    metadata:
      labels:
        app.kubernetes.io/name: ingress-nginx
        app.kubernetes.io/part-of: ingress-nginx
      annotations:
        prometheus.io/port: "10254"
        prometheus.io/scrape: "true"
    spec:
      serviceAccountName: nginx-ingress-serviceaccount
      containers:
        - name: nginx-ingress-controller
          image: quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.20.0
          args:
            - /nginx-ingress-controller
            - --default-backend-service=$(POD_NAMESPACE)/default-http-backend
            - --configmap=$(POD_NAMESPACE)/nginx-configuration
            - --tcp-services-configmap=$(POD_NAMESPACE)/tcp-services
            - --udp-services-configmap=$(POD_NAMESPACE)/udp-services
            - --publish-service=$(POD_NAMESPACE)/ingress-nginx
            - --annotations-prefix=nginx.ingress.kubernetes.io
          securityContext:
            capabilities:
              drop:
                - ALL
              add:
                - NET_BIND_SERVICE
            # www-data -> 33
            runAsUser: 33
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
          ports:
            - name: http
              containerPort: 80
            - name: https
              containerPort: 443
          livenessProbe:
            failureThreshold: 3
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1

---
```

* 然后下载镜像并修改镜像名
```
docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/nginx-ingress-controller:0.20.0
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/nginx-ingress-controller:0.20.0 quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.20.0
docker pull registry.cn-hangzhou.aliyuncs.com/chewel_k8s/defaultbackend-amd64:1.5
docker tag registry.cn-hangzhou.aliyuncs.com/chewel_k8s/defaultbackend-amd64:1.5 k8s.gcr.io/defaultbackend-amd64:1.5
docker rmi registry.cn-hangzhou.aliyuncs.com/chewel_k8s/defaultbackend-amd64:1.5
docker rmi registry.cn-hangzhou.aliyuncs.com/google_containers/nginx-ingress-controller:0.20.0
```

* 最后创建IngressController
```
kubectl apply -f mandatory.yaml 
```

## 创建Ingress资源
查看Ingress的定义方式，可以一直点下去
```
kubectl explain ingress
```

* 首先创建后端pod，用于测试，这里使用deployment控制器运行tomcat
```
kubectl apply -f deploy-demo.yaml
```

* 然后创建一个ClusterIP类型的service，用于代理上一步创建的tomcat
```
kubectl apply -f service-demo.yaml
```

* 然后定义一个NodePort类型的service用于代理IngressController，service-ingresscontroller.yaml ： 
```
apiVersion: v1
kind: Service
metadata:
  name: ingress-nginx
  namespace: ingress-nginx
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
spec:
  type: NodePort
  ports:
    - name: http
      port: 80
      targetPort: 80
      protocol: TCP
    - name: https
      port: 443
      targetPort: 443
      protocol: TCP
  selector:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
```
，然后创建该service
```
kubectl apply -f service-ingresscontroller.yaml
```

* 然后定义Ingress资源，ingress-demo.yml ：
```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: tomcat-ingress
  #注解。用于指明我们用的 IngressController 是 nginx
  annotations:
    kubernetes.io/ingress.class: "nginx"
  namespace: default
spec:
  #代理规则。这里定义的是将tomcat.xiaowu.com域名下的所有路径代理至名称为 tomcat 的 service
  rules:
  - host: tomcat.xiaowu.com
    http:
      paths:
        #匹配路径
      - path:
        #匹配的后端service
        backend:
          #service的名称
          serviceName: tomcat
          #service暴露的端口
          servicePort: 8080
```
，然后创建Ingress资源
```
kubectl apply -f ingress-demo.yml
```
，当Ingress资源创建成功后，Ingress会将信息自动注入到IngressController中；之后在物理机的浏览器中通过tomcat.xiaowu.com域名加上名为ingress-nginx的service所暴露的随机端口就能访问集群内的tomcat了，注意要在物理机的hosts文件中配置域名映射，可映射到集群的任意节点。