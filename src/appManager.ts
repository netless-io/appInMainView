import { WindowManager } from '@netless/window-manager';
import type { AppInMainViewManager } from './manager';
import { AppId, AppInMainViewOptions, AppState, AppStatus, OperationType } from './types';
import { DefaultAppInMainViewPluginOptions } from './const';
import { isBoolean } from 'lodash';
import { AppMenu } from './componet/AppMenu';

type AppProxy = NonNullable<WindowManager['appManager']>['appProxies'] extends Map<string, infer T> ? T : never;

export interface AppManagerProps {
  control: AppInMainViewManager;
  options: AppInMainViewOptions;
}

export type AppValue = {
  status: AppStatus;
  appInfo?: AppProxy;
}

export class AppManager{
  private enableDefaultUI: boolean = DefaultAppInMainViewPluginOptions.enableDefaultUI;
  private onlyShowHidden: boolean;
  private apps: Map<AppId, AppValue>;
  private scenePath?: string;
  private resolvePublicEventEmitter?:(bol:boolean) => void;
  private resolveTimer?: NodeJS.Timeout;
  private appMenu?: AppMenu;
  private timer?: NodeJS.Timeout;

  readonly control: AppInMainViewManager;

  get mainView(){
    return this.control.wm.mainView;
  }

  get currentScenePath():string|undefined{
    return this.mainView.focusScenePath;
  }

  get wmAppProxies():Map<AppId, AppProxy>{
    return this.control.wm.appManager?.appProxies || new Map();
  }

  async getApps() {
    if (this.checkAppChangeAllReady()) {
      return this.apps;
    }
    await this.willAppInfoAllReady();
    return this.apps;
  }

  constructor(props: AppManagerProps){
    this.control = props.control;
    this.enableDefaultUI = isBoolean(props.options.enableDefaultUI) ? props.options.enableDefaultUI : DefaultAppInMainViewPluginOptions.enableDefaultUI;
    this.onlyShowHidden = isBoolean(props.options.onlyShowHidden) ? props.options.onlyShowHidden : DefaultAppInMainViewPluginOptions.onlyShowHidden;
    this.scenePath = this.currentScenePath;
    this.apps = this.getCurrentApps();
    if (this.enableDefaultUI) {
      this.appMenu = new AppMenu({
        manager: this,
        onlyShowHidden: this.onlyShowHidden,
        language: props.options.language || DefaultAppInMainViewPluginOptions.language,
        theme: props.options.theme || this.control.wmTheme,
      });
    }
  }

  updateAppInfo(appId: AppId){
    const app = this.apps.get(appId);
    if (app) {
      app.appInfo = this.wmAppProxies.get(appId) as AppProxy;
      if (this.resolvePublicEventEmitter && this.checkAppChangeAllReady()) {
        this.resolvePublicEventEmitter(true);
      }
    }
  }

  async pageChangeHandler(scenePath: string, apps: Map<AppId, AppStatus>){
    this.scenePath = scenePath;
    this.apps = this.getCurrentApps(apps);
    await this.willPublicEmitterMenuChange();
  }

  appChangeHandler(operation: OperationType, appId: AppId, value: AppState){
    if(value.scenePath === this.scenePath){
      if(this.onlyShowHidden && value.status === 'visible'){
        this.apps.delete(appId);
      } else if ((operation === 'add' || operation === 'update') && this.wmAppProxies.has(appId)) {
        const appValue = {
          status: value.status,
          appInfo: this.wmAppProxies.get(appId) as AppProxy,
        };
        this.apps.set(appId, appValue);
      } else if (operation === 'delete') {
        this.apps.delete(appId);
      }
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(()=>{
      this.timer = undefined;
      this.willPublicEmitterMenuChange();
    }, 100);
  }

  destroy(){
    this.apps.clear();
    this.appMenu?.destroy();
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = undefined;
    if (this.resolveTimer) {
      clearTimeout(this.resolveTimer);
    }
    this.resolveTimer = undefined;
  }

  private getCurrentApps(_apps?: Map<AppId, AppStatus>):Map<AppId, AppValue>{
    let currentApps = _apps;
    if (!currentApps) {
      currentApps = this.control.getCurrentPageApps();
    }
    const apps = new Map<AppId, AppValue>();
    currentApps.forEach((status, appId) => {
      if(this.onlyShowHidden && status === 'visible'){
        return;
      }
      apps.set(appId, {
        status,
        appInfo: this.wmAppProxies.get(appId) as AppProxy,
      });
    });
    return apps;
  }

  private checkAppChangeAllReady(){
    for (const app of this.apps.values()) {
      if (!app.appInfo) {
        return false;
      }
    }
    return true;
  }

  private async willAppInfoAllReady(callback?: () => void){
    if (this.resolvePublicEventEmitter) {
      this.resolvePublicEventEmitter(false);
    }
    if (this.checkAppChangeAllReady()) {
      callback && callback();
      return;
    }
    const bol = await new Promise<boolean>((resolve) => {
      this.resolvePublicEventEmitter = resolve;
      this.resolveTimer = setTimeout(() => {
        this.resolveTimer=undefined;
        if (this.resolvePublicEventEmitter) {
          this.resolvePublicEventEmitter(true);
        }
      }, 2000);
    });
    if (this.resolveTimer) {
      clearTimeout(this.resolveTimer);
      this.resolveTimer = undefined;
    }
    this.resolvePublicEventEmitter = undefined;
    if (bol) {
      callback && callback();
    }
  }

  private async willPublicEmitterMenuChange(){
    await this.willAppInfoAllReady(()=>{
      this.control.publicEventEmitter.emit('appMenuChange', this.apps);
      this.control.logger.info('[AppInMainViewPlugin] emit appMenuChange');
    });
  }

}