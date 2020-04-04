# 【设计模式】装饰模式
装饰模式能够动态地给一个对象添加一些额外的能力。就像`FilterInputStream inputStream = new BufferedInputStream(new FileInputStream(null)))`一样，在给`FileInputStream`装饰一层`BufferedInputStream`之后，它就拥有了缓冲区的能力。

装饰模式发挥作用的地方在于，当我们设计好了一个类，我们需要给这个类添加一些其他的能力，并且不希望改变这个类的代码，这时候就是装饰者模式大展雄威的时候了。这里还体现了一个原则：**类应该对扩展开放，对修改关闭**。

## 接下来以游戏装备为例
```java
// 装备的接口
public interface IEquip{
	public int caculateAttack();
 
	public String attack();
}


// 武器
public class ArmEquip implements IEquip{
	@Override
	public int caculateAttack(){
		return 20;
	}
 
	@Override
	public String attack(){
		return "屠龙刀发起一次攻击";
	}
}


// 其他更多的装备


// 装饰品的接口
public interface IEquipDecorator extends IEquip{
}


// 蓝宝石
public class BlueGemDecorator implements IEquipDecorator{
	private IEquip equip;
 
	public BlueGemDecorator(IEquip equip){
		this.equip = equip;
	}
 
	@Override
	public int caculateAttack(){
		return 5 + equip.caculateAttack();
	}
 
	@Override
	public String attack(){
		return "【镶嵌了蓝宝石】"+equip.attack();
	}
}


// 其他更多的装饰品


// 测试代码
public class Test{
	public static void main(String[] args){
		System.out.println(" 一个镶嵌1颗蓝宝石的武器");
		// 一个镶嵌1颗蓝宝石的武器，其能力将会更加强大
		IEquip equip = new BlueGemDecorator(new ArmEquip());
		System.out.println("攻击力  : " + equip.caculateAttack());
		System.out.println("攻击 :" + equip.attack());
	}
}
```
对于以上逻辑，可能还会这么设计，但都是错的：
* 对于镶嵌宝石的武器的每一种可能性都写一个类，例如：镶嵌了1颗蓝宝石的类、镶嵌了6颗红宝石的类等等，这种写法在最初需求不多的时候，还可以忍，但是到后来需求越来越多，镶嵌宝石的武器的种类无穷无尽，所需要创建的类也是无穷无尽的。
* 写一个超类，然后里面各种set宝石，然后在计算攻击力的地方，使劲的If有哪几种宝石，但是随便添加个武器，又得多写多少个if呢。

## 装饰模式的应用

#### 优点
* 装饰类和被装饰类可以独立发展，而不会相互耦合。它有效地把类的核心职责和装饰功能分开了
* 装饰模式是继承关系的一个替代方案
* 装饰模式可以动态地扩展一个实现类的功能

#### 缺点
* 多层装饰比较复杂。比如我们现在有很多层装饰，出了问题，一层一层检查，最后发现是最里层的装饰出问题了，想想工作量都害怕

#### 使用场景
* 需要扩展一个类的功能时
* 在不想增加很多子类的情况下扩展类时
* 需要动态地给一个对象增加功能，并可以动态地撤销时
* 需要为一批的兄弟类进行改装或加装功能时