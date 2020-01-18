# 【springboot】日志系统

springboot底层是使用slf4j+logback的方式进行日志记录，所以我们可以直接使用这种方式来记录我们自己的日志。

## 使用方式
```
Logger logger = LoggerFactory.getLogger(HelloWorld.class);
logger.info("Hello World");
```

## 修改默认配置
可以在全局配置文件中对默认配置进行覆盖
```
logging:
  # 指定日志级别
  level:
    root: debug
  # 指定日志文件目录，需要提前建好这个目录，默认生成的文件名为spring.log
  path: /springboot/logs
  # 指定日志文件目录及文件名，目录不配置则默认为当前项目根目录。
  file: /springboot.log
  pattern:
    # 指定在控制台中输出的日志格式
    console: '%d{yyyy-MM-dd hh:mm:ss} [%thread] %-5level %logger{50} - %msg%n'
    # 指定在文件中输出的日志格式
    file: '%d{yyyy-MM-dd} === [%thread] === %-5level === %logger{50} === - %msg%n'
```
注意：logging.file和logging.path不能同时使用，如若同时使用，则只有logging.file会生效；如果不想让日志输出到文件，则把logging.file和logging.path配置项去掉即可，因为springboot默认是不会输出日志到文件的。