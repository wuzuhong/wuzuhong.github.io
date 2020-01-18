# 【springboot】任务
## 定时任务
### 首先在主入口类添加注解 @EnableScheduling 来启用定时任务组件
```
@SpringBootApplication
@EnableScheduling //启用定时任务组件
public class StudySpringbootApplication {

  public static void main(String[] args) {
    SpringApplication.run(StudySpringbootApplication.class, args);
  }

}
```
### 然后在定时任务的类上使用注解 @Component 使其能在容器启动时被加载，并在该类的方法上使用 @Scheduled 注解将该方法设为一个定时任务。
```
@Component
public class MyTask {
  // fixedRate的单位为毫秒，这里表示每个2秒钟执行一次当前方法。
  @Scheduled(fixedRate = 2000)
  public void reportCurrentTime(){
    System.out.println(new Date().toString());
  }
}
```
除了使用fixedRate，还支持使用更高级的cron表达式来定义当前方法的执行时间频率：
```
@Component
public class MyTask {
  // 使用cron表达式
  @Scheduled(cron = "4-40 * * * * ?")
  public void reportCurrentTime(){
    System.out.println(new Date().toString());
  }
}
```
## 异步任务
### 首先在主入口类添加注解 @EnableAsync 来启用异步任务组件
```
@SpringBootApplication
@EnableAsync //启用异步任务组件
public class StudySpringbootApplication {

  public static void main(String[] args) {
    SpringApplication.run(StudySpringbootApplication.class, args);
  }

}
```
### 然后在异步任务的类上使用注解 @Component 使其能在容器启动时被加载并且在相关方法上使用注解 @Async 将该方法设为一个异步方法
```
@Component
public class MyAsyncTask {
  @Async
  public void reportCurrentTime(){
    System.out.println(new Date().toString());
  }
}
```
异步任务和线程类似。
## 邮件任务
### 首先在 pom 文件中引入 spring-boot-starter-mail 依赖
```
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```
### 然后在全局配置文件中进行配置
```
  spring:
    mail:
      username: 123456789@qq.com
      password: 123456	 # 注意这里不是qq密码，而是邮箱授权第三方登录的授权码
      host: smtp.qq.com
      properties:
        mail:
          smtp:
            ssl:
              enable: true	//开启 ssl
```
### 最后就可以使用 spring-boot-starter-mail 依赖中的 JavaMailSenderImpl 类（邮件发送器）中的方法来发送邮件了
```
@Autowired
  private JavaMailSenderImpl mailSender;

  //发送简单邮件
  public void sendSimpleMail() {
    //创建一个简单的消息邮件
    SimpleMailMessage message = new SimpleMailMessage();
    //邮件设置
    message.setSubject("邮件标题");
    message.setText("邮件内容");
    message.setTo("邮件接受者的邮箱地址");
    message.setFrom("邮件发送者的邮箱地址");
    mailSender.send(message);
  }

  //发送复杂邮件
  public void sendComplexMail() {
    //创建一个复杂的消息邮件
    MimeMessage message = new MimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true);
    //邮件设置
    helper.setSubject("邮件标题");
    helper.setText("html片段", true);
    helper.setTo("邮件接受者的邮箱地址");
    helper.setFrom("邮件发送者的邮箱地址");
    //添加附件
    helper.addAttachment("文件名称", "文件路径");
    mailSender.send(message);
  }
```