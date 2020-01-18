# 【kubernetes】使用kubeadm部署Kubernetes集群

## 一、整体思路
![整体思路](./images/kubernetes-deploy-ideas.png "整体思路")
* 由于电脑配置问题，只部署一个master节点和两个node节点。
* 每一个节点（包括master和node）都需要安装kubeadm、kubelet和docker（kubeadm目前只支持17.03以下版本的docker）。
* 将第一个节点初始化为master节点，并且将 API Server、etcd、ControllerManager、kube-proxy、flannel和scheduler都以pod的形式运行起来，他们属于静态pod，不受k8s管理。
* 将其他的节点初始化为node节点，并且将kube-proxy、flannel以pod的形式运行起来，他们属于静态pod，不受k8s管理。
* 每一个节点，包括master和node，都需要将flannel以pod的形式运行起来，这个pod是动态pod，由k8s来管理。

## 二、部署过程（docker:1.12.6、kubelet:v1.12.2、kubeadm:v1.12.2、kubectl:v1.12.2）
### 2.1 准备工作
* 准备三台centos7主机，一台作为master节点，两台作为node节点；
* 节点的时间进行同步：
    ```
    yum install ntpdate -y
    ntpdate ntp.api.bz
    ```
* 修改hosts，使得各节点能通过域名相互解析：
    ```
    vi /etc/hosts
    # 新增以下内容
    192.168.56.101  master
    192.168.56.102  node1
    192.168.56.103  node2
    ```
* 确保各节点firewalld服务被禁用：
    ```
    systemctl stop firewalld
    systemctl disable firewalld
    ```
* 确保各节点主机名唯一：
    ```
    hostnamectl set-hostname 192-168-56-201.master
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
* 安装wget
    ```
    yum -y install wget
    ```

### 2.3 新增kubernetes镜像源文件kubernetes.repo
```
cd /etc/yum.repos.d
vi kubernetes.repo
# 文件内容如下
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
```

### 2.4 安装docker
* 移除旧版
    ```
    yum remove docker \
        docker-client \
        docker-client-latest \
        docker-common \
        docker-latest \
        docker-latest-logrotate \
        docker-logrotate \
        docker-selinux \
        docker-engine-selinux \
        docker-engine
    ```
* 安装一些必要的系统工具
    ```
    yum install -y yum-utils device-mapper-persistent-data lvm2
    ```
* 新增docker镜像源文件docker.repo
    ```
    cd /etc/yum.repos.d
    vi docker.repo
    # 文件内容如下
    [dockerrepo]
    name=Docker Repository
    baseurl=http://mirrors.aliyun.com/docker-ce/linux/centos/7/$basearch/stable
    enabled=1
    gpgcheck=1
    gpgkey=http://mirrors.aliyun.com/docker-ce/linux/centos/gpg
    ```  
* 更新yum缓存
    ```
    yum makecache fast
    ```
* 安装 Docker
    ```
    yum install docker-ce-18.06.3.ce
    ```
* 启动docker服务并设置开机自启
    ```
    systemctl enable docker && systemctl start docker
    ```

### 2.5 安装kubectl、kubelet、kubeadm
```
# 只需在master安装
yum install -y kubectl-1.12.2-0.x86_64
# master和node节点都需要安装
yum install -y kubelet-1.12.2-0.x86_64
master和node节点都需要安装
yum install -y kubeadm-1.12.2-0.x86_64
```

### 2.6 设置kubelet开机自启
```
systemctl enable kubelet
```

### 2.7 开启iptabls
```
vi /etc/sysctl.conf
# 新增以下内容
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-arptables = 1
```

### 2.8 重启所有节点

### 2.9 关闭Swap错误提示
```
vi /etc/sysconfig/kubelet
# 文件内容如下
KUBELET_EXTRA_ARGS="--fail-swap-on=false"
```

### 2.10 在master节点上执行shell脚本来下载所需docker镜像
* 新建shell脚本文件
    ```
    vi /root/download_master_image.sh
    # 文件内容如下
    # 全局变量
    K8S_VERSION=v1.12.2
    ETCD_VERSION=3.2.24
    DNS_VERSION=1.2.2
    PAUSE_VERSION=3.1
    DASHBOARD_VERSION=v1.10.0
    FLANNEL_VERSION=v0.10.0-amd64
    # 基本组件
    docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/kube-apiserver-amd64:$K8S_VERSION
    docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/kube-controller-manager-amd64:$K8S_VERSION
    docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/kube-scheduler-amd64:$K8S_VERSION
    docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/kube-proxy-amd64:$K8S_VERSION
    docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/etcd-amd64:$ETCD_VERSION
    docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/pause:$PAUSE_VERSION
    docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/coredns:$DNS_VERSION
    # 网络组件
    docker pull registry.cn-beijing.aliyuncs.com/k8s_images/flannel:$FLANNEL_VERSION
    # 修改tag
    docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/kube-apiserver-amd64:$K8S_VERSION k8s.gcr.io/kube-apiserver:$K8S_VERSION
    docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/kube-controller-manager-amd64:$K8S_VERSION k8s.gcr.io/kube-controller-manager:$K8S_VERSION
    docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/kube-scheduler-amd64:$K8S_VERSION k8s.gcr.io/kube-scheduler:$K8S_VERSION
    docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/kube-proxy-amd64:$K8S_VERSION k8s.gcr.io/kube-proxy:$K8S_VERSION
    docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/etcd-amd64:$ETCD_VERSION k8s.gcr.io/etcd:$ETCD_VERSION
    docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/pause:$PAUSE_VERSION k8s.gcr.io/pause:$PAUSE_VERSION
    docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/coredns:$DNS_VERSION k8s.gcr.io/coredns:$DNS_VERSION 
    docker tag registry.cn-beijing.aliyuncs.com/k8s_images/flannel:$FLANNEL_VERSION quay.io/coreos/flannel:$FLANNEL_VERSION
    # 删除基本组件
    docker rmi registry.cn-hangzhou.aliyuncs.com/google_containers/kube-apiserver-amd64:$K8S_VERSION
    docker rmi registry.cn-hangzhou.aliyuncs.com/google_containers/kube-controller-manager-amd64:$K8S_VERSION
    docker rmi registry.cn-hangzhou.aliyuncs.com/google_containers/kube-scheduler-amd64:$K8S_VERSION
    docker rmi registry.cn-hangzhou.aliyuncs.com/google_containers/kube-proxy-amd64:$K8S_VERSION
    docker rmi registry.cn-hangzhou.aliyuncs.com/google_containers/etcd-amd64:$ETCD_VERSION
    docker rmi registry.cn-hangzhou.aliyuncs.com/google_containers/pause:$PAUSE_VERSION
    docker rmi registry.cn-hangzhou.aliyuncs.com/google_containers/coredns:$DNS_VERSION
    docker rmi registry.cn-beijing.aliyuncs.com/k8s_images/flannel:$FLANNEL_VERSION
    ```
* 给shell脚本添加可执行权限并执行
    ```
    chmod -R 777 /root/download_master_image.sh
    /root/download_master_image.sh
    ```

    注意：flannel和coredns镜像可能需要单独处理，因为可能找不到；如果出现奇怪的错误，则重启主机，并重试

### 2.11 在master节点上初始化集群
```
kubeadm init --kubernetes-version=v1.12.2 --pod-network-cidr=10.244.0.0/16 --service-cidr=10.96.0.0/12 --apiserver-advertise-address=192.168.56.101 --ignore-preflight-errors=Swap --node-name 192-168-56-101.master
```
这里的apiserver-advertise-address就是指定的master节点的地址，service-cidr就是service网络的网段，pod-network-cidr就是节点网络的网段，ignore-preflight-errors=Swap就是为了忽略swap错误提示，--node-name master 是用于指定master节点的名称，不能和当前宿主机的或其他节点的宿主机的hostname相同。
初始化执行完成之后会打印一些日志，需要把最后一行复制保存起来，这是node节点加入集群的命令，例如：
kubeadm join 10.0.2.15:6443 --token afxqkt.5fh1ejk308gnsvhu --discovery-token-ca-cert-hash sha256:a64f13d3df208d3f9afd2bf0ddf5d4e7b1c807ab4952c82b02d89199fab4b943

### 2.12 在node节点上执行shell脚本来下载所需docker镜像
* 新建shell脚本文件
    ```
    vi /root/download_node_image.sh
    # 文件内容如下
    # 全局变量
    K8S_VERSION=v1.12.2
    PAUSE_VERSION=3.1
    FLANNEL_VERSION=v0.10.0-amd64
    # 基本组件
    docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/kube-proxy-amd64:$K8S_VERSION
    docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/pause:$PAUSE_VERSION
    # 网络组件
    docker pull registry.cn-beijing.aliyuncs.com/k8s_images/flannel:$FLANNEL_VERSION
    # 修改tag
    docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/kube-proxy-amd64:$K8S_VERSION k8s.gcr.io/kube-proxy:$K8S_VERSION
    docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/pause:$PAUSE_VERSION k8s.gcr.io/pause:$PAUSE_VERSION
    docker tag registry.cn-beijing.aliyuncs.com/k8s_images/flannel:$FLANNEL_VERSION quay.io/coreos/flannel:$FLANNEL_VERSION
    # 删除基本组件
    docker rmi registry.cn-hangzhou.aliyuncs.com/google_containers/kube-proxy-amd64:$K8S_VERSION
    docker rmi registry.cn-hangzhou.aliyuncs.com/google_containers/pause:$PAUSE_VERSION
    docker rmi registry.cn-beijing.aliyuncs.com/k8s_images/flannel:$FLANNEL_VERSION
    ```
* 给shell脚本添加可执行权限并执行
    ```
    chmod -R 777 /root/download_node_image.sh
    /root/download_node_image.sh
    ```

    注意：flannel和coredns镜像可能需要单独处理，因为可能找不到；如果出现奇怪的错误，则重启主机，并重试

### 2.13 配置kubectl命令执行权限，需要提前将/etc/kubernetes/admin.conf从master节点上拷贝到当前node节点上
```
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown -R 777 $HOME/.kube/config
```

### 2.14 安装flannel
```
# 先下载资源文件 
https://raw.githubusercontent.com/coreos/flannel/v0.10.0/Documentation/kube-flannel-aliyun.yml
# 然后安装
kubectl apply -f kube-flannel-aliyun.yml
# 查看监听地址
ss -ntl
```

### 2.15 在node节点上执行命令来将node节点加入k8s集群
```
kubeadm join 10.0.2.15:6443 --token afxqkt.5fh1ejk308gnsvhu --discovery-token-ca-cert-hash sha256:a64f13d3df208d3f9afd2bf0ddf5d4e7b1c807ab4952c82b02d89199fab4b943 --ignore-preflight-errors=Swap
```

    这个命令就是master节点初始化集群后复制的命令

## 三、重置master节点（如果有需要）
* 重置kubeadm init命令
    ```
    kubeadm reset
    ```
* 重新初始化集群
    ```
    kubeadm init --kubernetes-version=v1.12.2 --pod-network-cidr=10.244.0.0/16 --service-cidr=10.96.0.0/12 --apiserver-advertise-address=192.168.56.101 --ignore-preflight-errors=Swap
    ```
    这里的apiserver-advertise-address就是指定的master节点的地址，service-cidr就是service网络的网段，pod-network-cidr就是节点网络的网段，ignore-preflight-errors=Swap就是为了忽略swap错误提示；之后要复制工作节点加入集群的命令并保存。
* 覆盖以前生成的文件
    ```
    rm -rf $HOME/.kube
    mkdir -p $HOME/.kube
    cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    ```
* 重新安装flannel
    ```
    kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
    ```
* 查看系统级pod运行状态来验证是否重置成功
    ```
    kubectl get pods -n kube-system
    ```

## 四、重置node节点（如果有需要）
* 重置kubeadm join命令
    ```
    kubeadm reset
    ```
* 重新加入集群
    ```
    kubeadm join 10.0.2.15:6443 --token afxqkt.5fh1ejk308gnsvhu --discovery-token-ca-cert-hash sha256:a64f13d3df208d3f9afd2bf0ddf5d4e7b1c807ab4952c82b02d89199fab4b943 --ignore-preflight-errors=Swap
    ```
