# 【graphql】概述
## 概述

## 在springboot应用中集成graphql

## 在非springboot应用中集成graphql
### 添加相关依赖
```
<!-- graphql核心依赖 -->
<dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphql-java</artifactId>
    <version>12.0</version>
</dependency>
<!-- graphql入口依赖，能够提供schema文档查询以及执行graphql查询语句并返回结果。
    但是，这个入口是定死的，就只能是/graphql，若想自定义入口路径，则需要拷贝这个依赖的源码，https://github.com/graphql-java/graphql-java-spring/tree/v1.0/graphql-java-spring-webmvc，把其中的src/main/java/graphql/spring/web/servlet/目录下的所有拷贝到项目中并修改代码中的包名，然后修改其中controller的路径即可，最后就可以把当前依赖去掉了 -->
<dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphql-java-spring-webmvc</artifactId>
    <version>1.0</version>
</dependency>
```

### 添加一个注解扫描包路径
* 若是添加的依赖，则该路径为graphql.spring.web.servlet
* 若是拷贝的代码，则是你拷贝的目标包名