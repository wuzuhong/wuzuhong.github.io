# 【微服务—kong】负载均衡及健康检查
## 负载均衡
kong内置的负载均衡器使用了加权轮询算法。
upstream中有一个slots字段，默认值为10000，slots必须大于target的数量乘以100，并且必须大于所有target的weight之和。
target中的有一个weight字段，默认值为100，可以将weight占slots的比重粗略视为当前target的权重，weight越大，权重也就越高，当weigth等于0的时候，这个target将不会参与负载均衡过程，也就是说所有请求都不会被代理到当前target中。

## 健康检查
kong提供两种健康检查方式，消极的健康检查和积极的健康检查
* 消极的健康检查：也就是熔断器，当错误次数达到瓶颈时，kong会将当前target标记为不健康的状态，之后负载均衡器将会跳过这个target，也就是说所有请求都不会被代理到当前target中，如果在未来的某个时间，当前target的问题被修复了，kong不会自动将它标记为健康的状态，而是需要kong管理员手动调用接口（POST upstreams/my_upstream/targets/1.2.3.4:1234/healthy）来将这个target的状态改为健康
* 积极的健康检查：kong会不停的向target所指向的后端服务器发送心跳，来探测当前target是否健康，当错误次数达到瓶颈时，kong会将当前target标记为不健康的状态，当达到正常次数后，kong也会自动将当前target标记为健康的状态

### 开启健康检查
可以通过修改upstream中的healthchecks字段下的的默认值来开启健康检查
#### 开启积极的健康检查需要指定的字段
```
# 被视为探测失败的状态码
healthchecks.active.unhealthy.http_statuses
# 被视为不健康的http探测失败次数瓶颈
healthchecks.active.unhealthy.http_failures
# 被视为不健康的tcp探测失败次数瓶颈
healthchecks.active.unhealthy.tcp_failures
# 对不健康的target发送探测心跳的时间间隔
healthchecks.active.unhealthy.interval
# 对不健康的target发送探测心跳的超时时间，若超时，则表示当前不健康的target还是不健康的
healthchecks.active.unhealthy.timeouts
# 被视为探测成功的状态码
healthchecks.active.healthy.http_statuses
# 对健康的target发送探测心跳的时间间隔
healthchecks.active.healthy.interval
# 被视为健康的探测成功次数瓶颈
healthchecks.active.healthy.successes
# 同时进行探测的target数量
healthchecks.active.concurrency
# 用于探测的target路径
healthchecks.active.http_path
# 发送探测请求的超时时间
healthchecks.active.timeout
```

#### 开启消极的健康检查需要指定的字段
```
# 被视为请求成功的状态码
healthchecks.passive.healthy.http_statuses
# 被视为健康的请求成功次数瓶颈
healthchecks.passive.healthy.successes
# 被视为请求失败的状态码
healthchecks.passive.unhealthy.http_statuses
# 被视为不健康的http请求失败次数瓶颈
healthchecks.passive.unhealthy.http_failures
# 被视为不健康的tcp请求失败次数瓶颈
healthchecks.passive.unhealthy.tcp_failures
# 请求的超时时间，若超时，则表示当前请求也是失败的
healthchecks.passive.unhealthy.timeouts
```

#### 对于消极的健康检查和开启积极的健康检查，可以只开启其中一个，也可以同时开启，同时开启的话，消极的健康检查主要用于判定一个target是否健康，并将不健康的target的状态改为不健康，而积极的健康检查主要用于去探测一个不健康的target是否健康，并将已经恢复健康的target的状态改为健康。

### 关闭健康检查
默认情况下，健康检查就是关闭的。若想关闭那些已经开启健康检查的upstream，那么进行以下操作
#### 关闭积极的健康检查
将upstream的healthchecks字段下的healthchecks.active.healthy.interval和healthchecks.active.unhealthy.interval这两个的值设为0即可

#### 关闭消极的健康检查
将upstream的healthchecks字段的healthchecks.passive下面的所有跟计数相关的，也就是数字类型的值都设为0即可

### 注意：健康检查在数据库中必须要有默认值，不能为null，不然会导致其内部的负载均衡器出问题，进而会出现反向代理报错的情况