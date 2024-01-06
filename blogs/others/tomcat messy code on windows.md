# 【其他】Tomcat-8.5.73 在 windows 上运行乱码问题修复
1. 在`apache-tomcat-8.5.73\bin\catalina.bat`文件中的`setlocal`这行下面新建一行配置即可修复前端页面乱码：
  ```
  set JAVA_OPTS=-Xms512m -Xms1024m -XX:MaxPermSize=1024m -Dfile.encoding=UTF-8
  ```
  
2. 在`apache-tomcat-8.5.73\webapps\demo\WEB-INF\classes\logback.xml`中添加以下配置即可修复 cmd 控制台乱码：
  ```
  <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d [%thread] %-5level %logger{0} - %msg%n</pattern>
      <charset>GBK</charset>
    </encoder>
  </appender>
  ```
