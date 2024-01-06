# 【消息中间件-RocketMQ】Docker 部署
## 启动 NameServer
```shell
docker run -d --name rocketmq-nameserver --net=host apache/rocketmq:4.9.4 ./mqnamesrv
```

## 启动 Broker
```shell
docker run -d --name rocketmq-broker --net=host \
-v /root/rocketmq/broker.conf:/home/rocketmq/rocketmq-4.9.4/conf/broker.conf \
-v /root/rocketmq/plain_acl.yml:/home/rocketmq/rocketmq-4.9.4/conf/plain_acl.yml \
apache/rocketmq:4.9.4 ./mqbroker -n localhost:9876 -c ../conf/broker.conf
```

* broker.conf 文件内容为镜像内部默认内容，再在最后一行加上一行 brokerIP1=127.0.0.2 来指定 broker 服务地址
* plain_acl.yml 文件内容为镜像内部默认内容


## 启动 Dashboard
```shell
docker run -d --name rocketmq-dashboard -e "JAVA_OPTS=-Drocketmq.namesrv.addr=localhost:9876" -p 8080:8080 apacherocketmq/rocketmq-dashboard:1.0.0
```

## 删除 Dashboard 、 Broker 、 NameServer
```shell
docker rm -f rocketmq-dashboard rocketmq-broker rocketmq-nameserver
```
