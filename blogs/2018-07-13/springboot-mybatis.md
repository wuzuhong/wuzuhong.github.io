# 【springboot】整合MyBatis
## 向pom.xml中添加相关maven依赖
```
<!--使用druid数据源-->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.1.14</version>
</dependency>
<!--mybatis启动器-->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.0.0</version>
</dependency>
<!--mysql驱动-->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```
## 修改全局配置文件
```
# 配置数据源
spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    url: jdbc:mysql://localhost:3306/study_springboot?characterEncoding=utf-8
    username: root
    password: 123456
    driver-class-name: com.mysql.jdbc.Driver
# 配置mybatis
mybatis:
  # 加载mapper.xml文件，若是使用了mapper代理开发方式，则当前这个属性不用配置
  mapper-locations: classpath:springboot.mapper/*Mapper.xml
  # 使用别名
  mybatis.type-aliases-package=springboot.entity
```
## 配置druid数据源
```
@Configuration
public class DruidConfiguration {
	private static final Logger log = LoggerFactory.getLogger(DruidConfiguration.class);
	@Bean
	public ServletRegistrationBean druidServlet() {
		log.info("init Druid Servlet Configuration ");
		ServletRegistrationBean servletRegistrationBean = new ServletRegistrationBean();
		servletRegistrationBean.setServlet(new StatViewServlet());
		servletRegistrationBean.addUrlMappings("/druid/*");
		Map<String, String> initParameters = new HashMap<String, String>();
		initParameters.put("loginUsername", "admin");// 用户名
		initParameters.put("loginPassword", "admin");// 密码
		initParameters.put("resetEnable", "false");// 禁用HTML页面上的“Reset All”功能
		initParameters.put("allow", ""); // IP白名单，没有配置或者为空，则允许所有访问
		// initParameters.put("deny", "192.168.20.38");// IP黑名单，deny和allow共同存在时，deny优先于allow
		servletRegistrationBean.setInitParameters(initParameters);
		return servletRegistrationBean;
	}
 
	@Bean
	public FilterRegistrationBean filterRegistrationBean() {
		FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean();
		filterRegistrationBean.setFilter(new WebStatFilter());
		// 添加过滤规则
		filterRegistrationBean.addUrlPatterns("/*");
		// 添加不需要忽略的格式信息.
		filterRegistrationBean.addInitParameter("exclusions", "*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*");
		return filterRegistrationBean;
	}
 
	@Bean
	@ConfigurationProperties(prefix = "spring.datasource")
	public DataSource druidDataSource() {
		return new DruidDataSource();
	}
}
```
## 在主入口类中添加以下注解来开启mapper扫描包
```
@MapperScan(value="springboot.mapper")  //开启扫描 mapper 包，其中springboot.mapper表示mapper文件所在的包名
```
## 使用mapper代理开发方式来开发mapper，也就是mapper.java和mapper.xml必须在同一个目录下
TestMapper.java
```
public interface TestMapper {
	
	public BookType getOneById(Integer id) throws Exception;

	public Integer addOne(BookType bookType);
	
	public void updateOne(BookType bookType);

	public void deleteById(Integer id);
	
	public List<BookType> getList(List<Integer> ids);
}
```
TestMapper.xml
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="springboot.mapper.TestMapper">
	<select id="getOneById" parameterType="int" resultType="BookType">
		SELECT 
		  * 
		FROM
		  bookType 
		WHERE id = #{id} 
	</select>
	<insert id="addOne" parameterType="BookType">
		INSERT INTO booktype 
		VALUES
		  (NULL, #{typeName}, #{days})
	</insert>
	<update id="updateOne" parameterType="BookType">
		UPDATE booktype
		<set>
			<if test="typeName!=null">
			typeName=#{typeName},
			</if>
			<if test="typeName!=null">
			days=#{days}
			</if>
		</set>
		 WHERE id=#{id}
	</update>
	
	<delete id="deleteById" parameterType="int">
		DELETE FROM booktype WHERE id=#{id}
	</delete>
	
	<select id="getList" parameterType="list" resultType="BookType">
		SELECT * FROM booktype WHERE id IN
		<foreach collection="list" item="id" open="(" close=")" separator=",">
			#{id}
		</foreach>
	</select>
</mapper>
```
## 在controller中使用开发好的mapper.java中的接口来调用相应的mapper.xml中的sql即可完成相关增删改查操作
```
@RestController
public class TestController {
	@Autowired
	private TestMapper testMapper;

	@RequestMapping("/")
	public BookType selectOne(){
		return testMapper.getOneById(id);
	}
}
```
## 使用Redis作为Mybatis的二级缓存
### 首先springboot需要整合redis
参考[【springboot】整合Redis](./blog.html?path=./blogs/2018-07-13/springboot-redis.js)
### 编写MyBatis自定义二级缓存，这里将使用Redis来作为MyBatis的二级缓存
```
/**
 * 使用Redis来做Mybatis的二级缓存 实现Mybatis的Cache接口
 */
public class MyBatisRedisCache implements Cache {

  private static final Logger logger = LoggerFactory.getLogger(MyBatisRedisCache.class);

  @Autowired
  private RedisTemplate redisTemplate;
  // 读写锁
  private final ReadWriteLock readWriteLock = new ReentrantReadWriteLock(true);

  private String id;

  public MyBatisRedisCache(final String id) {
    if (id == null) {
      throw new IllegalArgumentException("Cache instances require an ID");
    }
    logger.info("Redis Cache id " + id);
    this.id = id;
  }

  @Override
  public String getId() {
    return this.id;
  }

  @Override
  public void putObject(Object key, Object value) {
    if (value != null) {
      // 向Redis中添加数据，有效时间是2天
      redisTemplate.opsForValue().set(key.toString(), value, 2, TimeUnit.DAYS);
    }
  }

  @Override
  public Object getObject(Object key) {
    try {
      if (key != null) {
        Object obj = redisTemplate.opsForValue().get(key.toString());
        return obj;
      }
    } catch (Exception e) {
      logger.error("redis ");
    }
    return null;
  }

  @Override
  public Object removeObject(Object key) {
    try {
      if (key != null) {
        redisTemplate.delete(key.toString());
      }
    } catch (Exception e) {
    }
    return null;
  }

  @Override
  public void clear() {
    logger.debug("清空缓存");
    try {
      Set<String> keys = redisTemplate.keys("*:" + this.id + "*");
      if (!CollectionUtils.isEmpty(keys)) {
        redisTemplate.delete(keys);
      }
    } catch (Exception e) {
    }
  }

  @Override
  public int getSize() {
    Long size = (Long) redisTemplate.execute(new RedisCallback<Long>() {
      @Override
      public Long doInRedis(RedisConnection connection) throws DataAccessException {
        return connection.dbSize();
      }
    });
    return size.intValue();
  }

  @Override
  public ReadWriteLock getReadWriteLock() {
    return this.readWriteLock;
  }

}
```
### 然后需要在全局配置文件中开启MyBatis的二级缓存
```
mybatis:
  configuration:
    cache-enabled: true
```
### 最后在mapper.xml中使用二级缓存
TestMapper.xml
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="springboot.mapper.TestMapper">
	<!-- 这里的type就是上面我们编写的MyBatis自定义二级缓存类 -->
	<cache type="com.xiaowu.cache.MyBatisRedisCache"></cache>
	<select id="getOneById" parameterType="int" resultType="BookType">
		SELECT 
		  * 
		FROM
		  bookType 
		WHERE id = #{id} 
	</select>
</mapper>
