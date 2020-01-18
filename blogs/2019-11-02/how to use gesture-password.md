# 【React Native】如何使用react-native-ok-gesture-password来实现手势密码组件？
可以用来实现手势密码的开源组件有很多，但是经过多次比较，个人认为react-native-ok-gesture-password是其中比较好的一个 https://github.com/MoMask/react-native-ok-gesture-password

以下是示例代码：
```js
import React from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import OkGesturePassword from "react-native-ok-gesture-password";
import { Constant } from "../common";

export default class GesturePassword extends React.Component {
    state = {
        isWarning: false,
        message: '请输入您的手势密码',
        password: '',
    }
    _onFinish = (password) => {
        // 业务代码......
    }
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.headContent}>{this.props.headContent}</Text>
                <Text style={{ marginTop: 40, color: this.state.isWarning ? 'red' : null }}>{this.state.message}</Text>
                <OkGesturePassword
                    style={styles.gesturePassword}
                    pointBackgroundColor={'white'}
                    showArrow={false}// 是否在手指移动的时候显示方向箭头
                    color={'#1F67B9'}
                    activeColor={'#1F67B9'}
                    warningColor={'red'}
                    warningDuration={1000}// 坑，这里不仅表示警告状态的持续时间，而且也表示成功状态的持续时间
                    isWarning={this.state.isWarning}
                    allowCross={false}// 是否允许跨点连接
                    onFinish={this._onFinish}
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    gesturePassword: {
        backgroundColor: 'white',
    },
    headContent: {
        fontSize: Constant.headerTitleSize
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'white',
    }
});
```

需要注意的是：
* OkGesturePassword这个组件必须位于一个单独的页面，其页面中不允许有页头
* OkGesturePassword这个组件只允许有一个View组件作为其父组件

必须满足以上条件，不然会出现错位现象