# 【服务编排-Conductor】Task 定义
Task 配置和Task 定义是有区别的：
* Task 配置：用于使用 Task
* Task 定义：用于注册 Task

## Task 定义的 JSON Schema 定义
```json
{
    "name": "", // 任务名称，必填且唯一
    "description": "", // 任务描述
    "retryCount": 3, // 任务重试次数。默认为 3 ，最大允许为 10
    "retryLogic": "", // 任务重试机制。可选项为 FIXED、EXPONENTIAL_BACKOFF、LINEAR_BACKOFF
    "retryDelaySeconds": 60, // 任务重试延迟。默认为 60 秒
    "timeoutPolicy": 60, // 任务超时机制。可选项为 RETRY、TIME_OUT_WF、ALERT_ONLY。默认为 TIME_OUT_WF
    "timeoutSeconds": 0, // 任务执行的超时时间。单位为秒。如果设置为 0 则表示没有超时
    "responseTimeoutSeconds": 3600, // 当 worker 因为错误或者网络原因导致没有响应的超时时间
    "pollTimeoutSeconds": 0, // worker 获取任务的超时时间
    "inputKeys": [], // 任务期待的输入参数的 key ，用于任务的输入参数文档
    "outputKeys": [], // 任务期待的输出参数的 key ，用于任务的输出参数文档
    "inputTemplate": {}, // 定义默认的输入参数的值
    "concurrentExecLimit": 1, // 能够并发处理的任务数
    "rateLimitFrequencyInSeconds": 1, // 限流周期窗口
    "rateLimitPerFrequency": 1, // 在限流周期窗口中能够给到 workers 的最大任务数
    "ownerEmail": "" // 所有者邮箱
}
```

## 任务并发处理限制
`concurrentExecLimit`限制了任务并发处理的数量。比如有 1000 个任务在队列中等待，有 1000 个 worker 在获取任务来执行，这个时候如果设置`concurrentExecLimit`为 10 ，那么在一开始只会分配 10 个任务给这些 worker 。如果任何一个 worker 完成执行，一个任务将从队列中删除，同时仍然保持当前执行计数为 10。

所以`concurrentExecLimit`一般会设置为 worker 的数量。

## 任务流量限制
`rateLimitFrequencyInSeconds`和`rateLimitPerFrequency`要同时使用，`rateLimitFrequencyInSeconds`设置的是限流周期窗口，`rateLimitPerFrequency`设置的是在每一个限流周期窗口中能够给到 workers 的任务数量。比如设置`rateLimitFrequencyInSeconds`为 5 ，`rateLimitPerFrequency`为 12 ，那么在每个 5 秒时间段内，只会给 worker 分配 12 个任务。