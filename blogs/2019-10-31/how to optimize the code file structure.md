# 【React Native】如何优化ReactNative代码的目录结构？
#### 在新建 React native 项目后，在项目根目录会有一个 App.js 文件，建议将这个文件作为开发的入口文件，可以在这个文件中定义所有页面的导航配置，以下是一个示例：
```js
// App.js
import React from "react";
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import { Text } from 'react-native';
import { Icon } from "react-native-elements";
import {
  AA, BB, CC, DD
} from "./src/page";
import SplashScreen from 'react-native-splash-screen';

// 创建底部标签导航栏
const TabNavigator = createBottomTabNavigator({
  第一个底部标签导航: AA,
  第二个底部标签导航: BB,
}, {
  defaultNavigationOptions: ({ navigation }) => ({
    // 设置底部标签图标
    tabBarIcon: ({ focused, horizontal, tintColor }) => {
      const { routeName } = navigation.state;
      let iconName;
      if (routeName === '第一个底部标签导航') {
        iconName = 'basket';
      } else if (routeName === '第二个底部标签导航') {
        iconName = 'layers';
      }
      return <Icon name={iconName} size={horizontal ? 20 : 25} color={tintColor} type="simple-line-icon" />;
    }
  }),
  // 设置底部标签动态颜色
  tabBarOptions: {
    activeTintColor: 'white',
    inactiveTintColor: 'gray',
  },
});
// 创建页面路由导航
const AppNavigator = createStackNavigator({
  CC: {
    screen: CC,
    navigationOptions: () => ({
      header: null,// 去掉页头
    }),
  },
  DD: {
    screen: DD,
    navigationOptions: ({ navigation }) => ({
      // 设置页头
      title: '商品列表',// 设置页头标题
      headerStyle: {
        backgroundColor: 'blue',// 设置页头背景颜色
        height: 100// 设置页头高度
      },
      headerTintColor: 'white',// 设置页头元素的颜色
      headerTitleStyle: {
        fontWeight: 'normal',// 设置页头元素的字体粗细
        fontSize: '18'// 设置页头元素的字体大小
      },
      // 设置页头右侧元素
      headerRight: <Icon name='plus' size={18} color='white' type="material-community" 
        onPress={navigation.getParam('doSomthing')} iconStyle={{ marginRight: 10 }} />
    }),
  },
  // 更多的页面路由导航
})
const AppContainer = createAppContainer(AppNavigator)
export default class App extends React.Component {
  componentDidMount() {
    // 在加载完成后隐藏启动页
    SplashScreen.hide();
  }
  render() {
    return <AppContainer />;
  }
}
```

#### 而具体的业务代码则需要新建一个 `src` 目录并把代码都按以下目录结构存放：
```
- src
    - assets // 用于存放图片资源
        - aa.png
        - bb.jpg
    - common // 用于存放通用的js
        - CommonStyle.js // 通用的样式类
        - CommonUtil.js // 通用的工具类
        - Constant.js // 通用的常量类
        - index.js
    - component // 用于存放页面中的组件
        - common // 用于存放通用的组件
            - CommonComponent01
            - index.js
        - page01 // 用于存放页面Page01相关的组件
            - Page01Component01
            - Page01Component02
            - index.js
    - page // 用于存放页面
        - Page01.js
        - Page02.js
        - index.js
    - service // 用于存放获取动态数据相关的js方法
        - CommonService.js // 通用的获取动态数据方法
        - TestService01.js
        - DBUtil.js // 获取动态数据的工具类
        - index.js
```
从以上目录结构可以看出所有文件都以大驼峰命名规范来命名；所有目录名称都小写，多个单词之间以下划线分隔。

#### `index.js`是用来导出当前目录的所有组件，比如以上`common`目录中的`index.js`中的内容应该为：
```js
export { default as CommonStyle } from './CommonStyle';
export { default as CommonUtil } from './CommonUtil';
export { default as Constant } from './Constant';
```
然后在`Page01.js`中就可以这样来导入：
```js
// 路径不再需要精确到具体组件，只需要精确到目录
import { CommonUtil, Constant } from '../common';
```

#### `service`目录下的文件中都是一些函数，这些函数的写法有两种，例如`TestService01.js`中可能有`getSomething`和`addSomething`两个函数，这两个函数可以有以下两种写法：
* 写法一：
```js
/**
 * @param {String} param01 参数1
 * @param {String} param02 参数2
 */
export function getSomething(param01, param02) {
    // 业务逻辑......
}

/**
 * @param {String} param01 参数1
 * @param {String} param02 参数2
 */
export function addSomething(param01, param02) {
    // 业务逻辑......
}
```
* 写法二（推荐）：
```js
export default TestService01 = {
    /**
     * @param {String} param01 参数1
     * @param {String} param02 参数2
     */
    getSomething(param01, param02) {
        // 业务逻辑......
    }

    /**
     * @param {String} param01 参数1
     * @param {String} param02 参数2
     */
    addSomething(param01, param02) {
        // 业务逻辑......
    }
}
```
相应的在其他文件中的使用方法为：
* 写法一的使用方法：
```js
// 导入
import { getSomething, addSomething } from '../service/TestService01';

// 使用
getSomething('aa', 'bb');
```
* 写法二的使用方法（推荐）：
```js
// 导入
import { TestService01 } from '../service';

// 使用
TestService01.getSomething('aa', 'bb');
```