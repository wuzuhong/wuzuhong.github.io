# 【mysql】根据json类型的列中的某一个key来查询
## 根据json类型的列中的某一个key来查询
```
/*
查询json类型的字段。ext为表中数据格式为json的字段，city为ext字段某一行包含的数据
*/
SELECT * FROM uop_org_instance oi WHERE oi.ext->'$.city'='湖南'
```