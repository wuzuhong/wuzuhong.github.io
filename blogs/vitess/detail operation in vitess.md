# 【Vitess】vitess相关操作的详细说明
## 对vitess中相关对象的操作
当vitess部署完成后，还需要对cell、keyspace、shard、tablet、schema、vschema进行增删改查操作。这些对象的查询操作可以通过vtctl的http请求。schema、vschema的增删改也可以直接通过vtctl的http请求。cell、keyspace、shard、tablet由于需要对k8s中的资源进行操作，所以要分成两种情况：
1. 如果vitess是通过operator方式部署的，则直接修改该operator中的my-vitess.yaml文件中对cell、keyspace、shard、tablet等对象的定义，然后执行 kubectl apply -f my-vitess.yaml 命令对vitess集群进行更新即可。
2. 如果vitess是通过chart部署的，则直接修改该chart中的values.yaml文件对cell、keyspace、shard、tablet等对象的定义，然后执行helm install ../../helm/vitess -f 101_initial_cluster.yaml命令（../../helm/vitess是该chart所在的目录，101_initial_cluster.yaml是更新后的values.yaml文件）对vitess集群进行更新即可。
## vitess中相关对象的关联关系
1. Cell是vitess中最顶级的对象。一个vitess集群中可以有多个cell并且多个cell之间是隔离的。一个cell中可以有多个keyspace。
2. Keyspace相关于mysql中的database。一个keyspace拥有一份shema和一份vschema，schema就是一些用于创建表和初始化数据的sql语句，可以通过vtctl，也可以通过jdbc或者直接在Navicat中执行创建，但创建完成还不够，还需要让vitess感知到这些表，因此还需要创建vschema，vschema可以通过vtctl，也可以通过在k8s中对my-vitess.yaml或values.yaml文件进行修改来创建，在初始化集群之后建议使用vtctl来创建。没有进行切片的keyspace中只有一个shard。被切片后的keyspace拥有多个shard。
3. Shard就是切片，包括两种类型：水平切片和垂直切片。一个shard中包含多个tablet（主从，通常是一个主tablet，和多个从tablet，主tablet宕机了，其他从tablet可以补上来）。
4. Tablet是vitess中最底层的对象。一个tablet由一个mysql服务器和一个vttablet组成。
## 修改vitess中的mysql版本号
在vitess中不会使用当前运行的mysql的版本号，而是需要配置，默认为mysql的版本号是5.5.10-Vitess，如果使用的是mysql: 8.0.16，则需要修改这个版本号为8.0.16，不然jdbc会报错，因为有的变量在mysql8中已经被弃用了，而这时jdbc所获取到的仍然是5.5.10-Vitess，就会导致报错，如果jdbc能正确获取到8.0.16这个版本号，则jdbc也会忽略这些弃用的变量。只需要修改values.yaml文件在vtgate中添加一个额外的flag即可：
```
vtgate:
  serviceType: ClusterIP
  vitessTag: latest
  resources:
    # requests:
    #   cpu: 500m
    #   memory: 512Mi
  extraFlags: {"mysql_server_version":"8.0.16"}  # 就是这里
  secrets: [] # secrets are mounted under /vt/usersecrets/{secretname}
```  
## 在vitess中修改mysql的my.cnf配置文件中的配置以适配mysql:8.0.16
Vitess不会使用my.cnf文件中的配置，而是会自己生成一个配置文件来使用。可以创建一个configmap来对vitess中的mysql进行配置。例如为了适配mysql:8.0.16可以这样配置：
1. 创建一个配置文件（这个文件需要和mysql中的my.cnf中的格式一致，并且必须以.cnf为后缀），内容如下：
```
[mysqld]
default_authentication_plugin = mysql_native_password
secure_file_priv = NULL
character-set-server=utf8
collation-server=utf8_general_ci
[client]
default-character-set=utf8
```

2. 创建configmap，将该文件放在chart的templates目录下，内容如下：
```
apiVersion: v1
data:
  custom-my.cnf: |
    [mysqld]
    default_authentication_plugin = mysql_native_password
    secure_file_priv = NULL
    character-set-server=utf8
    collation-server=utf8_general_ci
    [client]
    default-character-set=utf8
kind: ConfigMap
metadata:
  name: vitess-mysql-config-test
  namespace: default
```

3. 修改values.yaml文件，将vttablet中的extraMyCnf值设置为当前configmap的name：
```
extraMyCnf: vitess-mysql-config-test
```

4. 最后更新vitess集群对应的chart
