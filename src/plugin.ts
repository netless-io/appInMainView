/* eslint-disable @typescript-eslint/no-explicit-any */
import { isRoom, InvisiblePlugin } from './external';
import type { Displayer, Room, WindowManager } from '@netless/window-manager';
import { AppId, AppInMainViewInstance, AppInMainViewOptions, AppInMainViewPluginAttributes, AppStatus, Logger, PublicCallback, PublicEvent } from './types';
import { AppInMainViewManager } from './manager';


/**
 * 多窗口教具
 */
export class AppInMainViewPlugin extends InvisiblePlugin<AppInMainViewPluginAttributes, any> {
  static readonly kind: string = 'app-in-main-view-plugin';
  static currentManager?: AppInMainViewManager;
  static timer?: NodeJS.Timeout;
  public static logger: Logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
  };
  public static async getInstance(wm: WindowManager, options?: AppInMainViewOptions, logger?: Logger): Promise<AppInMainViewInstance> {
    if (logger) {
      AppInMainViewPlugin.logger = logger;
    }
    const _d = wm.displayer;
    let _AppInMainViewPlugin = _d.getInvisiblePlugin(AppInMainViewPlugin.kind) as AppInMainViewPlugin | undefined;
    if (!AppInMainViewPlugin.currentManager) {
      AppInMainViewPlugin.createCurrentManager(wm, options || {});
    }
    if (!_AppInMainViewPlugin) {
      _AppInMainViewPlugin = await AppInMainViewPlugin.createAppInMainViewPlugin(_d, AppInMainViewPlugin.kind);
    }
    if (_AppInMainViewPlugin && AppInMainViewPlugin.currentManager) {
      AppInMainViewPlugin.currentManager.bindPlugin(_AppInMainViewPlugin);
    }
    const origin:AppInMainViewInstance = {
      displayer: _d,
      windowManager: wm,
      currentManager: AppInMainViewPlugin.currentManager,
      destroy(){
        if (AppInMainViewPlugin.currentManager) {
          AppInMainViewPlugin.logger.info('[AppInMainViewPlugin] has been destroyed');
          AppInMainViewPlugin.currentManager.destroy();
          AppInMainViewPlugin.currentManager = undefined;
        }
      },
      addListener: (eventName: PublicEvent, callback: PublicCallback<PublicEvent>) => {
        // AppInMainViewPlugin.logger.info(`[AppInMainViewPlugin] addListener ${eventName}`);
        AppInMainViewPlugin.currentManager?.publicEventEmitter.on(eventName, callback);
      },
      removeListener: (eventName: PublicEvent, callback: PublicCallback<PublicEvent>) => {
        // AppInMainViewPlugin.logger.info(`[AppInMainViewPlugin] removeListener ${eventName}`);
        AppInMainViewPlugin.currentManager?.publicEventEmitter.off(eventName, callback);
      },
      hideApp: (appId: AppId) => {
        AppInMainViewPlugin.logger.info(`[AppInMainViewPlugin] hideApp ${appId}`);
        AppInMainViewPlugin.currentManager?.hideApp(appId);
      },
      showApp: (appId: AppId) => {
        AppInMainViewPlugin.logger.info(`[AppInMainViewPlugin] showApp ${appId}`);
        AppInMainViewPlugin.currentManager?.showApp(appId);
      },
      showCurrentPageApps: () => {
        AppInMainViewPlugin.logger.info('[AppInMainViewPlugin] showCurrentPageApps');
        AppInMainViewPlugin.currentManager?.showCurrentPageApps();
      },
      hiddenCurrentPageApps: () => {
        AppInMainViewPlugin.logger.info('[AppInMainViewPlugin] hiddenCurrentPageApps');
        AppInMainViewPlugin.currentManager?.hiddenCurrentPageApps();
      },
    };
    Object.defineProperty(origin, 'currentPageVisibleApps', {
      get() {
        if (!AppInMainViewPlugin.currentManager) {
          return new Set<AppId>();
        }
        return AppInMainViewPlugin.currentManager.getCurrentPageVisibleApps();
      },
    });
    Object.defineProperty(origin, 'currentPageApps', {
      get() {
        if (!AppInMainViewPlugin.currentManager) {
          return new Map<AppId, AppStatus>();
        }
        return AppInMainViewPlugin.currentManager.getCurrentPageApps();
      },
    });
    (wm as any)._appInMainViewPlugin = origin;
    return (wm as any)._appInMainViewPlugin;
  }
  static onCreate(plugin: InvisiblePlugin<AppInMainViewPluginAttributes, any> ) {
    if (plugin && AppInMainViewPlugin.currentManager) {
      if (AppInMainViewPlugin.timer) {
        clearTimeout(AppInMainViewPlugin.timer);
        AppInMainViewPlugin.timer = undefined;
      }
      AppInMainViewPlugin.currentManager.bindPlugin(plugin as AppInMainViewPlugin);
    }
  }
  static async createAppInMainViewPlugin(d:Displayer, kind:string):Promise<AppInMainViewPlugin> {
    if (isRoom(d)) {
      try {
        if ((d as Room).isWritable) {
          const plugin = await (d as Room).createInvisiblePlugin(AppInMainViewPlugin, {});
          return plugin;
        } else {
          await (d as Room).setWritable(true);
          const plugin = await AppInMainViewPlugin.createAppInMainViewPlugin(d,kind);
          await (d as Room).setWritable(false);
          return plugin;
        }
      } catch (error) {
        AppInMainViewPlugin.logger.error('[AppInMainViewPlugin] createAppInMainViewPlugin error', error);
      }
    }
    let _AppInMainViewPlugin = d.getInvisiblePlugin(kind) as AppInMainViewPlugin | undefined;
    if (!_AppInMainViewPlugin) {
      await new Promise((resolve) => {
        if (AppInMainViewPlugin.timer) {
          clearTimeout(AppInMainViewPlugin.timer);
          AppInMainViewPlugin.timer = undefined;
        }
        AppInMainViewPlugin.timer = setTimeout(()=>{
          AppInMainViewPlugin.timer = undefined;
          resolve(true);
        }, 1000 as unknown as number);
      });
      _AppInMainViewPlugin = await AppInMainViewPlugin.createAppInMainViewPlugin(d,kind);
    }
    return _AppInMainViewPlugin;
  }
  static createCurrentManager = (wm:WindowManager, options:AppInMainViewOptions) => {
    if (AppInMainViewPlugin.currentManager) {
      AppInMainViewPlugin.currentManager.destroy();
    }
    const props = {
      windowManager: wm,
      options,
      logger: AppInMainViewPlugin.logger,
    };
    const appInMainViewManager = new AppInMainViewManager(props);
    if (wm.room) {
      AppInMainViewPlugin.logger.info('[AppInMainViewPlugin] new appInMainViewManager');
    }
    AppInMainViewPlugin.currentManager = appInMainViewManager;
  };
  override destroy(): void {
    AppInMainViewPlugin.logger.info('[AppInMainViewPlugin] passive destroyed');
    AppInMainViewPlugin.currentManager?.destroy();
    AppInMainViewPlugin.currentManager = undefined;
  }
}