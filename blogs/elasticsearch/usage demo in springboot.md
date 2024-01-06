# 【搜索引擎-Elasticsearch】基于SpringBoot的使用示例
这里使用的是SpringBoot的`3.0.2`版本。

## 在 pom.xml 中添加依赖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
</dependency>
```

## 在application.properties中添加配置
```properties
spring.elasticsearch.uris=http://127.0.0.1:9200
spring.elasticsearch.socket-timeout=10s
spring.elasticsearch.username=elastic
spring.elasticsearch.password=888888
```

## 创建文档数据实体测试类
```java
public class DemoDoc {
    private String id;
    private String name;
    private String content;
    private int num;

    // TODO getter 、 setter 和 constructor
}
```

## 使用动态映射创建索引
```java
@Autowired
private ElasticsearchClient elasticsearchClient;

@PostMapping("/demo")
public Boolean demo() throws IOException {
    CreateIndexResponse response = elasticsearchClient.indices().create(c ->
            c.index("demo_index"));
    return response.acknowledged();
}
```

## 使用显式映射创建索引
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
                            .properties("content", Property.of(p -> p.text(TextProperty.of(t -> t.index(true)))))
                            .properties("num", Property.of(p -> p.integer(IntegerNumberProperty.of(i -> i.index(true)))))
            ));
    return response.acknowledged();
}
```

## 删除索引
```java
@Autowired
private ElasticsearchClient elasticsearchClient;

@DeleteMapping("/demo")
public void demo() throws IOException {
    elasticsearchClient.indices().delete(c -> c.index("demo_index"));
}
```

## 创建文档
```java
@Autowired
private ElasticsearchClient elasticsearchClient;

@PostMapping("/demo")
public String demo() throws IOException {
    DemoDoc demoDoc = new DemoDoc("aa", "bb", "cc", 1);
    IndexResponse response = elasticsearchClient.index(i -> i.index("demo_index").id(demoDoc.getId()).document(demoDoc));
    return response.result().toString();
}
```

## 删除文档
```java
@Autowired
private ElasticsearchClient elasticsearchClient;

@DeleteMapping("/demo")
public void demo() throws IOException {
    elasticsearchClient.delete(i -> i.index("demo_index").id("aa"));
}
```

## 根据文档ID查询文档数据
```java
@Autowired
private ElasticsearchClient elasticsearchClient;

@GetMapping("/demo")
public DemoDoc demo() throws IOException {
    GetResponse<DemoDoc> response = elasticsearchClient.get(g -> g.index("demo_index").id("aa"), DemoDoc.class);
    if (response.found()) {
        return response.source();
    } else {
        return null;
    }
}
```

## 使用 match 进行精确匹配
```java
@Autowired
private ElasticsearchClient elasticsearchClient;

@GetMapping("/demo")
public List<DemoDoc> demo(@RequestParam("name") String name) throws IOException {
    SearchResponse<DemoDoc> response = elasticsearchClient.search(s -> s
            .index("demo_index")
            .query(q -> q
                    .match(t -> t
                            .field("name")
                            .query(name)
                    )
            ), DemoDoc.class);
    return response.hits().hits().stream().map(hit -> hit.source()).collect(Collectors.toList());
}
```

## 使用 wildcard 进行模糊匹配
```java
@Autowired
private ElasticsearchClient elasticsearchClient;

@GetMapping("/demo")
public List<DemoDoc> demo(@RequestParam("name") String name) throws IOException {
    SearchResponse<DemoDoc> response = elasticsearchClient.search(s -> s
            .index("demo_index")
            .query(q -> q
                    .wildcard(t -> t
                            .field("name")
                            .wildcard("*" + name + "*"))// 使用 * 来进行模糊匹配
            ), DemoDoc.class);
    return response.hits().hits().stream().map(hit -> hit.source()).collect(Collectors.toList());
}
```

## 使用 from + size 进行分页查询过滤后的前 1 万条数据，使用 search_after 进行分页查询过滤后的 1 万条之后的数据
注意： 使用 from 和 size 来实现分页查询时，只能查询过滤后的前 1 万条数据。过滤后的 1 万条之后的数据可以使用 search_after 参数，由于 search_after 参数需要用到上一页返回的 sort 字段数据，所以不能跳转到指定页，只能一页一页的按顺序查，并且在使用 search_after 参数时的 from 字段必须为 0。这里的 sort 字段其实就是排序字段对应的值，所以不管是使用 from 和 size，还是使用 search_after 进行分页时都必须传入排序字段。

```java
@Autowired
private ElasticsearchClient elasticsearchClient;

@PostMapping("/demo")// 分页查询
public Map<String, Object> demo(@RequestParam("name") String name,
                                @RequestParam("currentPage") Integer currentPage,
                                @RequestParam("pageSize") Integer pageSize,
                                @RequestBody List<Long> body) throws IOException {
    if (currentPage * pageSize <= 10000) {// 使用 from 和 size 来实现分页查询，但是只能查询过滤后的前 1 万条数据
        SearchResponse<DemoDoc> response = elasticsearchClient.search(s -> s
                .index("demo_index")
                .query(q -> q
                        .wildcard(t -> t
                                .field("name")
                                .wildcard("*" + name + "*"))
                )
                .from((currentPage - 1) * pageSize)
                .size(pageSize)
                .sort(SortOptions.of(so -> so.field(f -> f.field("num").order(SortOrder.Asc)))), DemoDoc.class);
        HitsMetadata<DemoDoc> hits = response.hits();
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("currentPage", currentPage);
        result.put("pageSize", pageSize);
        result.put("data", hits.hits().stream().map(hit -> hit.source()).collect(Collectors.toList()));
        result.put("total", hits.total().value());
        // 返回 sort ，用于下一次查询过滤后的超过前 1 万条数据。这里的 sort 就是当前返回结果的最后一条记录中的排序字段的值，如果有多个排序字段，那么就会有多个
        List<Long> sort = hits.hits().get(hits.hits().size() - 1).sort().stream().map(e -> e.longValue()).collect(Collectors.toList());
        result.put("sort", sort);
        return result;
    } else {// 使用 search_after 来实现查询过滤后的超过前 1 万条数据
        SearchResponse<DemoDoc> response = elasticsearchClient.search(s -> s
                .index("demo_index")
                .query(q -> q
                        .wildcard(t -> t
                                .field("name")
                                .wildcard("*" + name + "*"))
                )
                .from(0)// 必须为 0
                .size(pageSize)
                .searchAfter(body.stream().map(e -> FieldValue.of(e)).collect(Collectors.toList()))// 使用 searchAfter 参数以及上一次查询返回的 sort 来查询过滤后的超过前 1 万条数据
                .sort(SortOptions.of(so -> so.field(f -> f.field("num").order(SortOrder.Asc)))), DemoDoc.class);
        HitsMetadata<DemoDoc> hits = response.hits();
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("currentPage", currentPage);
        result.put("pageSize", pageSize);
        result.put("data", hits.hits().stream().map(hit -> hit.source()).collect(Collectors.toList()));
        result.put("total", hits.total().value());
        List<Long> sort = hits.hits().get(hits.hits().size() - 1).sort().stream().map(e -> e.longValue()).collect(Collectors.toList());
        result.put("sort", sort);
        return result;
    }
}
```