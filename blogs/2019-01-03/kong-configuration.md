# 【微服务—kong】配置kong
## 默认配置文件
kong提供了一个默认配置文件kong.conf.default，这个文件位于/etc/kong/目录下，若需要开始配置，则需要将给kong.conf.default改名为kong.conf配置才会生效，通过这个文件可以完成对kong几乎所有的配置。
常用的配置项：
```
# 日志级别
log_level = debug
# 自定义插件名称。bundled表示kong内置的所有插件
plugins = bundled,my-plugin
# lua包路径，只有在这些路径下的库才能被lua脚本引用
lua_package_path = /usr/libs;./?.lua;
# 是否允许kong搜集我们的使用数据，默认为on（允许），如果允许的话会导致调用管理端口的时候超时，因为会向kong的官网发送数据（需要翻墙），所以一般设置为off（不允许）
anonymous_reports = off 
```
更多的配置项请查看kong.conf.default中已注释的配置或者直接查看官方文档 https://docs.konghq.com/1.0.x/configuration/

## 通过环境变量覆盖默认配置文件中的配置项
首先将配置文件中的配置key大写，然后在前面加上KONG_，例如想覆盖log_level这个配置，则环境变量的key就是KONG_LOG_LEVEL

## 自定义环境变量并在lua脚本中读取
若想要读取自定义的环境变量，需要进行以下两步操作：
* 首先需要在nginx.lua文件中定义我们的环境变量key（nginx.lua文件位于/usr/local/share/lua/5.1/kong/templates文件夹下），例如
```
# 这里默认就有，用于定位我们自定义的环境变量应该处于的位置
events {
> if nginx_optimizations then
    worker_connections ${{WORKER_CONNECTIONS}};
    multi_accept on;
> end
}

# 这里是我们自定义的环境变量
env MY_CUSTOM_ENV;

# 这里默认就有，用于定位我们自定义的环境变量应该处于的位置
http {
    include 'nginx-kong.conf';
}
```
* 然后在启动kong的时候使用-e参数将环境变量传递到容器中
```
-e "MY_CUSTOM_ENV=haha"
```
* 最后在lua脚本中读取即可
```
local my_custom_env = os.getenv("MY_CUSTOM_ENV")
```