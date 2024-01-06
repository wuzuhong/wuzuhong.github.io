function getBlog(){
	return blog = {"content": "# 【mysql】根据json类型的列中的某一个key来查询\n## 根据json类型的列中的某一个key来查询\n```\n/*\n查询 json 类型的字段。 author 为 book 表中数据格式为 json 的字段， address 为 author 字段某一行包含的数据\n*/\nSELECT name FROM book WHERE author->'$.address'='xx'\n```", "title": "【mysql】根据json类型的列中的某一个key来查询"}
}