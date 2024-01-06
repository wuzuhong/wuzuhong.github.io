function getBlog(){
	return blog = {"content": "# 【Vitess】通过http请求对vitess中的所有资源对象进行增删改查\n## 为什么需要通过http请求对vitess进行操作？\n通过查看vitess的文档发现，文档中只提供了命令行（vtctl）中操作的方式来对其资源对象进行增删改查，但是在实际应用场景中我们需要在界面上通过发起http请求来对其进行增删改查，但是文档中并没有提及相关的http接口。\n\n## 如何发现vitess是可以通过http请求进行操作的？\n通过查看vitess的源码，发现其中的api.go文件中提供了http接口，并结合其自带的vtctld界面中发起的请求就可以得出它是支持http请求的。\n\n## 如何通过http请求对vitess进行操作？\n从源码中可以看到vitess其实是提供了restful的接口的，但是由于这类接口不全，因此不考虑使用。通过实际测试检验得出，可以将vtctl中的所有命令都转换成http请求来调用。vtctl中的所有命令的用法参考 https://vitess.io/docs/reference/vtctl/。下面举两个例子：  \n### 例1\n如果vtctl命令为：\n```\nCreateKeyspace -sharding_column_name=id_ -sharding_column_type=UINT64 -force=false test\n```\n，那么转化为http请求就是：\n```\n# url 为（其中的ip为vtctld的ip，port为vtctld的15000端口，并且必须以 / 结尾）：\nhttp://[ip]:[port]/api/vtctl/\n# body 为：\n[\n    \"CreateKeyspace\",\n    \"-sharding_column_name=id_\",\n    \"-sharding_column_type=UINT64\",\n    \"-force=false\",\n    \"test\"\n]\n```\n### 例2\n如果vtctl命令为：\n```\nGetKeyspace test\n```\n，那么转化为http请求就是：\n```\n# url 为（其中的ip为vtctld的ip，port为vtctld的15000端口，并且必须以 / 结尾）：\nhttp://[ip]:[port]/api/vtctl/\n# body 为：\n[\n    \"GetKeyspace\",\n    \"test\"\n]\n```", "title": "【Vitess】通过http请求对vitess中的所有资源对象进行增删改查"}
}