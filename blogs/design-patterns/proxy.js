function getBlog(){
	return blog = {"content": "# 【设计模式】代理模式\nSpring AOP动态代理中就使用了代理模式。\n\n为其他对象提供一种代理以控制对这个对象的访问。\n\n说的通俗一点就是在调用真实对象之前或之后或在异常抛出之后执行一些自定义的逻辑。\n\n## 示例\n```java\npublic abstract class Subject {\n    public abstract void request();\n}\n\n\npublic class RealSubject extends Subject {\n    @Override\n    public void request() {\n        System.out.println(\"真实的请求RealSubject\");\n    }\n}\n\n\n// 代理\npublic class Proxy extends Subject {\n    private RealSubject realSubject = null;\n    \n    public Proxy() {\n        this.realSubject = new RealSubject();\n    }\n    \n    @Override\n    public void request() {\n        this.before();\n        this.realSubject.request();\n        this.after();\n    }\n\n    // 预处理\n    private void before() {\n        System.out.println(\"-------before------\");\n    }\n    \n    // 善后处理\n    private void after() {\n        System.out.println(\"-------after-------\");\n    }\n}\n```\n以上示例其实是一个静态代理，因为它只能代理`RealSubject`。\n\n## 代理模式的应用\n\n#### 优点\n* 职责清晰。真实的角色就是实现实际的业务逻辑，不用担心其他非本职责的事务\n* 高扩展性。代理类完全可以在不做任何修改的情况下使用\n* 智能化。比如动态代理\n\n#### 缺点\n* 有些类型的代理模式可能会造成请求的处理速度变慢\n* 实现代理模式需要额外的工作，有些代理模式的实现非常复杂\n\n#### 使用场景\n* 远程代理。为一个对象在不同的地址空间提供局部代表\n* 虚拟代理。根据需要创建开销很大的对象，通过它来存放实例化需要很长时间的真实对象\n* 安全代理。用来控制真实对象访问时的权限\n* 智能指引。当调用真实的对象时，代理处理另外一些事", "title": "【设计模式】代理模式"}
}