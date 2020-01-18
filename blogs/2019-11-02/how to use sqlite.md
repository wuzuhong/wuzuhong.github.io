# 【React Native】如何使用react-native-sqlite-storage来将数据保存到本地？
react-native-sqlite-storage是sqlite在react native上的实现 https://github.com/andpor/react-native-sqlite-storage

以下是一个示例：
```js
import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true)

function openDB() {
    return SQLite.openDatabase({
        name: 'AA',// 数据库名称
        createFromLocation: "~AA.db",// 数据库文件路径
        location: 'Library'// 存储类型，这个类型主要是用来配置第三方平台的数据同步策略
    });
}

/**
 * @param {String, any} tableName 表名
 * @param {String} id 主键ID
 */
export function selectRowById(tableName, id, onSuccess, onError) {
    const db = openDB();
    db.transaction(tx => {
        const sql = 'SELECT * FROM ' + tableName + ' where id_=?;';
        tx.executeSql(sql, [id], (tx, results) => {
            console.log('success');
            // 可以将db.close()操作放在这里
        }, err => {
            console.log('error:' + err.message);
            // 也可以将db.close()操作放在这里
        });
    });
    // 注意：这里千万不能写这一行将数据库关闭，不然会出问题，因为所有db操作都是异步的
    // db.close();
}

/**
 * @param {String, any} tableName 表名
 * @param {String} ids 主键ID数组
 */
export function selectRowsByIds(tableName, ids, onSuccess, onError) {
    const db = openDB();
    const idsStr = ids.join();
    db.transaction(tx => {
        const sql = 'SELECT * FROM ' + tableName + ' where id_ in (?);';
        tx.executeSql(sql, [idsStr], onSuccess, onError);
    });
    // 注意：这里千万不能写这一行将数据库关闭，不然会出问题，因为所有db操作都是异步的
    // db.close();
}
```

值得注意的是上述示例中的数据库文件路径，它并不相对于当前文件路径，而是相对于`android/app/src/main/assets`路径，所以我们必须要数据库文件放在`android/app/src/main/assets`目录下。并且这个数据库文件会直接安装在App上，数据的变更也是对手机App上的数据库文件进行变更，而不是开发者的电脑上，所以我们通过sqlite的管理工具来查看我们电脑上的`android/app/src/main/assets`目录下的数据库文件是看不出任何数据变化的。

为了简化开发，这里写了一个通用的sqlite数据库操作的工具类，其中包含四个文件：
* TableInfo.js ：数据库表的信息描述
* DBUtil.js ：通用的获取数据库连接的方法
* CommonService.js ：通用的数据库操作的方法
* ResetService.js ：通用的数据库数据重置的方法

以下是这三个文件的代码：
```js
// TableInfo.js
export const TableNames = {
    AA_INFO: 'aa_info',
    BB_INFO: 'bb_info',
}
const tableColumns = {
    'aa_info': ['id_', 'name_', 'age_'],
    'bb_info': ['id_', 'name_', 'type_']
}
export function getTableColumns(tableName) {
    return tableColumns[tableName];
}


// DBUtil.js
import SQLite from 'react-native-sqlite-storage';
SQLite.DEBUG(true)
export function openDB() {
    return SQLite.openDatabase({
        name: 'AA',
        createFromLocation: "~AA.db",
        location: 'Library'
    });
}


// CommonService.js
import { openDB } from './DBUtil';
import { getTableColumns } from './TableInfo'
/**
 * 成功返回true，出错返回false
 * @param {String} tableName 表名
 * @param {Array<any>} dataArr 需要插入的数据值，包含所有列的值
 */
export function insertRow(tableName, dataArr, onSuccess, onError) {
    const db = openDB();
    db.transaction(tx => {
        const columns = getTableColumns(tableName);
        const columnStr = columns.join(',')
        let valuePlaceholderStr = '?,'.repeat(columns.length);
        valuePlaceholderStr = valuePlaceholderStr.substr(0, valuePlaceholderStr.length - 1);
        const sql = 'insert into ' + tableName + '(' + columnStr + ') values(' + valuePlaceholderStr + ');';
        // debugger
        tx.executeSql(sql, dataArr, onSuccess, onError);
    })
}
/**
 * 成功返回true，出错返回false
 * @param {String} tableName 表名
 * @param {any} id 主键值
 */
export function deleteRow(tableName, id, onSuccess, onError) {
    const db = openDB();
    db.transaction(tx => {
        const sql = 'delete from ' + tableName + ' where id_=?;';
        let dataArr = [];
        dataArr.push(id);
        tx.executeSql(sql, dataArr, onSuccess, onError);
    })
}
/**
 * 成功返回true，出错返回false
 * @param {String} tableName 表名
 * @param {Map<String, any>} dataMap 需要更新的数据，包括 key 和 value
 * @param {any} id 主键值
 */
export function updateRow(tableName, dataMap, id, onSuccess, onError) {
    const db = openDB();
    db.transaction(tx => {
        const keys = Object.keys(dataMap);
        let str = keys.join('=?, ');
        str += '=?';
        const sql = 'update ' + tableName + ' set ' + str + ' where id_=?;';
        let values = Object.values(dataMap);
        values.push(id);
        tx.executeSql(sql, values, onSuccess, onError);
    })
}
/**
 * 成功返回具体的数据，出错返回false
 * @param {String, any} tableName 表名
 */
export function selectRows(tableName, onSuccess, onError) {
    const db = openDB();
    db.transaction(tx => {
        const sql = 'SELECT * FROM ' + tableName + ';';
        tx.executeSql(sql, [], onSuccess, onError);
    });
}
/**
 * 成功返回具体的数据，出错返回false
 * @param {String, any} tableName 表名
 * @param {String} queryStatement 查询语句，包括 ? 占位符，不包括 where
 * @param {Array<any>} dataArr 查询语句中 ? 占位符所对应的值
 */
export function selectRowsWithQueryStatement(tableName, queryStatement, dataArr, onSuccess, onError) {
    const db = openDB();
    db.transaction(tx => {
        const sql = 'SELECT * FROM ' + tableName + ' where ' + queryStatement + ';';
        tx.executeSql(sql, dataArr, onSuccess, onError);
    });
}
/**
 * @param {String, any} tableName 表名
 * @param {String} id 主键ID
 */
export function selectRowById(tableName, id, onSuccess, onError) {
    const db = openDB();
    db.transaction(tx => {
        const sql = 'SELECT * FROM ' + tableName + ' where id_=?;';
        tx.executeSql(sql, [id], onSuccess, onError);
    });
}
/**
 * @param {String, any} tableName 表名
 * @param {String} ids 主键ID数组
 */
export function selectRowsByIds(tableName, ids, onSuccess, onError) {
    const db = openDB();
    const idsStr = ids.join();
    db.transaction(tx => {
        const sql = 'SELECT * FROM ' + tableName + ' where id_ in (?);';
        tx.executeSql(sql, [idsStr], onSuccess, onError);
    });
}


// ResetService.js
import { openDB } from './DBUtil';
import { TableNames } from './TableInfo'
/**
 * 清空数据
 * @param {String} tableName 需要清空的表的名称
 */
export function reset(tableName, onSuccess, onError) {
    const db = openDB();
    db.transaction(tx => {
        const sql = 'delete from ' + tableName + ';';
        tx.executeSql(sql, [], onSuccess, onError);
    })
}
/**
 * 清空所有表中的数据
 */
export function resetAll() {
    const db = openDB();
    db.transaction(tx => {
        const tableNames = Object.values(TableNames);
        let sql = '';
        for (let index = 0; index < tableNames.length; index++) {
            const tableName = tableNames[index];
            sql += 'delete from ' + tableName + ';';
        }
        tx.executeSql(sql, [], (tx, results) => {
            // console.log('success');
        }, (e) => {
            // console.log('error');
        });
    })
}
```