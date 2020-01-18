# 【React Native】如何防止在当前组件销毁后还有setState的操作，防止内存泄漏
在某些不可预测的情况下，可能会出现在当前组件销毁后还有setState操作的情况，这会导致内存泄漏，可以通过以下方式来防止：
```js
// 防止在当前组件销毁后还有setState的操作，防止内存泄漏
componentWillUnmount(){
    this.setState = (state, callback) => {
        return;
    }
}
```