import type { AppInMainViewPlugin } from './plugin';
import type { AppInMainViewManager } from './manager';
import { AppId, AppInMainViewPluginAttributes, AppState } from './types';
import { autorun, toJS } from './external';
import { ObserverMap } from './ObserverMap';
import { isEqual } from 'lodash';


export const plainObjectKeys = Object.keys as <T>(o: T) => Array<Extract<keyof T, string>>;

export type CollectorProps = {
  control: AppInMainViewManager;
  plugin: AppInMainViewPlugin;
}

export interface ICollector {
  /** 状态存储器 */
  storage: ObserverMap<AppId, AppState>;
  /** 获取课件状态 */
  getAppState(appId: AppId):AppState;
  /** 添加课件状态 */
  addAppState(appId: AppId, appState: AppState): void;
  /** 删除课件状态 */
  deleteAppState(appId: AppId): void;
  /** 更新课件状态 */
  updateAppState(appId: AppId, appState: AppState): void;
  /** 销毁 */
  destroy(): void;
}

/**
 * 服务端事件/状态同步收集器
 */ 
export class Collector implements ICollector {
  private control: AppInMainViewManager;
  private plugin: AppInMainViewPlugin;
  private storageObserver: ObserverMap<AppId, AppState>;
  private stateDisposer: (() => void) | undefined;
  constructor(props:CollectorProps){
    this.control = props.control;
    this.plugin = props.plugin;
    this.storageObserver = new ObserverMap(Object.entries(this.getAttributes()));
    this.storageObserver.observe((operation, key, value) => {
      this.control.onAppStateChange(operation, key, value);
    });
    this.observeStorage();
  }
  get storage():ObserverMap<AppId, AppState>{
    return this.storageObserver;
  }
  public getAppState(appId: AppId):AppState{
    return this.storageObserver.get(appId) as AppState;
  }
  public addAppState(appId: AppId, appState: AppState): void {
    if (this.control.isWritable) {
      this.plugin?.updateAttributes([appId], appState);
    }
  }
  public deleteAppState(appId: AppId): void {
    if (this.control.isWritable) {
      this.plugin?.updateAttributes([appId], undefined);
    }
  }
  public updateAppState(appId: AppId, appState: AppState): void {
    if (this.control.isWritable) {
      this.plugin?.updateAttributes([appId], appState);
    }
  }
  private getAttributes(): AppInMainViewPluginAttributes {
    return (toJS(this.plugin.attributes) || {}) as AppInMainViewPluginAttributes;
  }
  private diff(newStorage:AppInMainViewPluginAttributes){
    const newKeys = plainObjectKeys(newStorage);
    for (const key of newKeys) {
      if (!this.storageObserver.has(key)) {
        this.storageObserver.set(key, newStorage[key]);
      } else {
        if (!isEqual(this.storageObserver.get(key), newStorage[key])) {
          this.storageObserver.set(key, newStorage[key]);
        }
      }
    }
    for (const key of [...this.storageObserver.keys()]) {
      if (!newKeys.includes(key)) {
        this.storageObserver.delete(key);
      }
    }
  }
  private observeStorage(){
    this.stateDisposer = autorun(async () => {
      const newStorage = this.getAttributes();
      this.diff(newStorage);
    });
  }
  public destroy(): void {
    this.stateDisposer?.();
  }
}