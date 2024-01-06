# 【kubernetes】搭建单节点k8s

## 一、整体思路
* 由于电脑配置问题，只部署一个master节点并且所有pods都调度到这个master节点上

## 二、部署过程
### 2.1 准备工作
* 准备一台centos7主机，作为master节点  
* 确保各节点firewalld服务被禁用：
```
systemctl stop firewalld
systemctl disable firewalld
```

### 2.2 修改yum源
* 备份yum源
```
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
```
* 改为阿里云的yum源
```
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

### 2.3 安装etcd和Kubernetes软件（docker会在安装kubernetes的过程中被安装）
```
yum install -y etcd kubernetes
```

### 2.4 改apiserver的配置文件
将/etc/kubernetes/apiserver文件中的KUBE_ADMISSION_CONTROL中的ServiceAccount去掉

### 2.5 按顺序启动所有服务
```
systemctl start etcd
systemctl start docker
systemctl start kube-apiserver.service
systemctl start kube-controller-manager.service
systemctl start kube-scheduler.service
systemctl start kubelet.service
systemctl start kube-proxy.service
iptables -P FORWARD ACCEPT
```

### 2.6 通过获取所有节点来校验是否搭建成功
```
kubectl get nodes
```

### 2.7 为docker配置代理（不是必须的）
创建http-proxy.conf文件
```
mkdir -p /etc/systemd/system/docker.service.d
vi /etc/systemd/system/docker.service.d/http-proxy.conf
```
在http-proxy.conf文件中填入以下内容
```
[Service]
Environment="HTTP_PROXY=http://127.0.0.1:8080/"
```
为docker配置镜像加速
往 vi /etc/docker/daemon.json 中添加以下内容
```
{
  "registry-mirrors": ["http://hub-mirror.c.163.com"]
}
```
重启docker
```
systemctl daemon-reload
systemctl restart docker
```

### 2.8 拉取pod-infrastructure镜像，目的在于防止pod一直处于containerCreating状态
```
## 第一步
yum install *rhsm* -y
## 第二步
wget http://mirror.centos.org/centos/7/os/x86_64/Packages/python-rhsm-certificates-1.19.10-1.el7_4.x86_64.rpm
## 第三步
rpm2cpio python-rhsm-certificates-1.19.10-1.el7_4.x86_64.rpm | cpio -iv --to-stdout ./etc/rhsm/ca/redhat-uep.pem | tee /etc/rhsm/ca/redhat-uep.pem
## 第四步
docker pull tianyebj/pod-infrastructure
## 第五步
docker tag docker.io/tianyebj/pod-infrastructure:latest registry.access.redhat.com/rhel7/pod-infrastructure:latest
```

### 到这里就安装完成了，就可以创建各种k8s资源了

## 三、节点重启后需要执行的操作
### 重新按顺序执行 2.5 中的步骤
