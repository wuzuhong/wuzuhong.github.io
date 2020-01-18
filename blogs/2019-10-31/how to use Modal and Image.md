# 【React Native】如何使用ReactNative原生的Modal组件和原生的Image组件？
## 如何使用ReactNative原生的 Modal 组件
Modal 组件是用来做模态框用的，但是ReactNative原生的Modal组件并没有像其他的UI组件那么好用，需要我们自己做一些自定义的操作：
```js
<Modal
    animationType='fade'// 动画效果类型
    transparent={true}// 背景是否透明
    visible={this.props.modalVisible}// 是否显示
    onRequestClose={this.props.doRequestClose}// 当用户按下手机上的回退按钮时的回调函数，一般就是将当前的 modalVisible 设置为false
>
    <View style={{ justifyContent: 'center', flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ marginLeft: 80, marginRight: 80, alignItems: 'center', backgroundColor: 'white', borderRadius: 5 }}>
            <View style={{ justifyContent: 'center' }}>
                <Button title='标题1' type='clear' onPress={() => this.props.modify('gesture')} containerStyle={{ width: 160, marginTop: 10 }} />
                <Button title='标题1' type='clear' onPress={() => this.props.modify('digit')} containerStyle={{ width: 160, marginBottom: 10 }} />
            </View>
        </View>
    </View>
</Modal>
```
可以发现以上示例的Modal组件中有三个View组件，其中最外层的View是模态框的遮罩效果，中间层的View才是模态框效果，而最里层的View就是模态框中的内容。这三个View组件就是我们自己做一些自定义的操作。

## 如何使用ReactNative原生的 Image 组件？
* 从当前项目路径中加载图片
```js
<Image source={require('../assets/lock.png')} style={{ height: '30%', width: '40%'}} />
```
* 从当前项目路径中动态的加载图片
```js
const imageNames = ['aa.png', 'bb.png']
// 注意 require 中必须是路径，而不能是变量，例如直接写成 require(imageNames[1]) 将会报错
// 但幸运的是只需要开头是路径就行了，所以还是可以在结尾添加我们的动态路径的
const dynamicImageSource = {
    'aa': require('../assets/' + imageNames[1]),
    'bb': require('../assets/' + imageNames[2]),
}
<Image source={dynamicImageSource['aa']} style={{ height: '30%', width: '40%'}} />
<Image source={dynamicImageSource['bb']} style={{ height: '30%', width: '40%'}} />
```
* 从网路地址中加载图片
```js
<Image source={{uri: 'https://www.xiaowu.com/assets/lock.png'}} style={{ height: '30%', width: '40%'}} />
```