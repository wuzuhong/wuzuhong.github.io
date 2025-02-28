# 【消息中间件-Kafka】认证权限控制（ SASL/PLAIN + SSL ）

## 生成证书

注意：生成证书时的jdk版本要与Broker、Client运行时的jdk版本一致，否则会导致证书格式不匹配的问题。

* Keystore：包含经过CA签名的自己的证书，用于提供给他人。
* Truststore：包含CA证书（公钥），用于验证他人的证书。

#### 生成CA证书，包括CA私钥（ca-key）、CA证书（ca-cert）
```bash
openssl req -new -x509 -keyout ca-key -out ca-cert -days 365
```
#### 生成 Broker 的 Keystore
```bash
keytool -keystore server.keystore.jks -alias localhost -validity 365 -genkey -keyalg RSA -storepass test123 -keypass test123
```
#### 签名 Broker 的 Keystore
```bash
# 生成证书签名请求CSR
keytool -keystore server.keystore.jks -alias localhost -certreq -file server-cert-file
# 用CA签名CSR，并输出签名后的Broker证书
openssl x509 -req -CA ca-cert -CAkey ca-key -in server-cert-file -out server-cert-signed -days 365 -CAcreateserial
# 导入CA证书到Broker的Keystore
keytool -keystore server.keystore.jks -alias CA -import -file ca-cert
# 导入签名后的Broker证书
keytool -keystore server.keystore.jks -alias localhost -import -file server-cert-signed
```
#### 生成 Broker 的 Truststore
```bash
keytool -keystore server.truststore.jks -alias CARoot -import -file ca-cert
```
#### 生成 Client 的 Keystore
```bash
keytool -keystore client.keystore.jks -alias localhost -validity 365 -genkey -keyalg RSA -storepass test123 -keypass test123
```
#### 签名 Client 的 Keystore
```bash
# 生成证书签名请求CSR
keytool -keystore client.keystore.jks -alias localhost -certreq -file client-cert-file
# 用CA签名CSR，并输出签名后的Client证书
openssl x509 -req -CA ca-cert -CAkey ca-key -in client-cert-file -out client-cert-signed -days 365 -CAcreateserial
# 导入CA证书到Client的Keystore
keytool -keystore client.keystore.jks -alias CA -import -file ca-cert
# 导入签名后的Client证书
keytool -keystore client.keystore.jks -alias localhost -import -file client-cert-signed
```
#### 生成 Client 的 Truststore
```bash
keytool -keystore client.truststore.jks -alias CARoot -import -file ca-cert
```

## 在 Broker 中开启权限控制（ SASL/PLAIN + SSL ）
* 在`config/kraft/server.properties`配置文件中添加以下配置：
```properties
# 监听SASL_SSL协议
listeners=SASL_SSL://:9092
# 启用SSL加密
ssl.keystore.location=/path/to/server.keystore.jks
ssl.keystore.password=test123
ssl.key.password=test123
ssl.truststore.location=/path/to/server.truststore.jks
ssl.truststore.password=test123
ssl.client.auth=required
# 启用SASL/PLAIN认证
inter.broker.listener.name=SASL_SSL
sasl.mechanism.inter.broker.protocol=PLAIN
sasl.enabled.mechanisms=PLAIN
```
* 创建`kafka_server_jaas.conf`文件，文件内容如下。其中`username`和`password`是用于在集群模式下 Broker 之间的通信。`user_xx`是用于 Broker 与客户端之间的通信，比如`user_demo="demo-secret"`代表用户名为`demo`、秘钥为`demo-secret`：
```
KafkaServer {
    org.apache.kafka.common.security.plain.PlainLoginModule required
    username="admin"
    password="admin-secret"
    user_admin="admin-secret"
    user_alice="alice-secret";
};
```
* 启动 Broker（3.6.2）：
```bash
# 生成集群ID
bin/windows/kafka-storage.bat format -t EpPlSoxkQG6zltzYh0594g -c config/kraft/server.properties
# 添加KAFKA_OPTS环境变量
$env:KAFKA_OPTS="-Djava.security.auth.login.config=/path/to/kafka_server_jaas.conf"
# 启动Broker
bin/windows/kafka-server-start.bat config/kraft/server.properties
```

## 在客户端中开启权限控制（ SASL/PLAIN + SSL ）
```
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
# SASL/PLAIN认证配置
sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required username="xx" password="xx";
# SSL加密配置
ssl.truststore.location=/path/to/client.truststore.jks
ssl.truststore.password=test123
ssl.keystore.location=/path/to/client.keystore.jks
ssl.keystore.password=test123
ssl.key.password=test123
# 设置不需要验证主机名
ssl.endpoint.identification.algorithm=
```