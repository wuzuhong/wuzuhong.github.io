# 【Vitess】通过http请求对vitess中的所有资源对象进行增删改查
## 为什么需要通过http请求对vitess进行操作？
通过查看vitess的文档发现，文档中只提供了命令行（vtctl）中操作的方式来对其资源对象进行增删改查，但是在实际应用场景中我们需要在界面上通过发起http请求来对其进行增删改查，但是文档中并没有提及相关的http接口。

## 如何发现vitess是可以通过http请求进行操作的？
通过查看vitess的源码，发现其中的api.go文件中提供了http接口，并结合其自带的vtctld界面中发起的请求就可以得出它是支持http请求的。

## 如何通过http请求对vitess进行操作？
从源码中可以看到vitess其实是提供了restful的接口的，但是由于这类接口不全，因此不考虑使用。通过实际测试检验得出，可以将vtctl中的所有命令都转换成http请求来调用。vtctl中的所有命令的用法参考 https://vitess.io/docs/reference/vtctl/。下面举两个例子：  
### 例1
如果vtctl命令为：
```
CreateKeyspace -sharding_column_name=id_ -sharding_column_type=UINT64 -force=false test
```
，那么转化为http请求就是：
```
# url 为（其中的ip为vtctld的ip，port为vtctld的15000端口，并且必须以 / 结尾）：
http://[ip]:[port]/api/vtctl/
# body 为：
[
    "CreateKeyspace",
    "-sharding_column_name=id_",
    "-sharding_column_type=UINT64",
    "-force=false",
    "test"
]
```
### 例2
如果vtctl命令为：
```
GetKeyspace test
```
，那么转化为http请求就是：
```
# url 为（其中的ip为vtctld的ip，port为vtctld的15000端口，并且必须以 / 结尾）：
http://[ip]:[port]/api/vtctl/
# body 为：
[
    "GetKeyspace",
    "test"
]
```