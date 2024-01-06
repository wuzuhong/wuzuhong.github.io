# 【服务编排-Conductor】操作符 Operators
Operator 其实也是 Task 的一种，它的配置也是放在 Workflow 的 JSON Schema 定义的 tasks 字段中。

## Do-While
任务类型为 DO_WHILE ，在条件满足时，能够循环执行多个任务。它的配置如下：
```json
{
    "loopCondition": "", // 循环条件。每次循环执行完后就会去校验这个条件，校验通过后才会执行下一次循环。必填
    "loopOver": [] // 循环任务集合。必填
}
```

第一次循环必然会执行，因为第一次执行在条件检验之前。

在循环中的任务的 taskReferenceName 都会添加 _i 的后缀，其中 i 为循环的索引，从 1 开始。

允许将循环中的任务的输出来作为条件，例如 $.LoopTask['iteration'] < $.value 。

只要有一次循环失败了，DO_WHILE 任务就失败了。

不允许在 DO_WHILE 中嵌套 DO_WHILE。

## Dynamic

## Dynamic Fork

## Fork
任务类型为 FORK_JOIN ，能够并行执行多个任务，通常和 JOIN 一起使用以实现汇聚的目的。它的配置如下：
```json
{
    "name": "", // 任务名称。必填
    "taskReferenceName": "", // 任务别名，在当前流程中必须唯一。必填
    "type": "FORK_JOIN", // 任务类型。必填
    "forkTasks": [] // 需要并行执行的 Task 配置集合。必填
}
```

## Join
任务类型为 JOIN ，通常和 FORK_JOIN 一起使用以实现汇聚的目的。它的配置如下：
```json
{
    "name": "", // 任务名称。必填
    "taskReferenceName": "", // 任务别名，在当前流程中必须唯一。必填
    "type": "JOIN", // 任务类型。必填
    "joinOn": [] // 需要汇聚的任务别名集合。必填
}
```

## Set Variable

## Start Workflow

## Sub Workflow

## Switch
任务类型为 SWITCH ，能够根据条件来选择流程的流向。它的配置如下：
```json
{
    "name": "", // 任务名称。必填
    "taskReferenceName": "", // 任务别名，在当前流程中必须唯一。必填
    "type": "SWITCH", // 任务类型。必填
    "inputParameters": {}, // 任务的输入参数。必填
    "evaluatorType": "", // 条件解析类型，value-param（值选择） 或 javascript（JS代码）。必填
    "expression": "", // 当 evaluatorType 为 value-param，固定为 switchCaseValue 。当 evaluatorType 为 javascript（JS代码），为用户输入的 JS 表达式。必填
    "decisionCases": [], // 已经匹配的条件以及对应的 Task 配置。必填
    "defaultCase": [] // 没有匹配的条件以及对应的 Task 配置。必填
}
```

## Terminate
任务类型为 TERMINATE ，能够根据条件来提前结束流程并且设置状态以及输出结果，和 return 类似。它的配置如下：
```json
{
    "terminationStatus": "", // 结束状态， COMPLETED 或者 FAILED 。必填
    "workflowOutput": {}, // 输出结果。选填
    "terminationReason": "" // 结束原因。选填
}
```

可以结合 SWITCH 任务来实现根据条件来判断是否要提前结束流程。