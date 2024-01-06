# 【mybatis】mybatis的流式查询
## 特征
* 通常mybatis的查询返回的是一个集合对象，但mybatis的流式查询能够在查询成功后返回一个迭代器。
* 应用程序可以从迭代器中一条一条的取出结果，需要说明的是，它是从数据库中一条一条返回的，所以流式查询的好处就是能够降低应用程序的内存消耗。
* 如果我们想要从数据库取 1000 万条记录而又没有足够的内存时，就不得不分页查询，而分页查询效率取决于表设计，如果设计的不好，就无法执行高效的分页查询。而流式查询就能解决这一问题。
* 流式查询的过程当中，数据库连接必须是保持打开状态的，但是通常mybatis的mapper方法执行完成后就会立即关闭数据库连接，因此，可以利用spring的事务来保证数据库连接在 Cursor 遍历完后再关闭，也可以自己从 SqlSessionFactory 中获取连接，但这在执行一个流式查询后，框架就不负责关闭数据库连接了，需要应用在取完数据后自己关闭。

## 原理
mybatis 提供了一个叫 Cursor 的接口类用于流式查询，这个接口继承了 java.io.Closeable 和 java.lang.Iterable 接口，因此
* Cursor 是可关闭的。
* Cursor 是可遍历的。

除了遍历， Cursor 接口中还提供了三个方法：
* isOpen：用于在取数据之前判断 Cursor 对象是否是打开状态。只有当打开时 Cursor 才能取数据。
* isConsumed：用于判断查询结果是否全部取完。
* getCurrentIndex：返回已经获取了多少条数据。

## 使用方式
#### 定义 mapper
```java
public interface StudentMapper {
    @Select("select * from student")
    Cursor<Student> getStudents();
}
```

#### 方式一：使用事务注解来保证 Cursor 执行完后才关闭数据库连接
```java
@Autowired
private StudentMapper mapper;

@Transactional
public void getStudents() throws Exception {
    // 使用 try-with-resources 语句来保证 Cursor 在最后会被关闭。
    try (Cursor<Student> cursor = mapper.getStudents()) {
        cursor.forEach(student -> {
            // TODO
        });
    }
}
```

需要注意的是，spring的事务注解只在外部调用时会生效，如果在当前类中调用这个方法，则会报错。

#### 方式二：从 SqlSessionFactory 中获取数据库连接，并自行关闭数据库连接
```java
public void getStudents() throws Exception {
    SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);
    // 使用 try-with-resources 语句来保证 SqlSession 和 Cursor 在最后会被关闭。
    try (SqlSession session = sqlSessionFactory.openSession();
        Cursor<Student> cursor = session.getMapper(StudentMapper.class).getStudents();) {
        cursor.forEach(student -> {
            // TODO
        });
    }
}
```
