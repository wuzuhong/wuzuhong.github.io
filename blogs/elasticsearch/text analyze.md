# 【搜索引擎-Elasticsearch】分词
文本分析是将文本转换成一系列单词的过程，也叫分词。

比如在使用百度搜索引擎进行检索的时候，输入的一段句子会被分割成不同的关键词来关联查询。

## 安装 IK 中文分词器
https://github.com/medcl/elasticsearch-analysis-ik

## 使用显式映射创建索引并给字段指定分词器
```java
@Autowired
private ElasticsearchClient elasticsearchClient;

@PostMapping("/demo")
public Boolean demo() throws IOException {
    CreateIndexResponse response = elasticsearchClient.indices().create(c ->
            c.index("demo_index").mappings(m ->
                    m.dynamic(DynamicMapping.Strict)
                            .properties("id", Property.of(p -> p.text(TextProperty.of(t -> t.index(true)))))
                            .properties("name", Property.of(p -> p.text(TextProperty.of(t -> t.index(true)))))
                            .properties("content", Property.of(p -> p.text(TextProperty.of(t -> t.index(true).analyzer("ik_max_word")))))// 指定分词器
                            .properties("num", Property.of(p -> p.integer(IntegerNumberProperty.of(i -> i.index(true)))))
            ));
    return response.acknowledged();
}
```

## 使用 match 进行分词匹配
```java
@Autowired
private ElasticsearchClient elasticsearchClient;

@GetMapping("/demo")
public List<DemoDoc> demo(@RequestParam("content") String content) throws IOException {
    SearchResponse<DemoDoc> response = elasticsearchClient.search(s -> s
            .index("demo_index")
            .query(q -> q
                    .match(t -> t
                            .field("content")
                            .query(content)
                    )
            ), DemoDoc.class);
    return response.hits().hits().stream().map(hit -> hit.source()).collect(Collectors.toList());
}
```

## 获取分词结果
在使用 match 进行分词匹配之后，如果想让返回的记录中高亮匹配的分词，可以通过[获取分词结果](####获取分词结果)来获取需要高亮的分词文字。

```java
@Autowired
private ElasticsearchClient elasticsearchClient;

@GetMapping("/demo")
public List<String> demo(@RequestParam("content") String content) throws IOException {
    // 获取文本content被分词器转换之后的单词集合
    AnalyzeResponse response = elasticsearchClient.indices().analyze(AnalyzeRequest.of(a -> a.analyzer("ik_max_word").field("content").text(content)));
    return response.tokens().stream().map(e -> e.token()).collect(Collectors.toList());
}
```