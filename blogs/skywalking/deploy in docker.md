# 【搜索引擎-SkyWalking】使用 Docker 来部署

## 部署服务端
* 镜像版本：`apache/skywalking-oap-server:9.2.0`
* 环境变量：
```properties
# 使用 ElasticSearch 来存储数据
SW_STORAGE=elasticsearch
# ElasticSearch 的访问地址
SW_STORAGE_ES_CLUSTER_NODES=127.0.0.1:9200
```
* 暴露端口：`11800`（gRPC）和`12800`（HTTP）

注意：以上使用的 ElasticSearch 的版本号为 7.x。

## 部署UI前端
* 镜像版本：`apache/skywalking-ui:9.2.0`
* 环境变量：
```properties
# 服务端地址
SW_OAP_ADDRESS=http://127.0.0.1:12800
```
* 暴露端口：`8080`

可以通过`http://127.0.0.1:8080`访问UI前端。