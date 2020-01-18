# 【分布式配置中心—Apollo】基于 java 的分布式配置中心对比
## 分布式配置中心的特性
* **中心化管理**：所有应用的配置都在同一个地方进行修改，而不需要进入应用内部进行多次修改
* **配置共享**：多个应用能够共享一份配置，也能够对其进行覆盖
* **实时生效**：配置修改后能够实时生效，而不需要重启应用
* **权限管理**：配置修改不当可能会影响应用的可用性，因此需要严格的权限管理

## Apollo 、 Nacos 、 Spring Cloud Config 三大分布式配置中心对比
<table border="0" cellpadding="0" cellspacing="0" width="1185" style="border-collapse:
 collapse;table-layout:fixed;width:889pt">
 <colgroup><col class="xl71" width="91" style="mso-width-source:userset;mso-width-alt:2912;
 width:68pt">
 <col width="341" span="2" style="mso-width-source:userset;mso-width-alt:10912;
 width:256pt">
 <col width="412" style="mso-width-source:userset;mso-width-alt:13184;width:309pt">
 </colgroup><tbody><tr class="xl69" height="24" style="height:18.0pt">
  <td height="24" class="xl68" width="91" style="height:18.0pt;width:68pt">　</td>
  <td class="xl68" width="341" style="border-left:none;width:256pt">Apollo</td>
  <td class="xl68" width="341" style="border-left:none;width:256pt">Nacos</td>
  <td class="xl68" width="412" style="border-left:none;width:309pt">Spring Cloud
  Config</td>
 </tr>
 <tr height="25" style="height:18.75pt">
  <td height="25" class="xl70" width="91" style="height:18.75pt;border-top:none;
  width:68pt">所属团队</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">携程框架部门</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">阿里巴巴中间件团队</td>
  <td class="xl65" width="412" style="border-top:none;border-left:none;width:309pt">Spring
  Cloud团队</td>
 </tr>
 <tr height="25" style="height:18.75pt">
  <td height="25" class="xl70" width="91" style="height:18.75pt;border-top:none;
  width:68pt">开源时间</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">2016-05</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">2018-06</td>
  <td class="xl65" width="412" style="border-top:none;border-left:none;width:309pt">2014-09</td>
 </tr>
 <tr height="25" style="height:18.75pt">
  <td height="25" class="xl70" width="91" style="height:18.75pt;border-top:none;
  width:68pt">配置界面</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">有</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">有</td>
  <td class="xl65" width="412" style="border-top:none;border-left:none;width:309pt">无，可通过
  git 来操作</td>
 </tr>
 <tr height="90" style="height:67.5pt">
  <td height="90" class="xl70" width="91" style="height:67.5pt;border-top:none;
  width:68pt">配置生效</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">实时生效。客户端向服务端进行HTTP长轮询以获取更新，当获取到更新时，客户端调用服务端的接口获取最新配置。生效时间在1s内</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">实时生效。客户端向服务端进行HTTP长轮询以获取更新，当获取到更新时，客户端调用服务端的接口获取最新配置。生效时间在1s内</td>
  <td class="xl65" width="412" style="border-top:none;border-left:none;width:309pt">实时生效。配置是存储在
  git/svn 中的，当配置更新后，会触发 git 的 webhook 来通知服务端刷新配置，然后服务端通知 Spring Cloud Bus
  消息总线，然后 Spring Cloud Bus 消息总线再通知客户端，最后客户端会请求服务端获取最新配置。链路较长，效率低</td>
 </tr>
 <tr height="50" style="height:37.5pt">
  <td height="50" class="xl70" width="91" style="height:37.5pt;border-top:none;
  width:68pt">多语言支持</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">Java、Go、Python等等，并提供了
  Open Api</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">Java、Go、Python等等，并提供了
  Open Api</td>
  <td class="xl65" width="412" style="border-top:none;border-left:none;width:309pt">java，并且只能基于
  SpringBoot 来使用</td>
 </tr>
 <tr height="25" style="height:18.75pt">
  <td height="25" class="xl70" width="91" style="height:18.75pt;border-top:none;
  width:68pt">性能</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">中</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">高</td>
  <td class="xl65" width="412" style="border-top:none;border-left:none;width:309pt">低</td>
 </tr>
 <tr height="25" style="height:18.75pt">
  <td height="25" class="xl70" width="91" style="height:18.75pt;border-top:none;
  width:68pt">版本管理</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">支持</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">支持</td>
  <td class="xl65" width="412" style="border-top:none;border-left:none;width:309pt">基于
  git</td>
 </tr>
 <tr height="36" style="height:27.0pt">
  <td height="36" class="xl70" width="91" style="height:27.0pt;border-top:none;
  width:68pt">可用性</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">客户端有本地文件缓存，配置中心宕机，服务重启无影响</td>
  <td class="xl65" width="341" style="border-top:none;border-left:none;width:256pt">客户端有本地快照文件，配置中心宕机，服务重启无影响</td>
  <td class="xl65" width="412" style="border-top:none;border-left:none;width:309pt">客户端没有本地文件缓存，配置中心宕机，服务无法重启</td>
 </tr>
 <tr height="57" style="height:42.75pt">
  <td height="57" class="xl70" width="91" style="height:42.75pt;border-top:none;
  width:68pt">Spring支持</td>
  <td class="xl66" width="341" style="border-top:none;border-left:none;width:256pt"><font class="font6">支持原生的</font><font class="font7">@Value</font><font class="font6">、</font><font class="font7">@ConfigurationProperties</font><font class="font6">等注解</font></td>
  <td class="xl66" width="341" style="border-top:none;border-left:none;width:256pt"><font class="font6">不支持原生的</font><font class="font7">@Value</font><font class="font6">、</font><font class="font7">@ConfigurationProperties</font><font class="font6">等注解，但有与之对应的</font><font class="font7">@NacosValue</font><font class="font6">、</font><font class="font7">@NacosConfigurationProperties</font><font class="font6">等注解</font></td>
  <td class="xl67" width="412" style="border-top:none;border-left:none;width:309pt">原生支持，但需要基于
  SpringBoot 来使用</td>
 </tr>
 <!--[if supportMisalignedColumns]-->
 <tr height="0" style="display:none">
  <td width="91" style="width:68pt"></td>
  <td width="341" style="width:256pt"></td>
  <td width="341" style="width:256pt"></td>
  <td width="412" style="width:309pt"></td>
 </tr>
 <!--[endif]-->
</tbody></table>

## 为什么选择 Apollo
#### Spring Cloud Config 中无法容忍的缺点
* 客户端没有本地文件缓存，配置中心宕机，服务无法重启
* 需要基于 SpringBoot 来使用，难以适配其他基于原生 Spring 甚至非 Spring 生态开发的应用

#### Nacos 中无法容忍的缺点
* 不支持原生的 @Value 、 @ConfigurationProperties 等注解，需要用户手动修改代码为 @NacosValue 、 @NacosConfigurationProperties 等注解

#### Apollo 中的所有缺点都是可以容忍的
* 组件过多，部署困难？对于运维来说，再多组件也是一键部署，在 k8s 中就更加是一键部署了
* 性能比 Nacos 低？对于配置中心来说，对性能要求不是那么的苛刻，个人认为，新的配置在 5 秒内能够生效都是可以接受的，更何况 Apollo 能够做到 1 秒之内