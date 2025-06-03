import type { Displayer, WindowManager } from '@netless/window-manager';
import { Language } from './componet/locale';
import type { AppInMainViewManager } from './manager';

export type AppId = string;
export type AppStatus = 'hidden' | 'visible';

export type TeleBoxStateType = 'normal' | 'minimized' | 'maximized';

export type AppState = {
    scenePath: string;
    status: AppStatus;
}
export interface AppInMainViewPluginAttributes {
    [key: AppId]: AppState;
}

export type Logger = {
    readonly info: (...messages: any[]) => void;
    readonly warn: (...messages: any[]) => void;
    readonly error: (...messages: any[]) => void;
}

export type CollectorOptions = {
    /** 同步间隔 */
    syncInterval?: number;
}

export type AppInMainViewOptions = {
    /** 是否启用默认UI */
    enableDefaultUI?: boolean;
    /** ui容器 */
    containerUI?: HTMLDivElement;
    /** 是否只显示隐藏的课件 */
    onlyShowHidden?: boolean;
    /** 语言 */
    language?: Language;
    /** 主题 */
    theme?: 'light' | 'dark';
}

export type AppInMainViewInstance = {
    readonly displayer: Displayer;
    readonly windowManager: WindowManager;
    readonly currentManager?: AppInMainViewManager;
    readonly currentPageVisibleApps?: Set<AppId>;
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

export type PublicEvent = keyof PublicListener;

export type PublicCallback<T extends PublicEvent> = PublicListener[T];

export type OperationType = 'add' | 'delete' | 'update';

type AppProxy = NonNullable<WindowManager['appManager']>['appProxies'] extends Map<string, infer T> ? T : never;

export type AppValue = {
  status: AppStatus;
  appInfo?: AppProxy;
}

/**
 * 公开的监听器类型
 */
export type PublicListener = {
    /** 课件菜单状态变化事件 */
    appMenuChange: (menu: Map<AppId, AppValue>) => void;
}