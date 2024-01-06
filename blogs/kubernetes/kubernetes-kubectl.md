# 【kubernetes】使用kubectl相关命令与Kubernetes集群进行交互
* 获取所有deployment控制器
    ```
    kubectl get deployment
    ```
* 获取所有业务级pod并显示其详细信息
    ```
    kubectl get pods -o wide
    ```
* 获取所有业务级pod并显示其详细信息和标签
    ```
    kubectl get pods -o wide --show-labels
    ```
* 获取所有业务级别中拥有某个标签的pods资源并显示其标签
    ```
    kubectl get pods -l tier=frontend --show-labels
    ```
    当然也可以通过 != 符号。
* 获取所有业务级pod并实时观察其状态
    ```
    kubectl get pods -w
    ```
* 查看pod中暴露的端口
    ```
    kubectl exec tomcat-78f4d8d8fb-5t76f -- netstat -tnl
    ```
* 删除一个pod
    ```
    kubectl delete pods nginx-deploy-6c884698c9-xlbfj
    # 也可以通过对应pod资源的yaml文件来删除
    kubectl delete -f pod-demo.yml
    ```
* 强制删除一个pod
    ```
    kubectl delete pod nginx-deploy-6c884698c9-xlbfj --force --grace-period=0
    ```
* 删除deployment控制器
    ```
    kubectl delete deployment nginx-deploy
    ```
* 获取所有业务级service并显示其详细信息
    ```
    kubectl get service -o wide
    ```
* 改变deployment控制器的副本数量
    ```
    kubectl scale --replicas=3 deployment nginx-deploy
    ```
* 升级deployment控制器中使用的镜像版本号
    ```
    kubectl set image deployment nginx-deploy nginx-deploy=daocloud.io/library/nginx:1.15.6-alpine
    ```
* 回滚deployment控制器的版本到上一个版本
    ```
    kubectl rollout undo deployment nginx-deploy
    ```
* 编辑service配置
    ```
    kubectl edit service nginx
    ```
* 获取所有业务级service
    ```
    kubectl get service
    ```
* 获取某个pod的某个容器的日志
    ```
    kubectl log pod-demo tomcat
    ```
* 进入某个pod的某个容器中
    ```
    kubectl exec -it pod-demo -c tomcat -- /bin/sh
    ```
* 为资源添加一个标签
    ```
    kubectl label pods pod-demo release=canary
    ```
* 修改资源的某个标签
    ```
    kubectl label pods pod-demo release=stable --overwrite
    ```