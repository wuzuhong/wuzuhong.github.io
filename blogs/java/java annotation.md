# 【java基础】Java注解
转载自：
* https://www.cnblogs.com/throwable/p/9139908.html  
* https://blog.csdn.net/weixin_33768481/article/details/88606099

## 概述
```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface AnnotationDemo {
	String name();

	String desc() default "";
}
```
以上是一个注解的定义示例。首先可以看到`@AnnotationDemo`注解上有`@Documented`、`@Retention`和`@Target`三个注解，这些注解了注解的注解，称之为元注解。然后可以看到注解是以`@interface`关键字来标识的。最后可以看到`String name();`和`String desc() default "";`两行代码，称之为注解元素，注解元素有两种声明方式：`元素类型 元素名称`和`元素类型 元素名称 元素的默认值`。

## 常见的元注解

#### @Documented
主要用于文档工具的识别，被注解的元素能被Javadoc或类似的工具文档化

#### @Retention
指定该注解的保留策略，可选的保留策略为：
* `RetentionPolicy.SOURCE`：表示只保留在源码阶段，会被编译器丢弃
* `RetentionPolicy.CLASS`：表示会被编译器保留到class文件中，但是在运行阶段不会被JVM保留
* `RetentionPolicy.RUNTIME`：表示会被编译器保留到class文件中，并且在运行阶段也会被JVM保留

#### @Target
主要用于限制该注解能够应用在哪些项上，没有加`@Target`的注解可以应用于任何项上，可选的项为：
* `ElementType.TYPE`：表示只能用于类上
* `ElementType.FIELD`：表示只能用于字段上
* `ElementType.METHOD`：表示只能用于方法上
* `ElementType.PARAMETER`：表示只能用于参数上
* `ElementType.CONSTRUCTOR`：表示只能用于构造函数上
* `ElementType.LOCAL_VARIABLE`：表示只能用于局部变量上
* `ElementType.ANNOTATION_TYPE`：表示只能用于注解上
* `ElementType.PACKAGE`：表示只能用于包上
* `ElementType.TYPE_PARAMETER`：表示只能用于类型参数上，也就是类的泛型上
* `ElementType.TYPE_USE`：表示只能用于声明类型的地方，例如类型转换

#### @Inherited
添加了@Inherited注解的类，其子类也将拥有这个注解

#### @Repeatable
表示注解是可重复使用的，也就是可以多次应用于相同的声明或类型，也就是让同一个注解可以重复在同一类/方法/属性上使用，示例：
```java
// Schedule.java
// 重复注解类
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Repeatable(Schedules.class)
public @interface Schedule {
    String dayOfMonth() default "first";
    String dayOfWeek() default "Mon";
    int hour() default 12;
}

// Schedule.java
// 容器注解类
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Schedules {
    Schedule[] value();
}

// RepetableAnnotationTest.java
// 测试类
@Schedule(dayOfMonth="last")
@Schedule(dayOfWeek="Wed", hour=24)
public class RepetableAnnotationTest{
    @Schedule(dayOfMonth="last")
    @Schedule(dayOfWeek="Fri", hour=23)
    public void doPeriodicCleanup(){
    }

    public static void main(String[] args) throws NoSuchMethodException {
        Method doPeriodicCleanup = RepetableAnnotation.class.getMethod("doPeriodicCleanup");
        Schedules schedules = doPeriodicCleanup.getAnnotation(Schedules.class);
        System.out.println("获取标记方法上的重复注解：");
        for (Schedule schedule: schedules.value()){
            System.out.println(schedule);
        }
        System.out.println("获取标记类上的重复注解：");
        if (RepetableAnnotation.class.isAnnotationPresent(Schedules.class)){
            schedules = RepetableAnnotation.class.getAnnotation(Schedules.class);
            for (Schedule schedule: schedules.value()){
                System.out.println(schedule);
            }
        }
    }
}
```

## 插件化注解处理API（Pluggable Annotation Processing API）
**它的作用在于：能够在编译期对源码进行自定义操作，该操作将会在编译后的字节码文件中体现**

它的核心是`Annotation Processor`，即注解处理器，一般需要继承抽象类`javax.annotation.processing.AbstractProcessor`。注意，与运行时注解`RetentionPolicy.RUNTIME`不同，注解处理器只会处理源码阶段的注解，也就是RetentionPolicy.SOURCE的注解类型，处理的操作会在Java代码编译时触发，并且会在编译完成之前结束处理操作，所以可以在处理器中对源码进行自定义操作，该操作将会在编译后的字节码文件中体现。

#### 使用步骤
1. 自定义一个Annotation Processor，需要继承javax.annotation.processing.AbstractProcessor，并重写process方法。
2. 自定义一个注解，在注解的元注解部分需要指定@Retention(RetentionPolicy.SOURCE)。
3. 需要在声明的自定义Annotation Processor中使用javax.annotation.processing.SupportedAnnotationTypes指定在第2步创建的注解类型的名称(注意需要全类名，"包名.注解类型名称"，否则会不生效)。
4. 需要在声明的自定义Annotation Processor中使用javax.annotation.processing.SupportedSourceVersion指定java版本。
5. 可选操作，可以通在声明的自定义Annotation Processor中使用javax.annotation.processing.SupportedOptions指定编译参数。

#### 配置Processor
为了让自定义的Processor起作用，需要指定其位置，可以通过下面任意一种方式来指定Processor：
1. 直接使用编译参数指定，例如：javac -processor demo.AnnotationProcessor Main.java。
2. 通过服务注册指定，就是META-INF/services/javax.annotation.processing.Processor文件中添加demo.AnnotationProcessor。
3. 通过Maven的编译插件的配置指定如下：
    ```xml
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.5.1</version>
        <configuration>
            <source>1.8</source>
            <target>1.8</target>
            <encoding>UTF-8</encoding>
            <annotationProcessors>
                <annotationProcessor>
                    demo.AnnotationProcessor
                </annotationProcessor>
            </annotationProcessors>
        </configuration>
    </plugin>
    ```
    值得注意的是，以上方式生效的前提是demo.AnnotationProcessor已经被编译过，否则编译的时候就会报错。解决方法有两种，第一种是提前使用命令或者IDEA右键demo.AnnotationProcessor对它进行编译；第二种是把demo.AnnotationProcessor放到一个独立的Jar包引入；**推荐使用第二种方式解决**。

#### 使用示例
下面是一个直接修改类代码的例子，为实体类的Setter方法对应的属性生成一个Builder类，也就是原来的类如下：
```java
public class Person {

    private Integer age;
    private String name;

    public Integer getAge() {
        return age;
    }

    @Builder
    public void setAge(Integer age) {
        this.age = age;
    }

    public String getName() {
        return name;
    }

    @Builder
    public void setName(String name) {
        this.name = name;
    }
}
```
将会生成的Builder类如下：
```java
public class PersonBuilder {
 
    private Person object = new Person();
 
    public Person build() {
        return object;
    }
 
    public PersonBuilder setName(java.lang.String value) {
        object.setName(value);
        return this;
    }
 
    public PersonBuilder setAge(int value) {
        object.setAge(value);
        return this;
    }
}
```
自定义的注解如下：
```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.SOURCE)
public @interface Builder {

}
```
自定义的注解处理器如下：
```java
@SupportedAnnotationTypes(value = {"demo.Builder"})
@SupportedSourceVersion(value = SourceVersion.RELEASE_8)
public class BuilderProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (TypeElement typeElement : annotations) {
            Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(typeElement);
            Map<Boolean, List<Element>> annotatedMethods
                    = annotatedElements.stream().collect(Collectors.partitioningBy(
                    element -> ((ExecutableType) element.asType()).getParameterTypes().size() == 1
                            && element.getSimpleName().toString().startsWith("set")));
            List<Element> setters = annotatedMethods.get(true);
            List<Element> otherMethods = annotatedMethods.get(false);
            otherMethods.forEach(element ->
                    processingEnv.getMessager().printMessage(Diagnostic.Kind.ERROR,
                            "@Builder must be applied to a setXxx method "
                                    + "with a single argument", element));
            Map<String, String> setterMap = setters.stream().collect(Collectors.toMap(
                    setter -> setter.getSimpleName().toString(),
                    setter -> ((ExecutableType) setter.asType())
                            .getParameterTypes().get(0).toString()
            ));
            String className = ((TypeElement) setters.get(0)
                    .getEnclosingElement()).getQualifiedName().toString();
            try {
                writeBuilderFile(className, setterMap);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return true;
    }

    private void writeBuilderFile(
            String className, Map<String, String> setterMap)
            throws IOException {
        String packageName = null;
        int lastDot = className.lastIndexOf('.');
        if (lastDot > 0) {
            packageName = className.substring(0, lastDot);
        }
        String simpleClassName = className.substring(lastDot + 1);
        String builderClassName = className + "Builder";
        String builderSimpleClassName = builderClassName
                .substring(lastDot + 1);

        JavaFileObject builderFile = processingEnv.getFiler().createSourceFile(builderClassName);

        try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {

            if (packageName != null) {
                out.print("package ");
                out.print(packageName);
                out.println(";");
                out.println();
            }
            out.print("public class ");
            out.print(builderSimpleClassName);
            out.println(" {");
            out.println();
            out.print("    private ");
            out.print(simpleClassName);
            out.print(" object = new ");
            out.print(simpleClassName);
            out.println("();");
            out.println();
            out.print("    public ");
            out.print(simpleClassName);
            out.println(" build() {");
            out.println("        return object;");
            out.println("    }");
            out.println();
            setterMap.forEach((methodName, argumentType) -> {
                out.print("    public ");
                out.print(builderSimpleClassName);
                out.print(" ");
                out.print(methodName);

                out.print("(");

                out.print(argumentType);
                out.println(" value) {");
                out.print("        object.");
                out.print(methodName);
                out.println("(value);");
                out.println("        return this;");
                out.println("    }");
                out.println();
            });
            out.println("}");
        }
    }
}
```
测试主类如下：
```java
public class Main {

    public static void main(String[] args) throws Exception{
      //PersonBuilder在编译之后才会生成，这里需要编译后才能这样写
      Person person  = new PersonBuilder().setAge(25).setName("doge").build();
    }
}
```
先手动编译BuilderProcessor，然后在META-INF/services/javax.annotation.processing.Processor文件中添加demo.BuilderProcessor，最后执行Maven命令mvn compile进行编译。

编译成功之后，target/classes包下面的demo子包路径中会新增了一个类PersonBuilder：
```java
public class PersonBuilder {
    private Person object = new Person();

    public PersonBuilder() {
    }

    public Person build() {
        return this.object;
    }

    public PersonBuilder setName(String value) {
        this.object.setName(value);
        return this;
    }

    public PersonBuilder setAge(Integer value) {
        this.object.setAge(value);
        return this;
    }
}
```

**注意**：就算把保留策略更改为`RetentionPolicy.CLASS`或`RetentionPolicy.RUNTIME`，以上的注解处理器也能起作用，这是因为`RetentionPolicy.CLASS`或`RetentionPolicy.RUNTIME`会保留的注解，同样也会在`RetentionPolicy.SOURCE`中保留。