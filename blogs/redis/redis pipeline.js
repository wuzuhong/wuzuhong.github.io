function getBlog(){
	return blog = {"content": "# 【Redis-5.0】管道\n当我们使用客户端对 Redis 进行一次操作时，客户端将请求传送给服务器，服务器处理完毕后，再将响应回复给客户端，这要花费一个网络数据包来回的时间。如果连续执行多条指令，那就会花费多个网络数据包来回的时间。\n\n回到客户端代码层面，客户端是经历了写-读-写-读四个操作才完整地执行了两条指令。现在如果我们调整读写顺序，改成写—写-读-读，这两个指令同样可以正常完成。两个连续的写操作和两个连续的读操作总共只会花费一次网络来回，就好比连续的 write\n操作合并了，连续的 read 操作也合并了一样。**这便是管道操作的本质**，服务器根本没有任何区别对待，还是收到一条消息，执行一条消息，回复一条消息的正常流程。客户端通过对管道中的指令列表改变读写顺序就可以大幅节省 IO 时间。管道中指令越多，效果越好。\n\n**简而言之**，Redis 管道支持在一次请求中发送多条命令，并在一次响应中获取到这些命令的结果。这些命令是按照先进先出的顺序执行和返回结果的，也就是说这些命令是按顺序执行的。并且允许出现异常，也就是说如果中间有某个命令出现异常，不影响其他正常命令的执行。\n\n某些管道的应用场景也可通过 Redis 脚本得到更高效的处理，后者在服务器端执行大量工作。脚本的一大优势是可通过最小的延迟读写数据，让读、计算、写等操作变得非常快。\n\n如果是组织大量的、无依赖关系的命令，可以选择管道，当然也可以选择脚本。如果命令之间有依赖关系，比如后续的命令需要处理先前命令的返回值，只能选择脚本。", "title": "【Redis-5.0】管道"}
}