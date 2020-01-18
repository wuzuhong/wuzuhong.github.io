# 【React Native】如何实现数字密码设置或校验组件？
## 数字键盘组件
```js
// KeyBoard.js
import React from 'react';
import { StyleSheet, Text, View, Modal, Dimensions } from 'react-native';
import { Grid, Icon } from '@ant-design/react-native';


let width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;
let i = 0;

const gridHeigth = 80;
const maxLength = 8;
export default class Keyboard extends React.Component {
    state = {
        keyData: [],
        currentIndex: undefined
    }
    configItemEl(_el, index) {
        const { currentIndex } = this.state;
        if (index <= 8) {
            return (<Text style={currentIndex === index ? styles.active : null}>{index + 1}</Text>);
        }
        if (index === 9) {
            return (<Text style={{ width: width / 3, height: gridHeigth, backgroundColor: '#CCC' }}></Text>);
        }
        if (index === 10) {
            return (<Text style={currentIndex === index ? styles.active : null}>0</Text>);
        }
        if (index === 11) {
            return (<Text style={currentIndex === index ? styles.active : { color: '#0080FF', width: width / 3, height: gridHeigth, backgroundColor: '#CCC', textAlign: 'center', lineHeight: gridHeigth }}>删除</Text>);
        }
    }
    clear = () => {
        i = 0;
        this.setState({
            keyData: [],
            currentIndex: undefined
        })
    }
    onKeyClick(index, i) {
        const getPasswordstr = this.props.getPasswordstr;
        const getPasswordArr = this.props.getPasswordArr;
        if (index !== 12 && index !== 10 && this.state.keyData.length <= maxLength) {
            this.setState({
                keyData: [...this.state.keyData, index === 11 ? 0 : index],
            }, () => {
                if (i === 6) {
                    getPasswordstr(this.state.keyData.join(''));
                }
                getPasswordArr(this.state.keyData);
            });
        }
        if (index === 12 && this.state.keyData.length >= 0) {
            const arr = this.state.keyData.filter((item, indexKey) => i !== indexKey)
            this.setState({
                keyData: arr,
            }, () => {
                getPasswordstr(this.state.keyData.join(''));
                getPasswordArr(this.state.keyData);
            })
        }
    }
    // 防止在当前组件销毁后还有setState的操作，防止内存泄漏
    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        }
    }
    render() {
        return (
            <View style={styles.container}>
                <Grid
                    data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                    columnNum={3}
                    onPress={(_el, index) => {
                        this.setState({ currentIndex: index }, () => {
                            setTimeout(() => { this.setState({ currentIndex: undefined }) }, 10)
                        });
                        if (_el !== 12 && _el !== 10 && i < 6) {
                            i++
                        }
                        if (_el === 12 && i > 0) {
                            i--
                        }
                        this.onKeyClick(_el, i)
                    }}
                    itemStyle={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 1,
                        height: gridHeigth,
                        backgroundColor: '#FFF'
                    }}
                    renderItem={(_el, index) =>
                        this.configItemEl(_el, index)
                    }
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    active: {
        width: width / 3,
        height: gridHeigth,
        backgroundColor: '#0080FF',
        color: '#FFF',
        textAlign: 'center',
        lineHeight: gridHeigth
    },
    container: {
        width: width,
        height: height,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        position: 'absolute',
        top: -25
    },
});
```

## 数字密码设置或校验组件
```js
// DigitPassword.js
import React from "react";
import { Text, StyleSheet, View, Alert } from "react-native";
import Keyboard from './KeyBoard';
import { Constant } from '../common';
import { DefaultValidationMode } from '../component';

export default class DigitPassword extends React.Component {
    state = {
        point1: "#FFFFFF",
        point2: "#FFFFFF",
        point3: "#FFFFFF",
        point4: "#FFFFFF",
        point5: "#FFFFFF",
        point6: "#FFFFFF",
        point7: "#FFFFFF",
        point8: "#FFFFFF",
        password: null,
        message: '请输入您的数字密码',
        isWarning: false,
        modalVisible: false,
    }
    componentWillReceiveProps(nextProps) {
        const verifyState = nextProps.verifyState;
        if (verifyState === false) {
            this._resetHeadPoint();
            this.refs.keyboard.clear();
            this.setState({
                message: '数字密码不正确，请重新输入',
                isWarning: true
            })
        } else if (verifyState === true) {
            this.setState({
                message: '数字密码验证通过，即将跳转…………',
                isWarning: false
            })
        }
    }
    _resetHeadPoint = () => {
        this.setState({
            point1: "#FFFFFF",
            point2: "#FFFFFF",
            point3: "#FFFFFF",
            point4: "#FFFFFF",
            point5: "#FFFFFF",
            point6: "#FFFFFF",
            point7: "#FFFFFF",
            point8: "#FFFFFF",
        });
    }
    _changeHeadPoint = (point, isClear) => {
        let color;
        if (isClear) {
            color = '#FFFFFF'
        } else {
            color = '#1F67B9'
        }
        switch (point) {
            case 1:
                this.setState({
                    point1: color
                });
                break;
            case 2:
                this.setState({
                    point2: color
                });
                break;
            case 3:
                this.setState({
                    point3: color
                });
                break;
            case 4:
                this.setState({
                    point4: color
                });
                break;
            case 5:
                this.setState({
                    point5: color
                });
                break;
            case 6:
                this.setState({
                    point6: color
                });
                break;
            case 7:
                this.setState({
                    point7: color
                });
                break;
            case 8:
                this.setState({
                    point8: color
                });
                break;
            default:
                break;
        }
    }
    getPasswordArr = (passwordstr) => {
        if (this.state.isWarning && this.props.isVerify === null) {
            this.setState({
                isWarning: false,
                message: '为确认您的数字密码，请再输一次'
            })
        }
        passwordstr = passwordstr.join('')
        const len = passwordstr.length;
        if (len > 8) {
            return;
        }
        for (let i = 1; i <= len; i++) {
            this._changeHeadPoint(i, false)
        }
        if (len < 8) {
            for (let i = len + 1; i <= 8; i++) {
                this._changeHeadPoint(i, true)
            }
        }
        if (len === 8) {
            if (this.props.isVerify) {
                // 执行密码校验操作
                this.props.verify(passwordstr, 'digit');
                return;
            }
            let message;
            let success = false;
            let isWarning = false;
            if (this.state.password === null) {
                this.setState({
                    password: passwordstr,
                })
                message = '为确认您的数字密码，请再输一次';
                this._resetHeadPoint();
                this.refs.keyboard.clear();
            } else if (this.state.password === passwordstr) {
                message = '数字密码设置成功'
                success = true;
            } else if (this.state.password !== passwordstr) {
                this._resetHeadPoint();
                this.refs.keyboard.clear();
                message = '数字密码前后设置的不一致，请重新输入'
                isWarning = true;
            }
            this.setState({
                message,
                isWarning
            })
            if (success) {
                Alert.alert(
                    '数字密码设置成功',
                    '',
                    [
                        { text: '下一步', onPress: () => this.props.doNextStep(2, passwordstr) },
                    ],
                    {
                        cancelable: false
                    }
                )
            }
        }
    }
    getPasswordstr = (passwordArr) => {
        return;
    }
    // 防止在当前组件销毁后还有setState的操作，防止内存泄漏
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        }
    }
    render() {
        return (
            <View style={styles.container}>
                {this.props.isVerify ? <Text style={{ position: 'absolute', top: 10, left: 10 }} onPress={() => this.props.navigation.navigate('EncryptedCommandCheck')}>忘记密码</Text> : null}
                {this.props.isVerify ? <Text style={{ position: 'absolute', top: 10, right: 10 }} onPress={() => this.setState({ modalVisible: true })}>修改默认验证方式</Text> : null}
                <DefaultValidationMode modalVisible={this.state.modalVisible} doRequestClose={() => this.setState({ modalVisible: false })} modify={type => { this.props.modifyDefaultValidationMode(type); this.setState({ modalVisible: false }) }} />
                <Text style={styles.headContent}>{this.props.headContent}</Text>
                <Text style={{ marginTop: 40, color: this.state.isWarning ? 'red' : null }}>{this.state.message}</Text>
                <View style={styles.headCircleContent}>
                    <View style={[styles.headCircle, { backgroundColor: this.state.point1 }]} />
                    <View style={[styles.headCircle, { backgroundColor: this.state.point2 }]} />
                    <View style={[styles.headCircle, { backgroundColor: this.state.point3 }]} />
                    <View style={[styles.headCircle, { backgroundColor: this.state.point4 }]} />
                    <View style={[styles.headCircle, { backgroundColor: this.state.point5 }]} />
                    <View style={[styles.headCircle, { backgroundColor: this.state.point6 }]} />
                    <View style={[styles.headCircle, { backgroundColor: this.state.point7 }]} />
                    <View style={[styles.headCircle, { backgroundColor: this.state.point8 }]} />
                </View>
                <Keyboard
                    ref='keyboard'
                    getPasswordstr={this.getPasswordstr}
                    getPasswordArr={this.getPasswordArr}
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    headContent: {
        fontSize: Constant.headerTitleSize
    },
    headCircleContent: {
        marginTop: 30,
        marginBottom: '80%',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    headCircle: {
        borderRadius: 30,
        borderWidth: 1,
        borderColor: "#1F67B9",
        width: 15,
        height: 15,
        margin: 4,
    },
});
```