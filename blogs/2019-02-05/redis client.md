# 【Redis-5.0】客户端使用方式
一般使用jedis作为redis的客户端。

## 依赖
```xml
<dependency>
  <groupId>redis.clients</groupId>
  <artifactId>jedis</artifactId>
  <version>3.2.0</version>
</dependency>
```

## 示例
```java
// 配置连接池
JedisPoolConfig poolConfig = new JedisPoolConfig();
// 创建连接池
JedisPool jedisPool = new JedisPool(poolConfig, "127.0.0.1", 6379);
// 因为Jedis对象实现了Closeable接口，所以jedis实例会在try代码块执行完成后自动关闭。这个将try-with-resource语法，是Java7引入的
try (Jedis jedis = jedisPool.getResource()) {
  jedis.set("xxKey", "xxValue");
  // 调用更多的函数，都是和redis的命令对应的，所以可以通过查看redis的命令说明来了解这些函数的意义：http://www.redis.cn/commands.html
  // ......
}
// 在应用关闭的同时关闭连接池
jedisPool.close();
```
以上`JedisPoolConfig`值得注意，它为我们的连接池提供了一些默认配置，包括：
* testWhileIdle=true：是否在连接空闲时进行可用性校验，校验不通过会销毁当前连接，默认为true，用于保证连接的可用性
* testOnCreate=false：是否在连接创建时进行可用性校验，校验不通过会销毁当前连接，默认为false，用于提高效率，因为在运行时也可能会创建连接
* testOnBorrow=false：是否在从连接池中获取连接时进行可用性校验，校验不通过会销毁当前连接，默认为false，用于提高效率
* testOnReturn=false：是否在向连接池归还连接时进行可用性校验，校验不通过会销毁当前连接，默认为false，用于提高效率
* maxTotal=8：连接池中的最大总数，默认为8
* maxIdle=8：连接池中的最大空闲数，默认为8
* minIdle=0：连接池中的最小空闲数，默认为0

## 关于序列化
通常会将一些java对象存到redis中，例如mybatis的二级缓存，这时我们必须将对象序列化成字节数组，而不能通过fastjson将其转为字符串。这是因为如果把对象转为字符串存进去后，在取出来的时候将会丢失原有对象的特性，是无法再将字符串转为具体对象的（因为可能会存入很多种类型的对象，在取出来的时候已经不知道它是属于哪个对象了）。但如果我们是通过序列化的方式将其序列化成字节数组，这个问题将不会存在，因为在序列化与反序列过程中，对象的特性不会被丢失，所以我们可以直接使用Object来接收，这个Object的具体类型就是我们存进去的类型，在之后的操作中是可以被强转的。

#### 序列化与反序列化的代码
```java
public static byte[] serialize(Object object) {
  ObjectOutputStream oos = null;
  ByteArrayOutputStream baos = null;
  try {
    baos = new ByteArrayOutputStream();
    oos = new ObjectOutputStream(baos);
    oos.writeObject(object);
    byte[] bytes = baos.toByteArray();
    return bytes;
  } catch (Exception e) {
  }
}
public static Object unserialize(byte[] bytes) {
  if (bytes == null) {
    return null;
  }
  ByteArrayInputStream bais = null;
  try {
    bais = new ByteArrayInputStream(bytes);
    ObjectInputStream ois = new ObjectInputStream(bais);
    return ois.readObject();
  } catch (Exception e) {
  }
}
```
