# 【微服务—kong】自定义插件
## 自定义插件的目录结构
一个插件就是一个文件夹，其中一些文件，以下就是my-plugin这个插件的文件目录示例：
```
my-plugin
├── api.lua
├── daos.lua
├── handler.lua
├── migrations
│   ├── cassandra.lua
│   └── postgres.lua
└── schema.lua
```
其中handler.lua和schema.lua是必须的，其他都是可选的。

## api.lua
这个文件是用于编写自定义的接口，可以通过kong管理端口来访问。
示例代码：
```
local endpoints = require "kong.api.endpoints"

local credentials_schema = kong.db.keyauth_credentials.schema
local consumers_schema = kong.db.consumers.schema

return {
  ["/consumers/:consumers/key-auth"] = {
    schema = credentials_schema,
    methods = {
      GET = endpoints.get_collection_endpoint(
              credentials_schema, consumers_schema, "consumer"),

      POST = endpoints.post_collection_endpoint(
              credentials_schema, consumers_schema, "consumer"),
    },
  },
}
```

## postgres.lua
如果是用的PostgreSQL数据库，则在migrations文件夹下编写postgres.lua文件，如果是用的Cassandra数据库，则在migrations文件夹下编写cassandra.lua文件，这两个文件只一般需要编写一个即可，用于在kong启动时自动创建我们自定义的数据库表，示例代码：
cassandra.lua
```
return {
  {
    name = "2015-07-31-172400_init_keyauth",
    up =  [[
      CREATE TABLE IF NOT EXISTS keyauth_credentials(
        id uuid,
        consumer_id uuid,
        key text,
        created_at timestamp,
        PRIMARY KEY (id)
      );

      CREATE INDEX IF NOT EXISTS ON keyauth_credentials(key);
      CREATE INDEX IF NOT EXISTS keyauth_consumer_id ON keyauth_credentials(consumer_id);
    ]],
    down = [[
      DROP TABLE keyauth_credentials;
    ]]
  }
}
```
postgres.lua
```
return {
  {
    name = "2015-07-31-172400_init_keyauth",
    up = [[
      CREATE TABLE IF NOT EXISTS keyauth_credentials(
        id uuid,
        consumer_id uuid REFERENCES consumers (id) ON DELETE CASCADE,
        key text UNIQUE,
        created_at timestamp without time zone default (CURRENT_TIMESTAMP(0) at time zone 'utc'),
        PRIMARY KEY (id)
      );

      DO $$
      BEGIN
        IF (SELECT to_regclass('public.keyauth_key_idx')) IS NULL THEN
          CREATE INDEX keyauth_key_idx ON keyauth_credentials(key);
        END IF;
        IF (SELECT to_regclass('public.keyauth_consumer_idx')) IS NULL THEN
          CREATE INDEX keyauth_consumer_idx ON keyauth_credentials(consumer_id);
        END IF;
      END$$;
    ]],
    down = [[
      DROP TABLE keyauth_credentials;
    ]]
  }
}
```

## daos.lua
这个文件用于定义我们的自定义实体，需要与数据库表相对应。
示例代码：
```
local SCHEMA = {
  primary_key = {"id"},
  table = "keyauth_credentials", -- the actual table in the database
  fields = {
    id = {type = "id", dao_insert_value = true}, -- a value to be inserted by the DAO itself (think of serial ID and the uniqueness of such required here)
    created_at = {type = "timestamp", immutable = true, dao_insert_value = true}, -- also interted by the DAO itself
    consumer_id = {type = "id", required = true, foreign = "consumers:id"}, -- a foreign key to a Consumer's id
    key = {type = "string", required = false, unique = true} -- a unique API key
  }
}

return {keyauth_credentials = SCHEMA}
```

## handler.lua
这个文件用于编写我们的逻辑代码，可以在请求的各个生命周期中编写相应的自定义逻辑，示例代码：
```
local BasePlugin = require "kong.plugins.base_plugin"
local CustomHandler = BasePlugin:extend()

function CustomHandler:new()
  CustomHandler.super.new(self, "my-custom-plugin")
end

-- 在kong启动时执行
function CustomHandler:init_worker()
  CustomHandler.super.init_worker(self)
  -- 接下来就是我们自己的逻辑代码
end

-- 在https请求的SSL握手时执行
function CustomHandler:certificate(config)
  CustomHandler.super.certificate(self)
  -- 接下来就是我们自己的逻辑代码
end

-- 在从客户端接收到作为重写阶段处理器时执行并且每一个请求都将会执行，并且只有在当前插件是一个全局插件时才会执行
function CustomHandler:rewrite(config)
  CustomHandler.super.rewrite(self)
  -- 接下来就是我们自己的逻辑代码
end

-- 在请求从客户端到达kong时执行
function CustomHandler:access(config)
  CustomHandler.super.access(self)
  -- 接下来就是我们自己的逻辑代码
end

-- 在响应的header从服务端到达kong时执行
function CustomHandler:header_filter(config)
  CustomHandler.super.header_filter(self)
  -- 接下来就是我们自己的逻辑代码
end

-- 在响应的body从服务端到达kong时执行
function CustomHandler:body_filter(config)
  CustomHandler.super.body_filter(self)
  -- 接下来就是我们自己的逻辑代码
end

-- 在响应的所有数据都从服务端返回给客户端时执行
function CustomHandler:log(config)
  CustomHandler.super.log(self)
  -- 接下来就是我们自己的逻辑代码
end

return CustomHandler
```

## schema.lua
这个文件用于保存我们自定义插件的配置及其校验信息，这些校验信息可以保证用户只能填写符合我们要求的配置信息
示例代码：
```
local typedefs = require "kong.db.schema.typedefs"
local function check_connect_timeout(config)
  local v = config.connect_timeout
  if v and v < 0 then
    return false, "connect_timeout must >= 0"
  end
  return true
end

return {
  name = "my-plugin",
  fields = {
    { consumer = typedefs.no_consumer },
    { run_on = typedefs.run_on_first },
    { config = {
       type = "record",
	   fields = {	
	      { is_enabled = { type = "boolean", default = true } },
	      { connect_timeout = { type = "number", default = 60 } }
	   },
	   custom_validator = check_connect_timeout,
    }}
  }
}
```

## 如何启用自定义插件
* 首先需要将我们自定义插件的文件夹拷贝到kong的插件目录下 /usr/local/share/lua/5.1/kong/plugins/
* 然后需要在配置文件kong.conf中声明我们的自定义插件
```
# 自定义插件名称。bundled表示kong内置的所有插件
plugins = bundled,my-plugin
```
* 最后在plugin表中插入一条插件，插件名称就是我们自定义插件的文件夹名称，这样我们就成功启用了我们的插件，如果想禁用我们的插件，可以将这条插件删除或者把其中的enable字段改为false即可。

## 在编写自定义插件的handler.lua文件逻辑代码时，会用到的一些kong自带的api
https://docs.konghq.com/1.0.x/pdk/kong.ctx/
https://docs.konghq.com/1.0.x/pdk/kong.request/
https://docs.konghq.com/1.0.x/pdk/kong.response/
https://docs.konghq.com/1.0.x/pdk/kong.service.request/
https://docs.konghq.com/1.0.x/pdk/kong.service.response/  
等等…… 