# 【springboot】整合swagger

使用 springdoc 来实现 swagger 。

## 在pom.xml中添加springdoc的maven依赖
```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.3.0</version>
</dependency>
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-api</artifactId>
  <version>2.3.0</version>
</dependency>
```

## 在application.properties中添加springdoc的配置
```properties
# 可视化界面的访问路径
springdoc.swagger-ui.path=/swagger-ui.html
# 是否开启可视化界面访问路径
springdoc.swagger-ui.enabled=true
# swagger数据的访问路径
springdoc.api-docs.path=/v3/api-docs
# 是否开启swagger数据访问路径
springdoc.api-docs.enabled=true
# 扫描包路径，多个之间以都好分隔
springdoc.packages-to-scan=
# 不需要扫描的包路径，多个之间以都好分隔
springdoc.packages-to-exclude=
# 是否启用swagger数据缓存
springdoc.cache.disabled=false
```

需要注意：官方提供的`springdoc.swagger-ui.configUrl`配置项不能写到工程的配置文件中，否则会导致swagger-ui界面显示的不是本地的swagger数据，而是显示示例数据。

## springdoc 中的 swagger 注解
* @Tag ：放在Controller类上，用于说明当前接口分类类或当前接口所属模块。
* @Parameter ：放在接口方法的入参字段上，用于说明当前接口的请求参数。
* @Schema ：放在实体类或字段上，用于说明当前接口的请求体或响应体。
* @Operation ：放在接口方法体上，用于说明当前接口。
* @ApiResponse ：放在Controller类上或接口方法体上，用于说明当前接口的响应状态码。

## 最后启动服务器并访问 http://localhost:8080/swagger-ui.html 即可看到生成的swagger可视化界面，访问 http://localhost:8080/v3/api-docs 即可看到生成的swagger的json数据。