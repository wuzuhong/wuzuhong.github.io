# 【服务编排-Conductor】JSON Schema定义

## Workflow 的 JSON Schema定义
```json
{
    "name": "", // 流程名称。必填
    "description": "", // 流程描述。选填
    "version": 1, // 流程版本。选填，如果不填，则默认自动取最大值
    "tasks": [], // Task配置或Operator配置的对象集合。必填
    "inputParameters": [], // 流程的输入参数（字符串）集合。选填
    "outputParameters": {}, // 流程的输出参数对象。选填，如果不填，则默认为最后一个任务的输出参数
    "inputTemplate": {}, // 默认的输入参数的key和value，如果流程启动的时候，输入参数中不包含某个key，则会自动取对应的默认输入参数的value。选填
    "failureWorkflow": "", // 当前流程执行失败后去执行的流程的名称。选填
    "schemaVersion": 2, // 当前schema的版本。必填，固定为 2
    "restartable": true, // 是否允许流程重启。选填，如果不填，则默认为 true
    "workflowStatusListenerEnabled": false, // 是否开启流程状态事件回调监听器。选填，如果不填，则默认为 false
    "ownerEmail": "", // 流程所有者的邮箱。必填
    "timeoutSeconds": "", // 流程执行的超时时间，如果设置为 0，则永不超时。必填
    "timeoutPolicy": "" // 流程的超时策略，TIME_OUT_WF（超时之后流程会被标记为TIMED_OUT状态并且会被终止）或者ALERT_ONLY（超时之后流程会注册一个计数器并且会打上TIMED_OUT的状态标签）。选填，默认为TIME_OUT_WF
}
```

## Task 配置的JSON Schema定义
Task 配置和Task 定义是有区别的：
* Task 配置：用于使用 Task
* Task 定义：用于注册 Task

```json
{
    "name": "", // 任务名称。必填
    "taskReferenceName": "", // 任务别名，在当前流程中必须唯一。必填
    "type": "", // 任务类型。必填
    "description": "", // 任务描述。选填
    "optional": false, // 是否可选，如果为 true，任务失败后当前流程将会继续执行，默认为 false。选填
    "inputParameters": {}, // 任务的输入参数，inputParameters 和 inputExpression 只能存在一个。选填
    "inputExpression": {}, // 任务的输入参数，inputParameters 和 inputExpression 只能存在一个。选填
    "asyncComplete": false, // 是否异步完成， false表示当任务完成后状态就变为COMPLETED，true表示保持任务的IN_PROGRESS的状态并且由外部事件来将其完成，默认为 false。选填
    "startDelay": 0 // 任务启动延迟时间，单位为秒，默认为 0。选填
}
```