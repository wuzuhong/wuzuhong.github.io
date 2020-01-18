# 【springboot】整合Redis
## 在pom.xml中添加redis的starter依赖
```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```
## 在全局配置文件中对redis进行配置
```
spring:
  redis:
    database: 1
    host: localhost
    port: 6379
    password: 123456
    timeout: 2000s
```
## 在主入口类中使用 @EnableCaching 注解来开启缓存
```
@SpringBootApplication
@EnableCaching
public class StudySpringbootApplication {

  public static void main(String[] args) {
    SpringApplication.run(StudySpringbootApplication.class, args);
  }

}
```
## 使用方式
```
@Autowired
private StringRedisTemplate srt;
@PostMapping("/test")
public void test() {
    srt.opsForValue().set("name","小明");
    String name = srt.opsForValue().get("name");
    System.out.println(name);
}
```
StringRedisTemplate和RedisTemplate都有一些接口用于在springboot中操作redis。