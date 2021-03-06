# 【微服务—分布式事务解决方案】TCC方案
## TCC方案
### TCC事务处理流程和2PC二阶段提交类似，不过2PC通常都是在跨库的DB层面，而TCC本质就是一个应用层面的2PC

### TCC 将事务提交分为 Try、Confirm、Cancel 3个操作
* Try：完成业务的准备工作
* Confirm：完成业务的提交
* Cancel：完成事务的回滚

![TCC](./images/tcc.png)

### 应用场景示例
假设用户下单操作来自3个系统下单系统、资金账户系统、红包账户系统，下单成功需要同时调用资金账户服务和红包服务完成支付。假设购买商品1000元，使用账户红包200元，余额800元，确认支付。
* Try操作  
tryX 下单系统创建待支付订单  
tryY 冻结账户红包200元  
tryZ 冻结资金账户800元  

* Confirm操作  
confirmX 订单更新为支付成功  
confirmY 扣减账户红包200元  
confirmZ 扣减资金账户800元  

* Cancel操作  
cancelX 订单处理异常，资金红包退回，订单支付失败  
cancelY 冻结红包失败，账户余额退回，订单支付失败  
cancelZ 冻结余额失败，账户红包退回，订单支付失败  

### 弊端
* 对应用的侵入性强。业务逻辑的每个分支都需要实现try、confirm、cancel三个操作，应用侵入性较强，改造成本高。
* 实现难度较大。需要按照网络状态、系统故障等不同的失败原因实现不同的回滚策略。为了满足一致性的要求，confirm和cancel接口必须实现幂等。