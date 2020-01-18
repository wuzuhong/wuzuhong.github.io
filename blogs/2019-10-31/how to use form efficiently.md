# 【React Native】如何在ReactNative中高效的使用Form表单？
推荐使用`tcomb-form-native`这个开源组件来实现。以下是一个简单的示例：
```js
import React from "react";
import Tcomb from "tcomb-form-native";
import { ScrollView } from 'react-native';

const Form = Tcomb.form.Form;

export default class AddGoods extends React.Component {
    state = {
        existGoods: null,
    }
    _onChange = (existGoods) => {
        this.setState({ existGoods });
    }
    _doSave = () => {
        // 获取商品数据并保存到数据库
        if (this.refs.form.validate().isValid()) {
            // 如果不需要对取出来的数据进行修改，则可以这样
            const value = this.refs.form.getValue();
            // 如果需要对取出来的数据进行修改，则要这样，因为是引用传递，而this.refs.form中的value不能被更改
            // let value = { ...this.refs.form.getValue() };
        }
    }       
    render() {
        // 定义Form表单的数据结构
        const Goods = Tcomb.struct({
            code_: Tcomb.String,
            name_: Tcomb.String,
            description_: Tcomb.String,
            type_name: Tcomb.String,
            purchase_price: Tcomb.String,
            sell_price: Tcomb.String,
            measure_unit: Tcomb.String,
            manufacturer_: Tcomb.String,
            production_date: Tcomb.String,
            expiration_date: Tcomb.String,
        });
        // 定义Form表单的额外配置
        const options = {
            order: ['code_', 'name_', 'description_', 'type_name', 'purchase_price', 'sell_price',
                'measure_unit', 'manufacturer_', 'production_date', 'expiration_date'],
            fields: {
                code_: {
                    label: '编码'
                },
                name_: {
                    label: '名称'
                },
                description_: {
                    label: '描述'
                },
                type_name: {
                    label: '类型'
                },
                purchase_price: {
                    label: '进价'
                },
                sell_price: {
                    label: '售价'
                },
                measure_unit: {
                    label: '单位'
                },
                manufacturer_: {
                    label: '生产厂商'
                },
                production_date: {
                    label: '生产日期',
                },
                expiration_date: {
                    label: '保质期限',
                },
            }
        };
        return (
            <ScrollView contentContainerStyle={{ justifyContent: 'center', padding: 20 }}>
                <Form
                    ref="form"
                    type={Goods}
                    options={options}
                    value={this.state.existGoods}
                    onChange={this._onChange}
                />
            </ScrollView>
        )
    }
}
```
更详细的文档请查看 https://github.com/gcanti/tcomb-form-native