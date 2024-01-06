# 【设计模式】建造者模式
就是一步步创建一个对象，可以精细地控制对象的创建过程。

Spring 中的 RestTemplateBuilder 和 Java 中的 StringBuilder 、 StringBuffer 都用到了建造者模式。

## 示例
```java
public class Demo {
	private String name;
	private Integer age;

	public Demo(String name, Integer age) {
		this.name = name;
		this.age = age;
	}

	public String getName() {
		return name;
	}

	public Integer getAge() {
		return age;
	}

    // 建造者
	public static class Builder {
		private String name;
		private Integer age;

		public Builder name(String name) {
			this.name = name;
			return this;
		}

		public Builder age(Integer age) {
			this.age = age;
			return this;
		}

		public Demo build() {
			return new Demo(this.name, this.age);
		}
	}
}


// 测试代码
public class Test {
	public static void main(String[] args) {
		Demo demo = new Demo.Builder().age(10).name("aabb").build();
		System.out.println(demo);
	}
}
```

## 建造者模式的应用

#### 优点
* 封装性。就是客户端不必知道产品内部组成的细节。
* 建造者独立，易扩展。
* 便于控制细节风险。可以对建造过程逐步细化，而不对其他模块产生任何影响。

#### 缺点
* 产品必须有共同点，范围有限制。
* 如果内部变化复杂，会有很多建造类。

#### 使用场景
* 相同的方法，不同的执行顺序，会产生不同的事件结果时。
* 需要生成的对象具有复杂的内部结构时。

#### 与工厂模式的区别
* 建造者模式更关注于组装的顺序。