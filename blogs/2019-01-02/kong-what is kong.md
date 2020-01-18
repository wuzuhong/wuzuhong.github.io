# 【微服务—kong】kong是什么
## 概述
* kong是运行在Nginx中的lua应用程序，而这完全是因为lua-nginx-module才能得以实现，lua-nginx-module能够将lua的功能嵌入到Nginx服务器中，但kong并不是使用lua-nginx-module来编译Nginx的，kong是与OpenResty一起发布，OpenResty中已经包含了lua-nginx-module，OpenResty是通过许多的模块来集成Nginx的所有特性，因此kong也具备Nginx的所有特性，例如：高并发、资源消耗小、反向代理、可靠性高。
* kong支持通过lua语言编写自定义插件，这些插件可以在运行时被执行，也可以注入到整个请求周期，在请求的各个阶段执行我们自己的逻辑，并且可以在运行时禁用或开启指定插件。kong提供的可插拔式插件机制给了我们无限的想象空间，我们可以利用这个机制，编写自己的逻辑来实现诸如请求权限校验、请求状态监控等等一系列关于请求调用中需要有的功能，当然也可能是其他方面的功能。正因为如此，kong可以作为我们的微服务架构中的核心组件，因为它可以提供微服务架构中几乎所有的功能。

## 核心对象
kong定义了一系列对象，用于请求转发，也可以称之为反向代理，这些对象都会被存储在PostgreSQL数据库中，可以通过restful api对其进行增删改查操作，具体api请查看官方文档： https://docs.konghq.com/1.0.x/admin-api/
* upstream ：集群，对集群的定义，包括集群名称、健康检查策略、负载均衡策略的定义，注意这里的健康检查策略在数据库中必须要有默认值，不能为null，不然会导致其内部的负载均衡器出问题，进而出现反向代理报错的情况。
* target ：集群中的节点，集群中所有的ip地址，也可以是dns，可以有一个或多个
* service ：服务，对应一个微服务应用，可以定义应用的名称、请求重试次数、协议、域名、端口、上下文、超时时间
* route ：路由，对应微服务应用中一条api，可以定义api的名称、请求方式、请求路径等等，每个route都会对应一个service
* plugin ：插件，插件可以作用在route或service上

## 启动kong
### 先启动PostgreSQL数据库
```
docker run -d --name kong-database \
-p 5433:5432 \
-e "POSTGRES_USER=kong" \
-e "POSTGRES_DB=kong" \
-v /root/data/postgresdb:/var/lib/postgresql/data \
postgres:9.6
```

### 然后使用kong去初始化PostgreSQL数据库，用于创建kong所需要的数据库表
```
docker run --rm \
--link kong-database \
-e "KONG_DATABASE=postgres" \
-e "KONG_PG_HOST=kong-database" \
kong:1.0.0 kong migrations bootstrap
```
如果想让kong在启动的时候自动初始化，则需要修改kong的Dockerfile，将其中的CMD修改为
```
CMD nohup sh -c 'kong migrations bootstrap && kong start'
```
即可实现，然后当前步骤就不再需要执行了，直接执行启动kong步骤即可。

### 最后启动kong
```
docker run -d --name kong \
--link=kong-database \
-e "KONG_DATABASE=postgres" \
-e "KONG_PG_HOST=kong-database" \
-e "KONG_PROXY_ERROR_LOG=/dev/stderr" \
-e "KONG_ADMIN_LISTEN=0.0.0.0:8001, 0.0.0.0:8444 ssl" \
-p 8000:8000 \
-p 8443:8443 \
-p 8001:8001 \
-p 8444:8444 \
kong:1.0.0
```

### 验证是否启动成功
访问 8001 端口下的 /status 接口，返回200，则启动成功。