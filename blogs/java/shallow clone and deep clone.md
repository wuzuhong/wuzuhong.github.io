# 【java基础】深拷贝和浅拷贝的区别
拷贝包括引用的拷贝和对象的拷贝。

示例类代码：
```java
public class Student implements Cloneable {
    private String id;
    private String name;
    private Integer age;
    private School school;

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    // getter and setter and constructor
}

public class School {      
    private String id;     
    private String name;   

    // getter and setter and constructor
}
```

## 引用的拷贝
```java
School school1 = new School("1", "1");
Student student1 = new Student("1", "1", 1, school1);

Student student2 = student1;

System.out.println(student1.hashCode());
System.out.println(student2.hashCode());
```
输出：
```
1391942103
1391942103
```
解析：打印的结果是一样的，也就是说，二者引用的是同一个对象，并没有创建出一个新的对象。

```java
School school1 = new School("1", "1");
Student student1 = new Student("1", "1", 1, school1);

School school2 = new School("2", "2");
Student student2 = new Student("2", "2", 2, school2);

System.out.println(student1.hashCode());
System.out.println(student2.hashCode());

student2 = student1;

System.out.println(student1.hashCode());
System.out.println(student2.hashCode());
```
输出：
```
1391942103
2092769598
1391942103
1391942103
```
解析：就算是已经初始化后的对象，也是可以直接进行引用的拷贝的。

## 对象的拷贝
* 浅拷贝：对基本数据类型进行值传递，对引用数据类型进行引用传递般的拷贝。
* 深拷贝：对基本数据类型进行值传递，对引用数据类型，创建一个新的对象，并复制其内容。

#### 浅拷贝
实现对象拷贝的类，必须实现`Cloneable`接口，并重写`clone`方法。`Cloneable`其实就是一个标记接口，只有实现这个接口后，然后在类中重写`Object`中的`clone`方法，然后通过类调用`clone`方法才能克隆成功，如果不实现这个接口，则会抛出`CloneNotSupportedException`（克隆不被支持）异常。

```java
School school1 = new School("1", "1");
Student student1 = new Student("1", "1", 1, school1);

Student student2 = (Student) student1.clone();

System.out.println(student1.hashCode());
System.out.println(student2.hashCode());

student2.getSchool().setId("11");

System.out.println(JSON.toJSONString(student1));
System.out.println(JSON.toJSONString(student2));

System.out.println(student1.getName().hashCode());
System.out.println(student1.getName().hashCode());
```
输出：
```
1391942103
2092769598
{"age":1,"id":"1","name":"1","school":{"id":"11","name":"1"}}
{"age":1,"id":"1","name":"1","school":{"id":"11","name":"1"}}
49
49
```
解析：第1、2行打印的结果是不一样的，所以已经创建出一个新的对象了。第3、4行打印的结果是一样的，所以对于student2中的school的修改也会影响到student1中的school，所以这是浅拷贝。第5、6行打印的结果是一样的，所以String类型其实也是引用的拷贝。

#### 深拷贝
为了实现深拷贝，需要对 School 对象也进行拷贝，因此需要对 Student 和 School 进行修改。
```java
public class Student implements Cloneable {
    private String id;
    private String name;
    private Integer age;
    private School school;

    @Override
    protected Object clone() throws CloneNotSupportedException {
        Student student = (Student) super.clone();
        student.school = (School) school.clone();
        return student;
    }

    // getter and setter and constructor
}

public class School implements Cloneable {                          
    private String id;                                              
    private String name;                                            
                                                                    
    @Override                                                       
    protected Object clone() throws CloneNotSupportedException {    
        return super.clone();                                       
    }         

    // getter and setter and constructor                                                      
}
```
再次进行测试后输出的是：
```
1391942103
2092769598
{"age":1,"id":"1","name":"1","school":{"id":"1","name":"1"}}
{"age":1,"id":"1","name":"1","school":{"id":"11","name":"1"}}
49
49
```
解析：第3、4行打印的结果已经不一样了，但是第5、6行的还是一样，这并无大碍，因为对String类型进行修改后，会默认创建一个新的String对象。

所以，为了实现对象的深拷贝，就必须将其子对象、子子对象、子子子对象……全部进行拷贝。