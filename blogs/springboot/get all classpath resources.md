# 【springboot】使用Spring来加载工程下所有jar包下的指定资源
一个工程可能会依赖多个jar，jar里面又可能以来多个子jar，这些jar下可能存在相同的文件，如果我们想获取出所有的这些文件，可以使用`PathMatchingResourcePatternResolver`对象来实现。这里会涉及到两个概念：
* classpath：只会到自己工程的class路径中查找找文件
* classpath*：不仅包含class路径，还包括jar文件中的class路径进行查找
#### 依赖
```xml
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-core</artifactId>
  <version>5.0.7.RELEASE</version>
</dependency>
```
#### 示例
```java
PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
// 注意这里的classpath*，其代表：不仅包含class路径，还包括jar文件中的class路径进行查找
Resource[] resources = resolver.getResources("classpath*:aa.properties");
```
