# 【区块链—Hyperledger Fabric】部署过程
## Hyperledger Fabric 2.0.1 部署过程

### 安装 curl
```s
yum -y install curl
```

### 安装 wget
```s
yum -y install wget
```

### 安装 docker 和 docker compose（安装 docker 的时候会默认安装 docker compose）
```s
# 卸载旧版本
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

# 安装依赖包
yum install -y yum-utils \
    device-mapper-persistent-data \
    lvm2

# 添加 yum 软件源
yum-config-manager \
    --add-repo \
    https://mirrors.ustc.edu.cn/docker-ce/linux/centos/docker-ce.repo

# 更新 yum 软件源缓存
yum makecache fast

# 安装 docker-ce
yum install docker-ce

# 启动 docker-ce
systemctl enable docker
systemctl start docker
```

### 安装 go
* 下载 1.13.4 版本的 go 安装包 https://dl.google.com/go/go1.13.4.linux-amd64.tar.gz ，并解压：
```s
gunzip go1.13.4.linux-amd64.tar.gz
tar -xvf go1.13.4.linux-amd64.tar
```

* 移动到指定目录下
```s
mv go /usr/local/
```

* 添加环境变量
```s
# 编辑文件
vi /etc/profile

# 向文件中末尾添加以下内容
export GOROOT=/usr/local/go
export GOPATH=/usr/local/gopath
PATH=$PATH:$GOROOT/bin

# 使用文件编辑生效
source /etc/profile
```

* 验证
```s
go version
```

### 安装 git
```s
yum install -y git
```

### 部署 Hyperledger Fabric
* 创建放置源码的文件夹
```s
mkdir -p $GOPATH/src/github.com/hyperledger
```

* 下载 2.0.1 版本的源码 https://codeload.github.com/hyperledger/fabric/zip/v2.0.1 ，并解压后移动到指定目录
```s
# 解压
unzip fabric-2.0.1.zip

# 移动到指定目录
mv fabric-2.0.1 $GOPATH/src/github.com/hyperledger/
cd $GOPATH/src/github.com/hyperledger
mv fabric-2.0.1/ fabric/
```

* 配置 docker 国内镜像源
```s
# 编辑文件
vi /etc/docker/daemon.json

# 修改文件中的内容为
{
    "registry-mirrors": ["http://hub-mirror.c.163.com"]
}

# 重启 docker
systemctl restart docker
```

* 执行 bootstrap.sh 来下载镜像和二进制文件。注意：需要把 bootstrap.sh 文件中的 pullBinaries 方法（第85行）以及其调用的代码（196）注释掉，因为下载不下来，都是网络的锅
```s
cd fabric/scripts/

# 下载相关镜像和fabric-samples文件夹到当前目录
./bootstrap.sh
```

* 下载 https://github.com/hyperledger/fabric/releases/download/v2.0.1/hyperledger-fabric-linux-amd64-2.0.1.tar.gz 和 https://github.com/hyperledger/fabric-ca/releases/download/v1.4.6/hyperledger-fabric-ca-linux-amd64-1.4.6.tar.gz ，然后移动到指定目录并解压
```s
# 移动
mv hyperledger-fabric-linux-amd64-2.0.1.tar.gz $GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/
mv hyperledger-fabric-ca-linux-amd64-1.4.6.tar.gz $GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/

cd $GOPATH/src/github.com/hyperledger/fabric/scripts/fabric-samples/

# 解压
tar xvzf hyperledger-fabric-linux-amd64-2.0.1.tar.gz
tar xvzf hyperledger-fabric-ca-linux-amd64-1.4.6.tar.gz
```

* 启动测试网络
```s
cd test-network/
./network.sh up
```

* 停止测试网络
```s
./network.sh down
```
