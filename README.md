# app-in-mainview-plugin

 [中文文档](https://github.com/netless-io/appInMainView/blob/main/README.zh-cn.md)

The plug-in based on [@netless/window-manager](https://www.npmjs.com/package/@netless/window-manager) multi-window mode, the app window (courseware, plug-in) are integrated into the main window, The app window can be hidden or displayed along with the page switch of the main whiteboard.

![Image](https://github.com/user-attachments/assets/a4970bc1-a0a1-4c7d-885b-d4f3313fe8b3)

## Plugin Usage

### Installation

```bash
npm install @netless/app-in-mainview-plugin
```

### Reference for access methods

#### fastboard(with fastboard)
```js

// Interface with fastboard-react
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
    // Enable the appInMainViewPlugin plugin 
    // The default UI is enabled by default. If you need to customize the UI, you can pass "enableDefaultUI: false"
    enableAppInMainViewPlugin: true || {
        enableDefaultUI:  true,
        language: "en",
        ...
    }
  }));

// Interface with fastboard 
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
    // Enable the appInMainViewPlugin plugin 
    // The default UI is enabled by default. If you need to customize the UI, you can pass "enableDefaultUI: false"
    enableAppInMainViewPlugin: true || {
        enableDefaultUI:  true,
        language: "en",
        ...
    }
  });
```

#### Multiple Windows(with window-manager)
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
> **Note** The css file ``import '@netless/app-in-mainview-plugin/dist/style.css`` needs to be introduced in the project; 


## Introduction to the Calling Method

### Initialize the parameter configuration of the method
``getInstance(wm: WindowManager, options: AppInMainViewOptions)``
- wm: `` WindowManager``. An instance object of Windows Manager。
- options?: ``AppInMainViewOptions``. Configuration parameters. They can be left empty. If left empty, the default configuration will be used. The configuration is as follows. 
    ```typescript
        export type AppInMainViewOptions = {
            /** Whether to enable the default UI */
            enableDefaultUI?: boolean;
            /** Whether only the hidden courseware is displayed */
            onlyShowHidden?: boolean;
            /** Language, The default is 'en'. */
            language?: Language;
            /** theme, The default is 'light'. */
            theme?: 'light' | 'dark';
        }
        //   Default configuration parameters
        const DefaultAppInMainViewPluginOptions = {
            enableDefaultUI: true,
            onlyShowHidden: false,
            language: 'en',
            theme: 'light',
        };
    ```
- logger?: ``Logger``. Not required. Configure the log printer object. If not filled in, the default output will be in the local console. If it is necessary to upload the log to the specified server, manual configuration is required.
    >If it is necessary to upload to the whiteboard log server, the logger on room can be configured to this project. ``logger: room.logger``

### api Introduction

```typescript
export type AppInMainViewInstance = {
    /** Current Manager instance **/
    readonly currentManager?: AppInMainViewManager;
    /** The list of apps visible on the current page */
    readonly currentPageVisibleApps?: Set<AppId>;
    /** The list of apps on the current page */
    readonly currentPageApps?: Map<AppId, AppStatus>;
    /** Destroy */
    readonly destroy: () => void;
    /** Add listeners */
    readonly addListener: (eventName: PublicEvent, callback: PublicCallback<PublicEvent>) => void;
    /** Remove the listener */
    readonly removeListener: (eventName: PublicEvent, callback: PublicCallback<PublicEvent>) => void;
    /** Hide the specified courseware */
    readonly hideApp: (appId: AppId) => void;
    /** Display the specified courseware */
    readonly showApp: (appId: AppId) => void;
    /** Display all courseware on the current page */
    readonly showCurrentPageApps: () => void;
    /** Hide all courseware on the current page */
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

### Introduction to Front-End Debugging
During the integration process, if you want to understand and track the internal status of the plugin, you can view the internal data through the following several console commands.
```js
const appInMainViewPlugin = await AppInMainViewPlugin.getInstance(...)
appInMainViewPlugin.currentManager  //  can see the package version number, internal state, etc
```

## Customize appMeun UI
1. Hide the default UI
```js
{
    enableDefaultUI:  false
}
```
2. Obtain the app data on the current page in the initialization state
```js
appInMainViewPlugin.currentPageApps;
appInMainViewPlugin.currentPageVisibleApps;
```
2. Listen for changes in appMeun
```js
appInMainViewPlugin.addListener('appMenuChange', (appMeun) => {
  // todo upate UI
})
```
For specific reference: [appMeun](https://github.com/netless-io/appInMainView/blob/main/src/componet/AppMenu.ts)