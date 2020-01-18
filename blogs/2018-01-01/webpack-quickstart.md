# 【webpack3】入门
## 概述
### 什么是webpack
* Webpack是一个模块打包器(bundler)。
* 在Webpack看来, 前端的所有资源文件(js/json/css/img/less/...)都会作为模块处理
* 它将根据模块的依赖关系进行静态分析，生成对应的静态资源

### 核心概念
* 入口(entry)：指示 webpack 应该使用哪个模块，来作为构建其内部依赖图的开始。进入入口起点后，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的。
* 输出(output)：告诉 webpack 在哪里输出它所创建的 bundles，以及如何命名这些文件，默认值为 ./dist
* loader
* 插件(plugins)

### 理解Loader
* Webpack 本身只能加载JS/JSON模块，如果要加载其他类型的文件(模块)，就需要使用对应的loader 进行转换/加载
* Loader 本身也是运行在 node.js 环境中的 JavaScript 模块
* 它本身是一个函数，接受源文件作为参数，返回转换的结果
* loader 一般以 xxx-loader 的方式命名，xxx 代表了这个 loader 要做的转换功能，比如 json-loader。

### 配置文件(默认)
* webpack.config.js : 是一个node模块，返回一个 json 格式的配置信息对象

### 插件
* 插件件可以完成一些loader不能完成的功能。
* 插件的使用一般是在 webpack 的配置信息 plugins 选项中指定。
* CleanWebpackPlugin: 自动清除指定文件夹资源
* HtmlWebpackPlugin: 自动生成HTML文件
* UglifyJSPlugin: 压缩js文件