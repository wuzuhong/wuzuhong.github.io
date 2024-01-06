# 【Vitess】数据传输安全模型
Vitess暴露了一些RPC服务，并且在内部也使用RPC。这些RPC可以使用安全传输选项。本文将解释如何使用这些特性。
## 概览
下图表示我们在Vitess集群中使用的所有rpc：

![](./images/vitesstransportsecuritymodel.svg)

主要有两类：
* 内部rpc：用于连接Vitess组件。
* 外部可见的rpc：应用程序使用它们与Vitess进行交互。

Vitess生态系统中的一些特性依赖于身份验证，比如调用者ID和数据库表ACLs。我们将首先研究调用者ID功能。

所使用的加密和身份验证方案取决于所使用的传输方式。使用gRPC（Vitess的默认值），TLS可以用于保护内部和外部rpc。我们将详细说明这些选项。

## 调用者ID
调用者ID是Vitess堆栈提供的一个特性，用于标识查询源。有两个不同的调用者id类型：
* Immediate类型的调用者ID：表示进入Vitess端时的安全客户端标识
  * 它是一个字符串，表示连接到Vitess (vtgate)的用户。
  * 它由使用的传输层进行身份验证。
  * 它用于Vitess的TableACL特性。
* Effective类型的调用者ID：它提供了关于各个调用者进程的详细信息
  * 它包含关于调用者的更多信息：主体、组件、子组件。
  * 它是由应用层所提供。
  * 它没有经过验证。
  * 例如，它在查询日志中被暴露，以便能够调试慢速查询的源头。

## gRPC传输
### gRPC加密传输
当使用gRPC传输时，Vitess可以使用通常的TLS安全特性（熟悉SSL/TLS在这里很重要）：
* 任何Vitess服务器都可以使用以下命令行参数来配置TLS
  * <code>grpc_cert, grpc_key</code>：服务器要使用的证书和秘钥。
  * <code>grpc_ca</code>（可选）：客户证书链信任。如果指定，客户端必须在提供的文件中使用由一个ca签名的证书。
* Vitess的go客户端可以配置对称参数来启用TLS：
  * <code>..._grpc_ca</code>：被信任的服务器证书签名者列表。
  * <code>..._grpc_server_name</code>：被信任的服务器证书的名称，而不是用于连接的主机名。
  * <code>..._grpc_cert, ..._grpc_key</code>：客户端证书和要使用的密钥(当服务器需要客户端身份验证时)
* 其他客户端可以采用类似的参数，有很多种方式，具体请查看每个客户端以获取更多信息。

有了这些选项，就可以对系统的所有部分使用tls安全连接。这使服务端能够对客户端进行身份验证，客户端也能够对服务端进行身份验证。

注意，这在默认情况下是不启用的，因为通常不同的Vitess服务器将运行在私有网络上(例如，在云环境中，通常所有本地流量都已经通过VPN得到了保护)。

### 证书和调用者ID
此外，如果客户端使用证书连接到Vitess (vtgate)，该证书的名称将作为Immediate类型的调用者ID传递给vttablet。然后，数据库表的acl可以使用它来授予对单个表的读、写或管理的权限。如果不同的客户端访问Vitess表的权限不同，则应使用此选项。

在不需要SSL安全性的私有网络中，使用表acl作为安全机制来防止用户访问敏感数据仍然是可取的。为此，gRPC连接器提供了<code>grpc_use_effective_callerid</code>参数：如果在运行vtgate时指定了该参数，Effective类型的调用者ID的主体复制到Immediate类型的调用者ID中，然后在整个Vitess堆栈中使用。

主要的是：这是不安全的，任何的用户代码都可以为Effective类型的调用者ID提供任何值，因此可以访问任何数据。这是一个安全特性，目的是确保某些应用程序不会有不当行为。因此，默认情况下不启用此参数。

举一个正确的例子，请查看源代码中的<code>test/encrypted_transport.py</code>文件。这个文件中首先设置了所有的证书以及一些数据库表的ACLs，然后使用python客户端进行SSL连接。这个文件也对<code>grpc_use_effective_callerid</code>参数进行了实践，不使用SSL进行连接。

## MySQL传输
要获得支持SSL/TLS的<code>vtgate</code>，请使用<code>-mysql_server_ssl_cert</code>和<code>-mysql_server_ssl_key</code>参数。

需要客户端证书请使用<code>-mysql_server_ssl_ca</code>参数。如果没有指定ca，那么TLS是可选的。