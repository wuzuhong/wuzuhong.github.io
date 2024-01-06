# 【kubernetes】Devops核心要点及kubernetes架构概述

## 容器编排技术之docker三剑客（docker compose、docker swarm、docker machine）
* docker compose 适用于一台docker宿主机的docker容器编排。
* docker swarm 能将多台docker宿主机的资源整合起来，成为一个资源池，然后docker compose就只需要对docker swarm整合出来的资源池进行编排就行了。
* docker machine能够将一台主机快速的初始化为docker宿主机，从而使这台主机能够满足加入docker swarm集群的条件，从而成为docker swarm中的一份子。

## 持续集成（Continuous Integration，CI）、持续交付（Continuous Delivery，CD）、持续部署（Continuous Deployment，CD）
* 持续集成（Continuous Integration，CI）：将代码提交到git仓库（github或gitlab），自动化构建工具（jekins或gitlab ci）能探测到本次提交，并执行自动构建操作（打成war包，若是使用 maven clean install -U命令打包，则会先执行单元测试，打成war包后就可以打成docker镜像），然后再被测试工具自动部署到测试环境中进行测试，执行其他各种测试。在这个过程中，任何一个步骤出现了错误，都将停止后面的操作，并将错误报告给开发者，开发者重新修改代码，然后再提交代码，自动重复构建和测试步骤。
* 持续交付（Continuous Delivery，CD）：当持续集成完成构建后，生成的文件能够自动交付给运维人员。
* 持续部署（Continuous Deployment，CD）：当持续交付完成后，不需要运维人员手动操作，而是自动进行部署。
  
所以，如果持续集成、持续交付和持续部署都实现了的话，那么当开发人员手动提交代码后，测试、打包、打成镜像、部署等过程都是全自动的。

## DevOps文化
它是一种重视“软件开发人员（Dev）”和“IT运维技术人员（Ops）”之间沟通合作的文化或惯例。透过自动化“软件交付”和“架构变更”的流程，来使得构建、测试、发布软件能够更加地快捷、频繁和可靠。

## 容器编排技术出现的原因
docker容器化技术使得我们构建出来的应用程序镜像是与平台（centos、ubuntu、windows）无关的，就不会出现类似于在centos上可以运行，而在ubuntu上却有问题的情况。
但是当我们宿主机上的docker容器越来越多的时候，尤其是微服务技术的发展，使得我们可能会启动上百个容器来运行我们的微服务，这时我们就难以处理这些容器之间的依赖关系，出现故障，我们也难以定位问题。这个时候就需要容器编排技术。容器编排技术除了docker三剑客以外，还有一个叫kubernetes的技术，这个技术占据的容器编排技术80%的市场，这足以证明它的能力。

## kubernetes技术特点

* 自动装箱：基于资源依赖及其他约束能够自动完成容器的部署，而且不影响其可用性。
* 自我修复：由于容器的轻量的特点，可以在几秒内启动，因此若一个容器崩溃了，它会把这个容器杀死，然后重新启动一个，以此来完成修复。
* 水平扩展：可以不断启动容器，一个不够再来一个，只要物理资源允许。
* 服务发现和负载均衡：微服务之间的服务发现以及负载均衡。
* 自动发布和回滚。
* 密钥和配置管理。
* 存储编排。
* 批量处理执行。

## kubernetes系统架构及其相关概念
* kubernetes是一个集群，它能组合多台主机的资源，并统一对外提供计算、存储等能力，前提是这些主机需要安装kubernetes相关的程序。
* kubernetes是基于master/node模型的，也就是有一组节点作为master节点（主节点），一般不需要太多，能够做到高可用，一般是1~3个就够了；另外一组是node节点，也称为worker节点（工作节点），用于提供计算、存储等能力的节点，也就是运行容器的节点，多多益善。
* 用户将创建启动容器的请求发送给master，master中有一个调度器（Scheduler）来分析各个node现有的可用资源的状态，并找到一个最佳适配运行用户容器的node，然后再由这个node来负责将这个容器启动起来（这个node会先找自己本地是否有启动这个容器的镜像，如果没有，则会去镜像仓库中将这个镜像pull下来，然后再启动，因此在kubernetes cluster中是没有托管镜像的）。
* kubernetes的master上有一个组件叫做API Server，API Server是负责接收请求、解析请求、处理请求的；master上有一个组件叫做Scheduler（调度器），这个scheduler负责去观测每一个node之上总共可用的内存、CPU核心数，并根据用户请求创建容器所需资源的上限与node节点所拥有资源的下限进行评估，找出哪一个node最适合启动当前用户请求创建的容器，这通常分为两步：第一步是通过资源对比来筛选，第二步，若第一步筛选出来了多个node，这个时候需要使用优选算法来决定最终的node。master上有一个组件叫做Controller（控制器），用来监控node上容器的健康状态，若有容器不健康了，则直接杀死这个容器，另起一个，若node节点宕机了，controller会将这个node上的所有容器在其他node上重新启动；master上有一个组件叫做ControllerManager（控制器管理器），用于监控Controller的健康状态，在每一个master节点上都需要有一个ControllerManager。
* kubernetes的node上有一个组件叫kubelet（集群代理），用于与master通信，接收master调度的各种任务并执行；当然node上也有docker组件，用来启动容器；node上还有一个叫kube-proxy的组件，用于当service创建或改变了，将iptables规则进行更改。
* kubernetes的node上还有一个组件叫Pod，是kubernetes集群上运行的最小单元，也就是说kubernetes并不直接调度容器的运行，而是调度Pod，Pod可以理解为对容器做的一层抽象的封装，Pod里面放的就是容器，一个Pod中可以包含多个容器，这些容器共享同一个底层的网络名称空间，一般一个Pod放一个容器，除非有多个容器联系十分紧密，需要放在同一个Pod中。Pod运行在node中。但是在node之上是看不见Pod的，因为node运行的还是容器，只不过是在逻辑上我们把它称为为Pod。

## 使用标签来将pod进行分组
这里不能根据pod名称来分组，因为当一个pod不健康了，kubernetes会将其杀死，然后重新启动一个，这时候这个pod里面的东西和原来是一样的，但是名称和原来不一样了。这个时候需要使用标签（Label）的概念，标签是键值对格式的数据，每一个pod都会有一个标签来对pod的身份进行识别。在kubernetes的master上有一个组件叫Selector（标签选择器），用于根据标签来过滤符合条件的资源对象的机制。标签不光pod能有，很多其他资源都能有。kubernetes是基于restful api来对外提供服务的，因此用户所操作的目标都是对象，所有对象都可以拥有标签，都可以使用标签选择器来进行选择。

## Pod的分类
* 自主式Pod：该类pod由Api Server借助于调度器来调度至指定的node节点来启动此pod，若此pod中的某个容器出现故障了，只能由kubernetes来重启，若此pod所在的节点宕机了，则此pod就消失了，无法达到全局调度。
* 由控制器管理的Pod：该类pod由Api Server借助于调度器来调度至指定的node节点来启动后，控制器就会对该pod进行全局管理，使该pod随时处于可用状态。pod控制器有很多种，如：ReplicationController、ReplicaSet、Deployment、StatefulSet、DaemonSet、Job、Ctonjob。实际上在创建由控制器管理的pod的时候，我们不会单独创建Pod，而是创建Pod控制器。

## 服务发现
当由控制器管理Pod在某个node上不健康了，那么控制器会将该pod在另外一个node上重建，这个时候虽然pod中的资源没有变，但是pod已经发生了改变（例如：pod名称、ip地址，主机名等等都发生了改变），那么被控制器重建后的pod如何被客户端再次访问到呢？这个时候就需要用到服务发现。
kubernetes为每一组提供相同服务的pod和它们的客户端提供了一个中间层，叫做Service（服务），
只要Service不被删除，它的地址和名称就是固定的，而Service又是靠标签选择器来关联Pod对象的，Pod对象的标签是不会改变的，当pod被Service关联后，Service会动态探测这个Pod的ip和端口，并作为自己调度的后端可用服务器主机对象，因此客户端请求是发到Service的，然后由Service进行代理至后端Pod。
在kubernetes中，Service并不是程序，也不是实体组件，而是 iptables 的 DNAT 规则，创建一个DNAT规则，他可以使得所有到达某地址的请求都被Service地址转换成其他某个地址，Service地址并不是存在于网卡上，所以它是ping不通的，Service地址只出现在DNAT规则当中。Service对象有名称和ip地址，可以根据名称来解析出Service的ip地址，因此，在搭建kubernetes集群时，需要建一个DNS服务，用来解析Service的ip地址。kubernetes中的DNS服务能根据Service名称和ip地址的变动来自动的变动自身的Service记录的名称和ip地址。

## 通信方式
* 同一个pod内的多个容器间的通信方式：lo网络接口（lo是local的简写），一般指本地环回接口，就是本地通信。
* 各个pod间的通信方式：Overlay Network（叠加网络），就是pod与service之间的通信方式：

## 共享存储
所有master节点的数据都存储在etcd中，保存着整个集群的所有状态信息，所以需要把etcd做成高可用，一般至少有3个节点，etcd也是restful风格的。

## kubernetes集群类别
master集群、etcd集群、node集群，彼此之间使用http或https进行通信。

## 名称空间
名称空间是node上的一个组件，他是pod的管理边界，而不是网络边界，例如将开发环境的pod和正式环境的pod分成两个不同的名称空间，而这两个名称空间是可以互相通信的。

## kubernetes的网络类别
在kubernetes中有三种网络，node、service、pod分别有一个网段，node对应的网络叫节点网络，service对应的网络叫service网络或集群网络，pod对应的网络叫pod网络。所以当外部访问进来时，先进入节点网络，再被节点网络代理至集群网络，最后由集群网络代理至pod网络。
节点网络、service网络、pod网络在不同的网段上，所以相互之间不能直接通信。

![网络类别](./images/kubernetes-NetworkType.png "网络类别")

节点之间使用节点网络来通信；pod之间本来可以直接通信，但是这里借助一个service中间层，service通过DNAT将网络请求代理至pod，这样虽然降低了效率，但对管理来讲是非常有用的；service网络使用kube-proxy来进行管控和生成。
