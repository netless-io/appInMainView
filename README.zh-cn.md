# app-in-mainview-plugin

该插件基于 [@netless/window-manager](https://www.npmjs.com/package/@netless/window-manager) 的多窗口模式, 把app窗口(课件、插件)集成到主窗口中, app窗口可以随着主白板的页面切换而隐藏或显示.

![Image](https://github.com/user-attachments/assets/a4970bc1-a0a1-4c7d-885b-d4f3313fe8b3)

## 插件用法

### 安装

```bash
npm install @netless/app-in-mainview-plugin
```

### 接入方式参考

#### fastboard(直接对接fastboard)
```js

// 对接 fastboard-react
import { useFastboard, Fastboard } from "@netless/fastboard-react";

const app = useFastboard(() => ({
    sdkConfig: {
      ...
    },
    joinRoom: {
      ...
    },
    managerConfig: {
      ...
    },
    // 启用appInMainViewPlugin插件,
    // 默认启用默认UI, 如果需要自定义UI, 可以传入enableDefaultUI: false
    enableAppInMainViewPlugin: true || {
        enableDefaultUI:  true,
        language: "en",
        ...
    }
  }));

// 对接 fastboard
import { createFastboard, createUI } from "@netless/fastboard";

const fastboard = await createFastboard({
    sdkConfig: {
      ...
    },
    joinRoom: {
      ...
    },
    managerConfig: {
      ...
    },
    // 启用appInMainViewPlugin插件,
    // 默认启用默认UI, 如果需要自定义UI, 可以传入enableDefaultUI: false
    enableAppInMainViewPlugin: true || {
        enableDefaultUI:  true,
        language: "en",
        ...
    }
  });
```

#### 多窗口(直接对接window-manager)
```js

import '@netless/window-manager/dist/style.css';
import '@netless/app-in-mainview-plugin/dist/style.css';

import { WhiteWebSdk } from "white-web-sdk";
import { WindowManager } from "@netless/window-manager";
import { AppInMainViewPlugin } from '@netless/app-in-mainview-plugin';

const whiteWebSdk = new WhiteWebSdk(...)
const room = await whiteWebSdk.joinRoom({
    ...
    invisiblePlugins: [WindowManager, ApplianceMultiPlugin],
    useMultiViews: true, 
})
const manager = await WindowManager.mount({ room , container:elm, chessboard: true, cursor: true});
if (manager) {
    const appInMainViewPlugin = await AppInMainViewPlugin.getInstance(manager as any, {
      language: "en"
    });
}
```
> **注意** 项目中需要引入css文件 `import '@netless/app-in-mainview-plugin/dist/style.css';`


## 调用介绍

### 初始化方法参数配置
``getInstance(wm: WindowManager, options: AppInMainViewOptions)``
- wm: `` WindowManager``。WindowManager的实例对象。
- options?: 配置参数. 可以为空, 为空则使用默认配置, 配置如下.
    ```typescript
        export type AppInMainViewOptions = {
            /** 是否启用默认UI */
            enableDefaultUI?: boolean;
            /** 是否只显示隐藏的课件 */
            onlyShowHidden?: boolean;
            /** 语言, 默认为'en' */
            language?: Language;
            /** 主题, 默认为'light' */
            theme?: 'light' | 'dark';
        }
        //  默认配置参数
        const DefaultAppInMainViewPluginOptions = {
            enableDefaultUI: true,
            onlyShowHidden: false,
            language: 'en',
            theme: 'light',
        };
    ```
- logger?: Logger; 非必填, 配置日志打印器对象. 不填写默认在本地console输出, 如果需要把日志上传到指定server, 则需要手动配置.
    >如需要上传到白板日志服务器,可以把room上的logger配置到该项目。``logger: room.logger``

### api介绍

```typescript
export type AppInMainViewInstance = {
    /** 当前管理器实例 **/
    readonly currentManager?: AppInMainViewManager;
    /** 当前页面可见的app列表 */
    readonly currentPageVisibleApps?: Set<AppId>;
    /** 当前页面的app列表 */
    readonly currentPageApps?: Map<AppId, AppStatus>;
    /** 销毁 */
    readonly destroy: () => void;
    /** 添加监听器 */
    readonly addListener: (eventName: PublicEvent, callback: PublicCallback<PublicEvent>) => void;
    /** 移除监听器 */
    readonly removeListener: (eventName: PublicEvent, callback: PublicCallback<PublicEvent>) => void;
    /** 隐藏指定课件 */
    readonly hideApp: (appId: AppId) => void;
    /** 显示指定课件 */
    readonly showApp: (appId: AppId) => void;
    /** 显示当前页面所有课件 */
    readonly showCurrentPageApps: () => void;
    /** 隐藏当前页面所有课件 */
    readonly hiddenCurrentPageApps: () => void;
}

// for example
const appInMainViewPlugin = await AppInMainViewPlugin.getInstance(...)
appInMainViewPlugin.currentManager;
appInMainViewPlugin.currentPageVisibleApps;
appInMainViewPlugin.currentPageHiddenApps;
appInMainViewPlugin.hideApp(...);
appInMainViewPlugin.showApp(...);
appInMainViewPlugin.showCurrentPageApps();
appInMainViewPlugin.hiddenCurrentPageApps();
appInMainViewPlugin.destroy();
```

### 前端调试介绍
对接过程中如果想了解和跟踪插件内部状态,可以通过以下几个控制台指令,查看内部数据.
```js
const appInMainViewPlugin = await AppInMainViewPlugin.getInstance(...)
appInMainViewPlugin.currentManager  // 可以查看到包版本号,内部状态等
```
## 自定义 appMeun UI
1. 隐藏默认UI
{
    enableDefaultUI:  false
}
```
2. 初始化状态下获取当前页面中app数据
```js
appInMainViewPlugin.currentPageApps;
appInMainViewPlugin.currentPageVisibleApps;
```
2. 监听appMeun变化
```js
appInMainViewPlugin.addListener('appMenuChange', (appMeun) => {
  // todo 更新UI
})
```
具体参考:[appMeun](https://github.com/netless-io/appInMainView/blob/main/src/componet/AppMenu.ts)