# 【React Native】如何实现页面右侧字母搜索栏和自定义页头？
## 页面右侧字母搜索栏
```js
// LetterSearchBar.js
import React from 'react';
import {
    View,
    Text,
    TouchableNativeFeedback,
} from 'react-native';
import { Constant } from '../common';

export default class LetterSearchBar extends React.Component {
    render() {
        const letters = ['@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '$'];
        const letterHeight = Constant.deviceH * 0.7 / 28;
        return (
            <View style={{
                flexDirection: 'column',
                flex: 0.1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white'
            }}>
                {
                    letters.map((value, index) => {
                        return (
                            <TouchableNativeFeedback
                                key={index}
                                onPress={() => this.props.onPressText(value)}
                                background={TouchableNativeFeedback.Ripple('#686868', false)}
                            >
                                <View style={{ width: letterHeight, height: letterHeight, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12 }}>{value}</Text>
                                </View>
                            </TouchableNativeFeedback>
                        )
                    })
                }
            </View>
        )
    }
};
```

## 自定义页头
```js
// CustomHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Constant } from '../common';

export default class CustomHeader extends React.Component {
    render() {
        return (
            <View style={{
                flexDirection: 'row',
                height: Constant.headerHeight,
                justifyContent: 'flex-start',
                alignItems: 'center',
                backgroundColor: Constant.backColor
            }}>
                <View style={[styles.view, { alignItems: 'flex-start', marginLeft: 10 }]}>{this.props.left ? this.props.left : <Text />}</View>
                <View style={[styles.view, { alignItems: 'center' }]}>{this.props.center ? this.props.center : <Text />}</View>
                <View style={[styles.view, { alignItems: 'flex-end', marginRight: 10 }]}>{this.props.right ? this.props.right : <Text />}</View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    view: {
        flexDirection: 'column',
        flex: 0.333333,
        justifyContent: 'flex-start',
    }
})
```