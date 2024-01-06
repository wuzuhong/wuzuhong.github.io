# 【流程引擎-Flowable】Flowable使用示例

## 流程设计示例

#### 会签流程

需要注意：
* 任务1为会签任务，任务2为普通任务
* `flowable:assignee`参数表示任务处理人。`isSequential`参数表示是并行会签还是串行会签。`flowable:collection`参数表示会签人员集合，需要在流程启动时采用流程变量的形式进行设置。`flowable:elementVariable`参数表示对会签人员集合遍历后设置的字段，通常会与任务处理人保持一致。`${nrOfCompletedInstances/nrOfInstances&gt;=0.5}`表示完成条件为大于等于50%的会签人员完成了自己的任务就代表这个会签任务完成了。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:flowable="http://flowable.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" typeLanguage="http://www.w3.org/2001/XMLSchema" expressionLanguage="http://www.w3.org/1999/XPath" targetNamespace="http://www.flowable.org/processdef">
  <process id="DEMO_PROCESS" name="DEMO_PROCESS" isExecutable="true">
    <startEvent id="startEvent1" flowable:formFieldValidation="true"></startEvent>
    <userTask id="sid-68B49661-E99F-4F55-B2B1-2DB431A43800" name="任务1" flowable:assignee="${assignee}" flowable:formFieldValidation="true">
      <extensionElements>
        <modeler:initiator-can-complete xmlns:modeler="http://flowable.org/modeler"><![CDATA[false]]></modeler:initiator-can-complete>
      </extensionElements>
      <multiInstanceLoopCharacteristics isSequential="false" flowable:collection="assigneeList" flowable:elementVariable="assignee">
        <completionCondition>${nrOfCompletedInstances/nrOfInstances&gt;=0.5}</completionCondition>
      </multiInstanceLoopCharacteristics>
    </userTask>
    <sequenceFlow id="sid-3FF23E94-5C09-4A3B-AE50-EC24F373C4F5" sourceRef="startEvent1" targetRef="sid-68B49661-E99F-4F55-B2B1-2DB431A43800"></sequenceFlow>
    <userTask id="sid-4B932DAD-43AE-4D48-8E33-5013C47B3FAC" name="任务2" flowable:assignee="user2" flowable:formFieldValidation="true">
      <extensionElements>
        <modeler:initiator-can-complete xmlns:modeler="http://flowable.org/modeler"><![CDATA[false]]></modeler:initiator-can-complete>
      </extensionElements>
    </userTask>
    <sequenceFlow id="sid-0ACE8CED-F1E2-4C49-A04E-FB21ACDEA8A5" sourceRef="sid-68B49661-E99F-4F55-B2B1-2DB431A43800" targetRef="sid-4B932DAD-43AE-4D48-8E33-5013C47B3FAC"></sequenceFlow>
    <endEvent id="sid-83D058FE-1C23-41FF-97E9-52306A1536A5"></endEvent>
    <sequenceFlow id="sid-6623373C-F9AE-448F-87B6-0CE382FC0A52" sourceRef="sid-4B932DAD-43AE-4D48-8E33-5013C47B3FAC" targetRef="sid-83D058FE-1C23-41FF-97E9-52306A1536A5"></sequenceFlow>
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_DEMO_PROCESS">
    <bpmndi:BPMNPlane bpmnElement="DEMO_PROCESS" id="BPMNPlane_DEMO_PROCESS">
      <bpmndi:BPMNShape bpmnElement="startEvent1" id="BPMNShape_startEvent1">
        <omgdc:Bounds height="30.0" width="30.0" x="100.0" y="163.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="sid-68B49661-E99F-4F55-B2B1-2DB431A43800" id="BPMNShape_sid-68B49661-E99F-4F55-B2B1-2DB431A43800">
        <omgdc:Bounds height="80.0" width="100.0" x="175.0" y="138.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="sid-4B932DAD-43AE-4D48-8E33-5013C47B3FAC" id="BPMNShape_sid-4B932DAD-43AE-4D48-8E33-5013C47B3FAC">
        <omgdc:Bounds height="80.0" width="100.0" x="330.0" y="135.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="sid-83D058FE-1C23-41FF-97E9-52306A1536A5" id="BPMNShape_sid-83D058FE-1C23-41FF-97E9-52306A1536A5">
        <omgdc:Bounds height="28.0" width="28.0" x="465.0" y="161.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge bpmnElement="sid-3FF23E94-5C09-4A3B-AE50-EC24F373C4F5" id="BPMNEdge_sid-3FF23E94-5C09-4A3B-AE50-EC24F373C4F5">
        <omgdi:waypoint x="129.9499984899576" y="178.0"></omgdi:waypoint>
        <omgdi:waypoint x="174.9999999999917" y="178.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="sid-0ACE8CED-F1E2-4C49-A04E-FB21ACDEA8A5" id="BPMNEdge_sid-0ACE8CED-F1E2-4C49-A04E-FB21ACDEA8A5">
        <omgdi:waypoint x="274.9499999999995" y="177.0322580645161"></omgdi:waypoint>
        <omgdi:waypoint x="330.0" y="175.96677419354836"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="sid-6623373C-F9AE-448F-87B6-0CE382FC0A52" id="BPMNEdge_sid-6623373C-F9AE-448F-87B6-0CE382FC0A52">
        <omgdi:waypoint x="429.95000000000005" y="175.0"></omgdi:waypoint>
        <omgdi:waypoint x="465.0" y="175.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>
```

#### 调用子流程

需要注意：
* 子流程通常分为嵌套子流程和调用子流程。调用子流程的使用场景通常为跨部门协作，当A部门的流程需要走B部门流程，但是A部门流程又不清楚B部门的流程是啥样的，这个时候A部门的流程就可以使用引用B部门的流程作为它的调用子流程。调用子流程的另一个作用就是流程复用。嵌套子流程的作用就是可以折叠，让一个复杂的流程更加清晰。
* `calledElement`参数表示调用子流程的标识。`flowable:calledElementType`参数表示调用子流程的标识类型。`source`参数表示输入参数在当前流程的流程变量。`target`参数表示输入参数在子流程的流程变量，与`source`是对应的。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:flowable="http://flowable.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" typeLanguage="http://www.w3.org/2001/XMLSchema" expressionLanguage="http://www.w3.org/1999/XPath" targetNamespace="http://www.flowable.org/processdef">
  <process id="DEMO_PROCESS_WITH_CHILD" name="DEMO_PROCESS_WITH_CHILD" isExecutable="true">
    <startEvent id="startEvent1" flowable:formFieldValidation="true"></startEvent>
    <userTask id="sid-FCC03139-5216-4B7D-82C6-E20E4B49F9EE" name="用户任务0" flowable:assignee="user0" flowable:formFieldValidation="true">
      <extensionElements>
        <modeler:initiator-can-complete xmlns:modeler="http://flowable.org/modeler"><![CDATA[false]]></modeler:initiator-can-complete>
      </extensionElements>
    </userTask>
    <sequenceFlow id="sid-B40A6A16-4A73-40B5-B838-63D0A4CBEAD3" sourceRef="startEvent1" targetRef="sid-FCC03139-5216-4B7D-82C6-E20E4B49F9EE"></sequenceFlow>
    <callActivity id="sid-972AC3BE-C69B-4076-84C6-87362F3DE9F0" name="调用子流程" calledElement="DEMO_PROCESS:2:09453f00-783b-11ed-88c2-7c10c923bb6d" flowable:calledElementType="id" flowable:fallbackToDefaultTenant="false">
      <extensionElements>
        <flowable:in source="assigneeList" target="assigneeList"></flowable:in>
      </extensionElements>
    </callActivity>
    <sequenceFlow id="sid-692C6DD2-B500-4CC5-A566-FC42B3852A3C" sourceRef="sid-FCC03139-5216-4B7D-82C6-E20E4B49F9EE" targetRef="sid-972AC3BE-C69B-4076-84C6-87362F3DE9F0"></sequenceFlow>
    <userTask id="sid-D3495ABF-E602-4758-85D4-9F74093447DD" name="用户任务3" flowable:assignee="user3" flowable:formFieldValidation="true">
      <extensionElements>
        <modeler:initiator-can-complete xmlns:modeler="http://flowable.org/modeler"><![CDATA[false]]></modeler:initiator-can-complete>
      </extensionElements>
    </userTask>
    <sequenceFlow id="sid-9C744E8D-F727-429F-8CDC-F817C41645D1" sourceRef="sid-972AC3BE-C69B-4076-84C6-87362F3DE9F0" targetRef="sid-D3495ABF-E602-4758-85D4-9F74093447DD"></sequenceFlow>
    <endEvent id="sid-57C60AC7-ED92-4E55-8001-7E0507925C20"></endEvent>
    <sequenceFlow id="sid-1EF80CA3-BE86-4256-A5E2-538AD817E6DC" sourceRef="sid-D3495ABF-E602-4758-85D4-9F74093447DD" targetRef="sid-57C60AC7-ED92-4E55-8001-7E0507925C20"></sequenceFlow>
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_DEMO_PROCESS_WITH_CHILD">
    <bpmndi:BPMNPlane bpmnElement="DEMO_PROCESS_WITH_CHILD" id="BPMNPlane_DEMO_PROCESS_WITH_CHILD">
      <bpmndi:BPMNShape bpmnElement="startEvent1" id="BPMNShape_startEvent1">
        <omgdc:Bounds height="30.0" width="30.0" x="330.0" y="235.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="sid-FCC03139-5216-4B7D-82C6-E20E4B49F9EE" id="BPMNShape_sid-FCC03139-5216-4B7D-82C6-E20E4B49F9EE">
        <omgdc:Bounds height="80.0" width="100.0" x="405.0" y="210.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="sid-972AC3BE-C69B-4076-84C6-87362F3DE9F0" id="BPMNShape_sid-972AC3BE-C69B-4076-84C6-87362F3DE9F0">
        <omgdc:Bounds height="80.0" width="100.0" x="560.0" y="210.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="sid-D3495ABF-E602-4758-85D4-9F74093447DD" id="BPMNShape_sid-D3495ABF-E602-4758-85D4-9F74093447DD">
        <omgdc:Bounds height="80.0" width="100.0" x="720.0" y="210.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="sid-57C60AC7-ED92-4E55-8001-7E0507925C20" id="BPMNShape_sid-57C60AC7-ED92-4E55-8001-7E0507925C20">
        <omgdc:Bounds height="28.0" width="28.0" x="865.0" y="236.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge bpmnElement="sid-B40A6A16-4A73-40B5-B838-63D0A4CBEAD3" id="BPMNEdge_sid-B40A6A16-4A73-40B5-B838-63D0A4CBEAD3">
        <omgdi:waypoint x="359.9499984899576" y="250.0"></omgdi:waypoint>
        <omgdi:waypoint x="405.0" y="250.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="sid-9C744E8D-F727-429F-8CDC-F817C41645D1" id="BPMNEdge_sid-9C744E8D-F727-429F-8CDC-F817C41645D1">
        <omgdi:waypoint x="659.9499999998419" y="250.0"></omgdi:waypoint>
        <omgdi:waypoint x="719.9999999999518" y="250.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="sid-1EF80CA3-BE86-4256-A5E2-538AD817E6DC" id="BPMNEdge_sid-1EF80CA3-BE86-4256-A5E2-538AD817E6DC">
        <omgdi:waypoint x="819.949999999996" y="250.0"></omgdi:waypoint>
        <omgdi:waypoint x="865.0" y="250.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="sid-692C6DD2-B500-4CC5-A566-FC42B3852A3C" id="BPMNEdge_sid-692C6DD2-B500-4CC5-A566-FC42B3852A3C">
        <omgdi:waypoint x="504.949999999976" y="250.0"></omgdi:waypoint>
        <omgdi:waypoint x="560.0" y="250.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>
```

## 工程配置示例

#### 依赖
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>2.0.8.RELEASE</version>
    </dependency>
    <dependency>
        <groupId>org.flowable</groupId>
        <artifactId>flowable-spring-boot-starter-process</artifactId>
        <version>6.4.1</version>
        <exclusions>
            <exclusion>
                <groupId>org.flowable</groupId>
                <artifactId>flowable-spring-security</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.28</version>
    </dependency>
</dependencies>
```

#### 配置
```properties
spring.datasource.driver-class-name=
spring.datasource.url=
spring.datasource.username=
spring.datasource.password=
```

## 流程代码示例

#### 部署流程
```java
@PostMapping("/deploy")
public String deploy() throws IOException {
    // 部署流程
    String name = "DEMO_PROCESS_WITH_CHILD.bpmn20.xml";
    String bpmnStr = IoUtil.readFileAsString(name);// 这里也可以让前端直接传字符串过来
    Deployment deployment = repositoryService.createDeployment().name(name).category("demo").tenantId("demo")
            .addString(name, bpmnStr).deploy();
    // 获取部署流程后自动创建的流程定义
    ProcessDefinition process = repositoryService.createProcessDefinitionQuery().deploymentId(deployment.getId())
            .singleResult();
    return process.getId();
}
```

#### 启动流程
```java
@PostMapping("/start")
public String start(@RequestParam("processDefinitionId") String processDefinitionId) throws IOException {
    // 为会签节点添加处理人
    Map<String, Object> variables = new HashMap<String, Object>();
    variables.put("assigneeList", Arrays.asList("user1-1", "user1-2"));
    // 启动流程
    ProcessInstance processInstance = runtimeService.startProcessInstanceById(processDefinitionId, variables);
    return processInstance.getId();
}
```

#### 完成任务
```java
@PostMapping("/complete")
public void complete(@RequestParam("taskId") String taskId) throws IOException {
    // 添加评论，必须在完成任务之前，一个任务可以添加多个评论。动态创建的任务节点不能添加评论，因为评论需要关联流程实例，而动态创建的任务节点不会关联任务的流程实例
    taskService.addComment(taskId, null, "DemoType", "DemoMessage");
    // 完成任务
    taskService.complete(taskId);
}
```

#### 委托任务
```java
@PostMapping("/delegate")
public void delegate(@RequestParam("taskId") String taskId, @RequestParam("userId") String userId)
        throws IOException {
    // 委托任务
    taskService.delegateTask(taskId, userId);
}
```

#### 处理任务
```java
@PostMapping("/resolve")
public void resolve(@RequestParam("taskId") String taskId) throws IOException {
    // 处理任务。当任务是委托状态时，才调用。处理任务之后，任务会回到委托前的人的手上，然后再调用完成任务，任务才会结束
    taskService.resolveTask(taskId);
}
```

#### 加签
```java
@PostMapping("/addAssignee")
public void addAssignee(@RequestParam("taskId") String taskId) throws IOException {
    Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
    String processInstanceId = task.getProcessInstanceId();
    String activityId = task.getTaskDefinitionKey();
    // 加签
    List<String> users = Arrays.asList("user3-1", "user3-2");
    for (String user : users) {
        Map<String, Object> variables = new HashMap<String, Object>();
        variables.put("assignee", user);
        runtimeService.addMultiInstanceExecution(activityId, processInstanceId, variables);
    }
}
```

#### 减签
```java
@PostMapping("/deleteAssignee")
public void deleteAssignee(@RequestParam("executionId") String executionId) throws IOException {
    // 减签。建议在前端查询已存在的待办人时返回executionId
    runtimeService.deleteMultiInstanceExecution(executionId, true);
}
```

#### 挂起
```java
@PostMapping("/suspend")
public void suspend(@RequestParam("processInstanceId") String processInstanceId) throws IOException {
    // 挂起
    runtimeService.suspendProcessInstanceById(processInstanceId);
}
```

#### 激活
```java
@PostMapping("/activate")
public void activate(@RequestParam("processInstanceId") String processInstanceId) throws IOException {
    // 激活
    runtimeService.activateProcessInstanceById(processInstanceId);
}
```

#### 回退到上个节点
```java
@PostMapping("/back")
public void back(@RequestParam("taskId") String taskId) throws IOException {
    // 获取任务对象
    Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
    // 获取流程实例对象
    String processInstanceId = task.getProcessInstanceId();
    // 获取当前任务的节点ID
    String curActId = task.getTaskDefinitionKey();
    // 获取bpmn模型对象
    BpmnModel bpmnModel = repositoryService.getBpmnModel(task.getProcessDefinitionId());
    // 获取当前流程节点对象
    FlowNode flowNode = (FlowNode) bpmnModel.getFlowElement(curActId);
    // 获取当前流程节点的输入连线
    List<SequenceFlow> incomingFlows = flowNode.getIncomingFlows();
    // 获取当前节点的上一个节点
    String prevActId = incomingFlows.get(0).getSourceRef();
    // 回退到上一个节点
    runtimeService.createChangeActivityStateBuilder().processInstanceId(processInstanceId).moveActivityIdTo(curActId, prevActId).changeState();
}
```

#### 驳回到流程定义中的第一个节点
```java
@PostMapping("/reject")
public void reject(@RequestParam("taskId") String taskId) throws IOException {
    // 获取任务对象
    Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
    // 获取当前任务的节点ID
    String curActId = task.getTaskDefinitionKey();
    // 获取bpmn模型对象
    BpmnModel bpmnModel = repositoryService.getBpmnModel(task.getProcessDefinitionId());
    // 获取bpmn模型中的流程定义集合
    List<Process> processes = bpmnModel.getProcesses();
    // 当前测试的bpmn模型对象中只会存在一个流程定义
    Process process = processes.get(0);
    // 获取流程定义中的所有流程元素（乱序），包括开始节点、连线、任务节点和结束节点，
    Collection<FlowElement> flowElements = process.getFlowElements();
    // 获取开始事件节点
    StartEvent startEvent = (StartEvent) flowElements.stream().filter(flowElement -> flowElement instanceof StartEvent).findFirst().get();
    // 获取第一个节点ID
    String firstActId = startEvent.getOutgoingFlows().get(0).getTargetRef();
    // 驳回到流程定义中的第一个节点
    runtimeService.createChangeActivityStateBuilder().processInstanceId(task.getProcessInstanceId()).moveActivityIdTo(curActId, firstActId).changeState();
}
```

#### 转办任务
```java
@PostMapping("/turnTo")
public void turnTo(@RequestParam("taskId") String taskId) throws IOException {
    taskService.setAssignee(taskId, "user2-1");
}
```

#### 终止流程
```java
@PostMapping("/terminate")
public void terminate(@RequestParam("processInstanceId") String processInstanceId) throws IOException {
    runtimeService.deleteProcessInstance(processInstanceId, "system auto delete");
}
```

#### 获取流程定义中的所有节点
```java
@GetMapping("/acts")
public List<String> getActs(@RequestParam("processDefinitionId") String processDefinitionId) throws IOException {
    // 获取bpmn模型对象
    BpmnModel bpmnModel = repositoryService.getBpmnModel(processDefinitionId);
    // 获取bpmn模型中的流程定义集合
    List<Process> processes = bpmnModel.getProcesses();
    // 当前测试的bpmn模型对象中只会存在一个流程定义
    Process process = processes.get(0);
    // 获取流程定义中的所有流程元素（乱序），包括开始节点、连线、任务节点和结束节点，
    Collection<FlowElement> flowElements = process.getFlowElements();
    // 获取所有用户任务的节点ID
    return flowElements.stream().filter(flowElement -> flowElement instanceof UserTask).map(flowElement -> flowElement.getId()).collect(Collectors.toList());
}
```

#### 自由流
```java
@PostMapping("/freeFlow")
public void freeFlow(@RequestParam("processInstanceId") String processInstanceId,
                        @RequestParam("sourceActId") String sourceActId,
                        @RequestParam("targetActId") String targetActId) throws IOException {
    runtimeService.createChangeActivityStateBuilder().processInstanceId(processInstanceId).moveActivityIdTo(sourceActId, targetActId).changeState();
}
```

#### 动态创建任务节点
```java
@PostMapping("/newTask")
public void newTask(@RequestParam("taskId") String taskId) throws IOException {
    // 创建任务节点，不跟任何流程实例关联
    Task newTask1 = taskService.newTask();
    newTask1.setAssignee("user5-1");
    Task newTask2 = taskService.newTask();
    newTask2.setAssignee("user5-2");
    // 如果这些动态创建的任务节点都完成后需要回到源节点，则需要将源节点的ID设置为其父任务ID
    newTask1.setParentTaskId(taskId);
    newTask2.setParentTaskId(taskId);
    // 持久化任务节点
    taskService.saveTask(newTask1);
    taskService.saveTask(newTask2);
}
```

#### 获取子任务数量
```java
@GetMapping("/subTaskCount")
public int getSubTaskCount(@RequestParam("taskId") String taskId) throws IOException {
    return taskService.getSubTasks(taskId).size();
}
```

#### 获取待办任务
```java
@GetMapping("/todoList")
public List<String> getTodoList(@RequestParam("userId") String userId) throws IOException {
    return taskService.createTaskQuery().taskAssignee(userId).list().stream().map(task -> task.getId())
            .collect(Collectors.toList());
}
```

#### 获取已办任务
```java
@GetMapping("/doneList")
public List<String> getDoneList(@RequestParam("userId") String userId) throws IOException {
    return historyService.createHistoricTaskInstanceQuery().taskAssignee(userId).finished().list().stream().map(task -> task.getId())
            .collect(Collectors.toList());
}
```

## 事件监听器示例

#### 实现自定义事件监听器
```java
import org.flowable.common.engine.api.delegate.event.FlowableEngineEventType;
import org.flowable.common.engine.api.delegate.event.FlowableEvent;
import org.flowable.common.engine.api.delegate.event.FlowableEventListener;
import org.flowable.engine.delegate.event.impl.FlowableEntityEventImpl;
import org.flowable.task.service.impl.persistence.entity.TaskEntityImpl;

/*
 * 全局的事件监听器
 */
public class DemoEventListener implements FlowableEventListener {

	@Override
	public void onEvent(FlowableEvent event) {
        // 判断事件类型为任务完成事件
		if (event.getType().equals(FlowableEngineEventType.TASK_COMPLETED)) {
			FlowableEntityEventImpl flowableEntityEvent = (FlowableEntityEventImpl) event;
			TaskEntityImpl task = (TaskEntityImpl) flowableEntityEvent.getEntity();
			String id = task.getId();
			System.out.println(id);
		}
	}

	@Override
	public boolean isFailOnException() {
		return false;
	}

	@Override
	public boolean isFireOnTransactionLifecycleEvent() {
		return false;
	}

	@Override
	public String getOnTransaction() {
		return null;
	}

}
```

#### 将自定义事件监听器添加到 Flowable 事件监听器集合中
```java
import java.util.ArrayList;
import java.util.List;

import org.flowable.common.engine.api.delegate.event.FlowableEventListener;
import org.flowable.spring.SpringProcessEngineConfiguration;
import org.flowable.spring.boot.EngineConfigurationConfigurer;

public class DemoEngineConfigurationConfigurer implements EngineConfigurationConfigurer<SpringProcessEngineConfiguration> {

	public void configure(SpringProcessEngineConfiguration processEngineConfiguration) {
		List<FlowableEventListener> eventListeners = processEngineConfiguration.getEventListeners();
		if (eventListeners == null) {
			eventListeners = new ArrayList<FlowableEventListener>();
		}
		eventListeners.add(new DemoEventListener());
		processEngineConfiguration.setEventListeners(eventListeners);
	}

}
```

#### 自动配置类
```java
import org.flowable.spring.SpringProcessEngineConfiguration;
import org.flowable.spring.boot.EngineConfigurationConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DemoConfig {

	@Bean
	public EngineConfigurationConfigurer<SpringProcessEngineConfiguration> engineConfigurationConfigurer() {
		return new DemoEngineConfigurationConfigurer();
	}

}
```

#### 将自动配置类添加到 META-INF/spring.factories 中以实现自动配置
```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  demo.flowable.DemoConfig
```
