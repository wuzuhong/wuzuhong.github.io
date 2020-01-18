# 【springboot】整合swagger
## 在pom.xml中添加maven依赖
```
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.4.0</version>
</dependency>
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.4.0</version>
</dependency>
```
## 编写swagger的配置类
Swagger2.java
```
@Configuration
@EnableSwagger2
public class Swagger2 {

  @Bean
  public Docket createRestApi() {
    //添加header参数
    ParameterBuilder tokenPar = new ParameterBuilder();
    List<Parameter> pars = new ArrayList<Parameter>();
    //添加Content-Type参数，并设默认值为application/json
    Parameter param1 = tokenPar.name("Content-Type").description("请求内容类型")
        .modelRef(new ModelRef("string")).parameterType("header").defaultValue("application/json")
        .required(true).build();
    //添加Accept参数，并设默认值为application/json
    Parameter param2 = tokenPar.name("Accept").description("接收内容类型")
        .modelRef(new ModelRef("string")).parameterType("header").defaultValue("application/json")
        .required(true).build();
    pars.add(param1);
    pars.add(param2);
    return new Docket(DocumentationType.SWAGGER_2)
        .apiInfo(apiInfo())
        .select()
        .apis(RequestHandlerSelectors.basePackage("springboot.controller"))  //定义需要扫描的包名
        .paths(PathSelectors.any())
        .build()
        .globalOperationParameters(pars);
  }

  private ApiInfo apiInfo() {
    return new ApiInfoBuilder()
        .title("Spring Boot中使用Swagger2构建RESTful APIs")  //标题
        .description("Spring Boot中使用Swagger2构建RESTful APIs的描述")  //描述
        .termsOfServiceUrl("http://blog.didispace.com/")
        .contact("xiaowu")  //作者
        .version("1.0")  //版本号
        .build();
  }
}
```
## 在controller中使用swagger相关注解来生成文档
```
@RestController
@RequestMapping("api")
@Api("swaggerDemoController相关的api")
public class SwaggerDemoController {

  private static final Logger logger = LoggerFactory.getLogger(SwaggerDemoController.class);
  @Autowired
  private StudentService studentService;

  @ApiOperation(value = "根据id查询学生信息", notes = "查询数据库中某个的学生信息")
  @ApiImplicitParam(name = "id", value = "学生ID", paramType = "path", required = true, dataType = "Integer")
  @RequestMapping(value = "/{id}", method = RequestMethod.GET)
  public Student getStudent(@PathVariable int id) {
    logger.info("开始查询某个学生信息");
    return studentService.selectStudentById(id);
  }
}
```
## 最后启动服务器并访问 http://localhost:8080/swagger-ui.html 即可看到生成的swagger文档