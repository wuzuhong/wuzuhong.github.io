# 【服务编排-Conductor】系统内置的 Task
系统 Task 或 worker 是通用的、可复用的内置 Task，在 Conductor 服务器上运行。

## Event Task
任务类型为 EVENT ，用于发送事件到 Conductor 内部事件或者消息中间件。

配置参数为：
* sink：外部的事件队列，格式为 prefix:location ，prefix 为 conductor 或 amqp_queue 或 amqp_exchange ， location 为具体的队列名称。
* asyncComplete：是否异步完成， false表示当任务完成后状态就变为COMPLETED，true表示保持任务的IN_PROGRESS的状态并且由外部事件来将其完成。

输出参数为：
```json
{
    "workflowInstanceId": "", // 流程ID
    "workflowType": "", // 流程名称
    "workflowVersion": 1, // 流程版本
    "correlationId": "", // 流程关联ID
    "sink": "", // 和配置参数中的sink一样
    "asyncComplete": false, // 和配置参数中的asyncComplete一样
    "event_produced": "" // 产生的事件名称
}
```

## HTTP Task
任务类型为 HTTP ，用于调用远程HTTP接口并获取响应结果。

输入参数为：
```json
{
    "http_request": {
        "uri": "", // 请求路径。必填
        "method": "", // 请求方式。必填
        "accept": "", // 接收的数据类型，默认为application/json。选填
        "contentType": "", // 发送的数据类型，默认为application/json。选填
        "headers": {}, // 请求头。选填
        "body": {}, // 请求体。选填
        "asyncComplete": false, // 是否异步完成， false表示当任务完成后状态就变为COMPLETED，true表示保持任务的IN_PROGRESS的状态并且由外部事件来将其完成，默认为 false。选填
        "connectionTimeOut": 100, // 连接超时时间，单位为毫秒，默认为 100 毫秒，如果设置为 0 ，则表示永不超时。选填
        "readTimeOut": 150 // 读取超时时间，单位为毫秒，默认为 150 毫秒，如果设置为 0 ，则表示永不超时。选填
    }
}
```

输出参数为：
```json
{
    "response": {}, // 响应体
    "headers": {}, // 响应头
    "statusCode": 200, // 响应状态码
    "reasonPhrase": "" // Http状态码的原因短语
}
```

## Human Task
任务类型为 HUMAN ，用于暂停流程，直到收到外部信号（比如：用户审核通过操作信号）才会继续执行。

通过调用接口`POST` `/api/tasks`去完成用户任务。

## Inline Task
任务类型为 INLINE ，用于在流程运行时执行必要的JS代码逻辑。

## JSON JQ Transform Task
任务类型为 JSON_JQ_TRANSFORM ，能够使用 JQ 来将输入参数转换为新的JSON作为输出参数。

## Kafka Publish Task
任务类型为 KAFKA_PUBLISH ，可以通过 Kafka 将消息推送给其他微服务。

## Wait Task
任务类型为 WAIT ，能够让流程等待一定的时间。