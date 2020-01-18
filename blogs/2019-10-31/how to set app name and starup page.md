# 【React Native】如何设置App的名称以及启动页？
## 设置App的名称
文件``android/app/src/main/res/values/strings.xml``中的`<string name="app_name">你的App名称</string>`标签中的值就是App的名称，在这里设置即可。

## 设置App的启动页
1. 安装依赖：`npm install react-native-splash-screen --save`
2. 链接原生组件：`react-native link`。需要看到`react-native-splash-screen`链接成功的标志才行
3. 修改`android\app\src\main\java\com\xx\MainActivity.java`中的内容为：
    ```java
    import android.os.Bundle; // 添加这一行
    import org.devio.rn.splashscreen.SplashScreen;  // 添加这一行
    import com.facebook.react.ReactActivity;

    public class MainActivity extends ReactActivity {

        /**
        * Returns the name of the main component registered from JavaScript.
        * This is used to schedule rendering of the component.
        */
        @Override
        protected String getMainComponentName() {
            return "StoreManager";
        }

        // 添加这一个方法
        @Override
        protected void onCreate(Bundle savedInstanceState) {
            SplashScreen.show(this);  // here
            super.onCreate(savedInstanceState);
        }
    }
    ```
4. 新建`android\app\src\main\res\layout`文件，并在文件夹中新建`launch_screen.xml`文件，内容如下：
    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
        android:orientation="vertical" android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="@drawable/launch_screen">
    </LinearLayout>
    ```
5. 在目录`android\app\src\main\res\`下新建`drawable-hdpi`和`drawable-ldpi`和`drawable-mdpi`和`drawable-xhdpi`和`drawable-xxhdpi`和`drawable-xxxhdpi`文件夹（这几个文件夹分别代表不同分辨率的设备），把启动页图片放进去，都命名为launch_screen.png
6. 将`AndroidManifest.xml`文件中的`application`标签中的`android:allowBackup`属性设置为`true`
7. 在目录`android\app\src\main\res\values`下新建`colors.xml`文件，添加以下内容：
    ```xml
    <resources>
        <color name="primary_dark">#660B0B0B</color>
    </resources>
    ```
8. 在App.js加载完成后隐藏启动页
    ```js
    import SplashScreen from 'react-native-splash-screen';

    componentDidMount() {
        // 在加载完成后隐藏启动页
        SplashScreen.hide();
    }
    ```