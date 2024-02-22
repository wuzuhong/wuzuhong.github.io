function getBlog(){
	return blog = {"content": "# 【prometheus】Prometheus的alert产生过程和AlertManager告警处理流程\n## Prometheus的alert产生过程：\n1. prometheus根据evaluation_interval的时间配置，周期性的对自定义的alerting rules的表达式进行检验，若表达式符合，则产生一条pendding状态的alert。\n2. 若在alerting rules的for字段中定义了一定的时长，则当前alert必须维持pendding状态直到超过这个时长之后才会变为firing状态，而维持pendding状态的前提条件是在这个时长中的每次对表达式进行的检验都是符合的，变为firing状态的alert将会发送给alertmanager（需要在prometheus中配置alertmanager https://prometheus.io/docs/prometheus/latest/configuration/configuration/）.\n3. firing和pendding状态都称为活跃状态。若某次alerting rules的表达式检验不通过，则会使alert的状态变为非活跃状态。firing和非活跃状态都会以alert的形式发送给alertmanager，alert中不会有状态字段，但是会带上startAt和endAt时间戳，并且会以一定的持续发送。\n\n## AlertManager告警处理流程：\n1. prometheus调用alertmanager的rest api来插入alert，其中的body数据会带上startAt和endAt时间戳（alertmanager是通过将endAt和当前时间进行比较来判断alert是否已被解决的，若endAt小于当前时间，则认为alert已被解决，并将当前alert标记为resolved。startAt和endAt是可选的，若未指定startAt，alertmanager会将其设置为当前时间；若未指定endAt，alertmanager将会将其设置为当前时间 + resolve_timeout，并且在这种情况下，持续发送过来的alert将会刷新endAt。而prometheus给alertmanager发送的alert中startAt和endAt都会有，因此resolve_timeout将会不生效）。当然也可以自己实现一个alertmanager client来向alertmanager中插入alert，但需要符合alertmanager的rest api的格式要求 https://prometheus.io/docs/alerting/clients/。\n2. alertmanager接收到alert，根据labels判断属于哪些route（可存在多个route，一个route有多个group，一个group有多个alert）。\n3. 将alert分配到group中，没有则新建group。\n4. 新的group等待group_wait指定的时间（等待时可能收到同一group的alert），然后发送webhook或者其他通知。\n5. 已有的group（包括resolved的alert）等待group_interval指定的时间，然后判断alert是否解决，若已解决则发送通知，若没有解决并且当上次发送通知到现在的间隔大于repeat_interval会发送重复通知。\n", "title": "【prometheus】Prometheus的alert产生过程和AlertManager告警处理流程"}
}