function getBlog(){
	return blog = {"content": "# 【kubernetes】基于Kubernetes的PaaS概述\n\n![持续部署](./images/kubernetes-cd.jpg)\n若以上这幅图的所有步骤能够全程自动化进行，那么就是持续部署了（CD）\n\n在生产环境中部署一个kubernetes集群，可以部署在物理机上、虚拟机上、公有云上、私有云上。\n\n开发 PaaS 平台需要先由网络工程师去部署好网络环境，再由存储工程师去部署好存储环境，然后就可以开始部署kubernetes集群，之后还需要一个镜像仓库，然后还需要额外的监控系统和日志系统，之后还需要外部的负载均衡器，还需要依赖仓库，还需要自动化构建工具和自动化发布工具。\n\n![PaaS](./images/kubernetes-paas.jpg)\n\n若以上所有组件都有了，那么合起来就是 PaaS 平台。", "title": "【kubernetes】基于Kubernetes的PaaS概述"}
}