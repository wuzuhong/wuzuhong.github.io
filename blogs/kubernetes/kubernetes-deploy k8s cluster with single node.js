function getBlog(){
	return blog = {"content": "# 【kubernetes】搭建单节点k8s\n\n## 一、整体思路\n* 由于电脑配置问题，只部署一个master节点并且所有pods都调度到这个master节点上\n\n## 二、部署过程\n### 2.1 准备工作\n* 准备一台centos7主机，作为master节点  \n* 确保各节点firewalld服务被禁用：\n```\nsystemctl stop firewalld\nsystemctl disable firewalld\n```\n\n### 2.2 修改yum源\n* 备份yum源\n```\nmv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup\n```\n* 改为阿里云的yum源\n```\ncurl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo\n```\n\n### 2.3 安装etcd和Kubernetes软件（docker会在安装kubernetes的过程中被安装）\n```\nyum install -y etcd kubernetes\n```\n\n### 2.4 改apiserver的配置文件\n将/etc/kubernetes/apiserver文件中的KUBE_ADMISSION_CONTROL中的ServiceAccount去掉\n\n### 2.5 按顺序启动所有服务\n```\nsystemctl start etcd\nsystemctl start docker\nsystemctl start kube-apiserver.service\nsystemctl start kube-controller-manager.service\nsystemctl start kube-scheduler.service\nsystemctl start kubelet.service\nsystemctl start kube-proxy.service\niptables -P FORWARD ACCEPT\n```\n\n### 2.6 通过获取所有节点来校验是否搭建成功\n```\nkubectl get nodes\n```\n\n### 2.7 为docker配置代理（不是必须的）\n创建http-proxy.conf文件\n```\nmkdir -p /etc/systemd/system/docker.service.d\nvi /etc/systemd/system/docker.service.d/http-proxy.conf\n```\n在http-proxy.conf文件中填入以下内容\n```\n[Service]\nEnvironment=\"HTTP_PROXY=http://127.0.0.1:8080/\"\n```\n为docker配置镜像加速\n往 vi /etc/docker/daemon.json 中添加以下内容\n```\n{\n  \"registry-mirrors\": [\"http://hub-mirror.c.163.com\"]\n}\n```\n重启docker\n```\nsystemctl daemon-reload\nsystemctl restart docker\n```\n\n### 2.8 拉取pod-infrastructure镜像，目的在于防止pod一直处于containerCreating状态\n```\n## 第一步\nyum install *rhsm* -y\n## 第二步\nwget http://mirror.centos.org/centos/7/os/x86_64/Packages/python-rhsm-certificates-1.19.10-1.el7_4.x86_64.rpm\n## 第三步\nrpm2cpio python-rhsm-certificates-1.19.10-1.el7_4.x86_64.rpm | cpio -iv --to-stdout ./etc/rhsm/ca/redhat-uep.pem | tee /etc/rhsm/ca/redhat-uep.pem\n## 第四步\ndocker pull tianyebj/pod-infrastructure\n## 第五步\ndocker tag docker.io/tianyebj/pod-infrastructure:latest registry.access.redhat.com/rhel7/pod-infrastructure:latest\n```\n\n### 到这里就安装完成了，就可以创建各种k8s资源了\n\n## 三、节点重启后需要执行的操作\n### 重新按顺序执行 2.5 中的步骤\n", "title": "【kubernetes】搭建单节点k8s"}
}