# 【搜索引擎-Elasticsearch】使用 Docker 来部署
* 镜像版本：`elasticsearch:7.17.12`
* 环境变量：
```properties
# 开启用户认证
xpack.security.enabled=true
# 关闭geoip自动更新
ingest.geoip.downloader.enabled=false
# 单节点模式
discovery.type=single-node
```
* 暴露端口：`9200`（与外部通讯的端口，HTTP协议）和`9300`（节点之间通讯的端口，TCP协议）
* 挂载目录：`/usr/share/elasticsearch/data`
* 设置内置用户初始密码（挂载目录后，应用重启不再需要再次执行）：
```sh
# 进入容器
docker exec -it elasticsearch /bin/sh
# 执行设置内置用户初始密码
bin/elasticsearch-setup-passwords interactive
```
