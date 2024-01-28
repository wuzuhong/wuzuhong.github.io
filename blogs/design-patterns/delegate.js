function getBlog(){
	return blog = {"content": "# 【设计模式】委派模式\n委派模式中的主要角色有三种：抽象任务角色、委派者角色和具体任务角色。\n\n实现层面上，定义一个抽象接口，它是抽象任务角色，它有若干实现类，这些实现类才有真正执行业务的方法，这些子类是具体任务角色；定义委派者角色也实现该接口，但它负责在各个具体角色实例之间做出决策，由它判断并调用具体实现的方法。\n\n委派模式对外隐藏了具体实现，仅将委派者角色暴露给外部，如 Spring 的 DispatcherServlet。\n\n## 示例\n\n#### 抽象任务角色\n```java\n// 抽象任务角色\npublic interface Task {\n    void doTask();\n}\n```\n\n#### 具体任务角色\n```java\n// 具体实现类A\npublic class ConcreteTaskA implements Task {\n    public void doTask() {\n        System.out.println(\"执行 , 由A实现\");\n    }\n}\n\n\n// 具体实现类B\npublic class ConcreteTaskB implements Task {\n    public void doTask() {\n        System.out.println(\"执行 , 由B实现\");\n    }\n}\n```\n\n#### 委派者角色\n```java\n// 委派者角色\npublic class TaskDelegate implements Task{\n    public void doTask() {\n        System.out.println(\"代理执行开始....\");\n\n        Task task = null;\n        if (new Random().nextBoolean()){\n            task = new ConcreteTaskA();\n            task.doTask();\n        }else{\n            task = new ConcreteTaskB();\n            task.doTask();\n        }\n\n        System.out.println(\"代理执行完毕....\");\n    }\n}\n```\n\n#### 测试代码\n```java\npublic class Test {\n    public static void main(String[] args) {\n        new TaskDelegate().doTask();\n    }\n}\n```\n\n## 委派模式的应用\n\n#### 优点\n* 对外隐藏实现。\n* 易于扩展。\n* 简化调用。\n\n#### 与代理模式的区别\n* 代理模式注重过程，而委派模式注重结果", "title": "【设计模式】委派模式"}
}