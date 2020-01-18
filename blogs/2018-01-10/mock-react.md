# 【mock】如何在react中使用mock来模拟fetch请求的返回数据
## 首先添加相关js依赖
fetch-mock能够让我们在fetch中使用mock
```
npm install --save-dev fetch-mock mockjs
```

## 然后编写mock数据
mockData.js
```
import pathToRegexp from 'path-to-regexp';
import Mock from 'mockjs';
import constant from '../util/constant';

const Random = Mock.Random;

export default [{
    name: '获取书籍',
    url: pathToRegexp('/books/:id'),
    method: 'GET',
    data: [
        { bookName: Random.cname(), bookId: Random.string("upper", 22) },
        { bookName: Random.cname(), bookId: Random.string("upper", 22) },
        { bookName: Random.cname(), bookId: Random.string("upper", 22) }
    ]
}]
```

## 然后编写mock拦截器
mock.js
```
import fetchMock from 'fetch-mock';
import mockData from './mockData';

fetchMock.config = Object.assign(fetchMock.config, {
  //如果为'always'，则关闭mock。如果为true，则只会拦截匹配的url。
  fallbackToNetwork : true,//'always',true
});

mockData.forEach(md=>{
  if(md){
    fetchMock.mock({name:md.name,matcher:md.url,response:md.data,method:md.method});
  }
})
```

## 然后在App.js中全局引入mock拦截器
```
import './mock/mock';
```

## 最后在使用fetch时，修改其引入方式
```
import isoFetch from "isomorphic-fetch";

//覆盖原生的fetch方法，解决mock不生效的问题
fetch = isoFetch;
```