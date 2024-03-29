# 【SkyWalking】基本概念
SkyWalking 是一个开源的可观测平台，用于从服务和云原生基础设施收集、分析、聚合及可视化数据。SkyWalking 也是一个现代化的应用程序性能监控（Application Performance Monitoring，APM）系统。

## 基本概念
* 服务：对请求提供相同行为的一组工作负载。相当于是一个微服务。
* 服务实例：一组工作负载中的每一个工作负载称为一个实例。相当于是一个微服务中的一个部署节点。
* 端点：对于特定服务所接收的请求路径，如 HTTP 的 URI 路径和 gRPC 服务的类名 + 方法名。

## 基本构件
* 探针：收集数据，并将数据格式化为 SkyWalking 适用的格式。在Java中就是一个基于字节码增强技术实现的jar包。
* 平台后端：数据聚合、数据分析以及驱动数据流从探针到UI。
* 存储：通过开放的插件化的接口存放 SkyWalking 数据，支持 ElasticSearch 、 H2 或 MySQL 。
* UI：一个基于接口高度定制化的Web管控系统，可以查看和管理 SkyWalking 数据。

使用 SkyWalking 时，用户可以看到服务与端点、端点与端点之间的拓扑结构以及每个服务、每个服务实例和每个端点的性能指标，可以实现全链路日志追踪。