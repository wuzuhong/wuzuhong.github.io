# 【设计模式】策略模式
定义了一组算法，将每个算法都通过类来封装（而不是方法），并且使它们之间可以互换。

接下来将会使用游戏角色的技能来示例。

## 不使用策略模式的代码
```java
// 角色的抽象类
public abstract class Role{
	protected String name;
 
	protected abstract void defend();
 
	protected abstract void attack();
 
    // 更多的方法…………
}


// A角色
public class RoleA extends Role{
    public RoleA(String name){
		this.name = name;
	}
 
	@Override
	protected void defend(){
		System.out.println("样子A");
	}
 
	@Override
	protected void attack(){
		System.out.println("攻击A");
	}

    // 更多的方法…………
}


// 更多的B角色、C角色、D角色…………
```
以上代码的问题在于，很多角色中的有些方法实现可能都是一样的，会造成很多重复的代码。

## 使用策略模式的代码
现在我们将以上示例代码通过策略模式进行改造，将游戏角色的技能使用类来封装：
```java
// 防御的接口
public interface IDefendBehavior{
	void defend();
}


// 攻击的接口
public interface IAttackBehavior{
	void attack();
}


// A的防御技能
public class DefendTA implements IDefendBehavior{
	@Override
	public void defend(){
		System.out.println("防御A");
	}
}


// A的攻击技能
public class AttackA implements IAttackBehavior{
	@Override
	public void attack(){
		System.out.println("攻击A");
	}
}


// 更多的B、C、D的防御和攻击技能…………
```
相应的，角色类代码也要做修改：
```java
// 角色的抽象类
public abstract class Role{
	protected String name;
 
	protected IDefendBehavior defendBehavior;
	protected IAttackBehavior attackBehavior;
 
	public Role setDefendBehavior(IDefendBehavior defendBehavior){
		this.defendBehavior = defendBehavior;
		return this;
	}
 
	public Role setAttackBehavior(IAttackBehavior attackBehavior){
		this.attackBehavior = attackBehavior;
		return this;
	}

	protected void attack(){
		attackBehavior.attack();
	}
 
	protected void defend(){
		defendBehavior.defend();
	}
}


// A角色
public class RoleA extends Role{
	public RoleA(String name){
		this.name = name;
	}
}
```
之后，我们就可以这样使用了：
```java
public class Test{
	public static void main(String[] args){
		Role roleA = new RoleA("A");
		roleA.setAttackBehavior(new AttackXL())//
				.setDefendBehavior(new DefendTBS());

		System.out.println(roleA.name + ":");

		roleA.run();
		roleA.attack();
		roleA.defend();
		roleA.display();
	}
}
```
经过修改，现在所有的技能的实现做到了100%的复用，没有任何的重复代码，并且随便需求需要什么样的角色，对于我们来说只需要动态修改一下技能和展示方式，非常完美。

## 策略模式的应用

#### 优点
* 算法可以自由切换
* 避免使用多重条件判断（如果不用策略模式我们可能会使用多重条件语句，不利于维护）
* 扩展性良好，增加一个策略只需实现接口即可

#### 缺点
* 策略类数量会增多，每个策略都是一个类
* 所有的策略类都需要对外暴露

#### 使用场景
* 多个类只有算法或行为上稍有不同的场景
* 算法需要自由切换的场景
* 需要屏蔽算法规则的场景