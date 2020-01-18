function getBlog(){
	return blog = {"content": "# 【微服务—springcloud】Eureka的集群配置\n* 在每台Eureka注册中心的application.yaml文件中的defaultZone设置为http://+其他两台Eureka注册中心的域名+其端口+/eureka/，域名之间用逗号隔开。\n* 在Eureka client的application.yaml文件中的defaultZone设置为三台Eureka注册中心的域名+其端口+/eureka/，域名之间用逗号隔开。\n* 在浏览器中用域名来访问Eureka注册中心，三个注册中心都可以访问，显示的微服务都是一样的。", "title": "【微服务—springcloud】Eureka的集群配置"}
}