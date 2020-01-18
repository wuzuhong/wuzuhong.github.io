# 【React Native】如何使用 react-navigation？
react-navigation 是 React Native 官方的导航组件，用于页面之间的导航跳转，主要包括以下三个组件：
* StackNavigator ：为应用程序提供了一种页面路由导航的方法，每次切换时，新的页面会放置在堆栈的顶部
* TabNavigator ：用于设置具有多个标签页的页面
* DrawerNavigator ：用于设置抽屉导航的页面

由于个人认为 DrawerNavigator 抽屉的用户体验不是特别好，所以这里只对 StackNavigator 和 TabNavigator 进行介绍。

下面将通过一个示例来详细阐述 StackNavigator 和 TabNavigator：
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

// 创建底部标签导航栏，展示的顺序就是这里定义的顺序
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
// 创建页面路由导航，展示的顺序就是这里定义的顺序
const AppNavigator = createStackNavigator({
  // 使用标签导航栏来作为主页面，这样App在打开后第一个页面就是标签导航栏中的第一个标签页面
  MainPage: {
    screen: TabNavigator,
    navigationOptions: () => ({
      header: null,// 去掉页头
    }),
  },
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

通过以上示例，我们已经有足够的能力去使用react-navigation来实现底部导航栏（即底部标签），以及使用react-navigation来实现页头或去掉页头。

但是如何来实现页面之间的跳转呢？通过以下代码即可实现跳转到`AA`页面，并将`ObjectAA`对象作为参数传递给`AA`页面：
```js
this.props.navigation.navigate('AA', {
    ObjectAA: {
        key1: value1,
        key2: value2
    }
})
// 参数不是必须的，如果不想传递参数，那么可以直接这样使用：
// this.props.navigation.navigate('AA')
```
然后我们又该怎么在`AA`页面将参数`ObjectAA`取出来呢？通过以下代码即可实现：
```js
this.props.navigation.getParam('ObjectAA', null);// 这里的第二个参数表示在参数ObjectAA不存在时的默认值
```

以上的跳转以及获取参数的操作都是通过`this.props.navigation`中的函数来实现的，但并不是所有组件中的`props`中都有`navigation`这个属性，只有以下特征的页面拥有这个属性：
* StackNavigator 中定义的第一个页面，当前示例`App.js`中的`MainPage`（也就是`TabNavigator`）页面就是这种类型
* 通过`this.props.navigation.navigate`跳转过来的页面

如果某个页面没有以上特征，但是也要实现页面跳转，那该怎么办？只能通过 React 组件之间的属性传递了，例如现在有两个页面：AA和BB，其中AA页面中有`this.props.navigation`，并且BB页面是AA页面直接render出来的，所以BB页面是没有`this.props.navigation`的，那么我们就可以通过 React 组件之间的属性传递来实现：
```js
// AA.js
render() {
    return (
        <BB navigation={this.props.navigation} />
    )
}
```

需要注意的是，当从一个页面跳转到另一个页面时，例如从AA页面跳转到BB页面后，AA页面并不会销毁，而是会保持其已渲染状态，也就是说当从BB页面跳回到AA页面时将不会执行AA页面的`componentDidMount`方法，但是如果我们想在跳回AA页面时做一些数据更新的操作该怎么办呢？可以通过`NavigationEvents`这个组件（这个组件不会在页面上展示任何元素）来实现：
```js
import React from "react";
import { NavigationEvents } from 'react-navigation';

export default class AA extends React.Component {
    componentDidMount() {
        this._doInit();
    }
    _doInit = () => {
        // 初始化或更新页面数据
    }
    render() {
        return (
            <ScrollView>
                <NavigationEvents onWillFocus={this._doInit} />
                {/* 更多的页面组件 */}
            </ScrollView>
        )
    }
}
```
由于跳转前的页面不会被销毁，所以在跳回到标签导航的时候不需要指定标签，因为focus的还是原来的那个标签。

通过以上示例`App.js`我们可以发现将页面导航相关代码放在`App.js`这一个文件中是很清晰的，但是这也会带来一个问题，就是如果想在某个页面导航的页头组件中调用具体页面组件的方法时该怎么办？例如想在页头的右侧图标按钮点击时调用页面组件的`doSomthing`方法，可以使用`navigation.getParam`方法：
```js
navigationOptions: ({ navigation }) => ({
    // 设置页头
    // 设置页头右侧元素
    headerRight: <Icon name='plus' size={18} color='white' type="material-community" 
        onPress={navigation.getParam('doSomthing')} iconStyle={{ marginRight: 10 }} />
    // 其他的设置项......
}),
```
但是使用`navigation.getParam`方法之前需要在页面组件的`componentDidMount`方法中将需要调用的方法设置进来：
```js
componentDidMount() {
    this.props.navigation.setParams({ doSomthing: this._doSomthing });
}
```

还有一个问题，当TextInput聚焦时会弹出键盘，而弹出的键盘会把底部标签导航顶起来，这该如何解决？在android/app/src/main/AndroidManifest.xml中修改android:windowSoftInputMode
为android:windowSoftInputMode="stateAlwaysHidden|adjustPan|adjustResize"