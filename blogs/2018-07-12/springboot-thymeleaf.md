# 【springboot】整合thymeleaf模板引擎
SpringBoot推荐使用thymeleaf作为页面模板引擎

## 使用方式
* 在pom.xml中新增thymeleaf的依赖
```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```
之后只要我们把HTML页面放在src/resources/templates/目录下，thymeleaf就能自动渲染
* 导入thymeleaf的名称空间
```
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
```
* 使用thymeleaf语法，更详细的的语言请查看thymeleaf官方文档 https://www.thymeleaf.org/documentation.html
```
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
  <meta charset="UTF-8">
  <title>Title</title>
</head>
<body>
<h1>成功！</h1>
<span th:text="${hello}"></span >
</body>
</html>
```
* 在controller中返回thymeleaf模板页面
```
  @GetMapping("/")
  public String getIndexPage(Model model) {
    //往模板中添加数据，可以在模板页面通过thymeleaf语法来获取
    model.addAttribute("hello","hello");
    //这里返回的就是thymeleaf模板的名字，例如我们编写的是index.html，那么这里就是返回的index
    return "index";
  }
```
注意：如果要返回thymeleaf模板页面的话就不能使用RestController注解了，而必须使用Controller注解