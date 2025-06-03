import type { WindowManager } from '@netless/window-manager';
import type { AppInMainViewPlugin } from './plugin';
import type { AppId, AppInMainViewOptions, AppState, AppStatus, Logger, OperationType, PublicEvent, TeleBoxStateType } from './types';
import EventEmitter2, { Listener } from 'eventemitter2';
import { Collector } from './collector';
import { AppManager } from './appManager';
import { DefaultAppInMainViewPluginOptions, NameSpace, pkg_version } from './const';

export class EventEmitter<T extends PublicEvent> extends EventEmitter2 {
  public emit(event: T, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
  public on(event: T, listener: (...args: any[]) => void): this | Listener {
    return super.on(event, listener);
  }
}

enum TeleBoxState {
  Normal = 'normal',
  Minimized = 'minimized',
  Maximized = 'maximized'
}

export class AppInMainViewManager {
  readonly wm: WindowManager;
  readonly publicEventEmitter: EventEmitter<PublicEvent> = new EventEmitter();
  readonly logger: Logger;
  readonly version: string = pkg_version;

  private readonly pluginOptions: AppInMainViewOptions;
  private readonly injectStyleId: string = `${NameSpace}-inject-style`;
  private collector!: Collector;
  private plugin!: AppInMainViewPlugin;
  private isCurWritable:boolean = false;
  private originSetBoxState!: (status: TeleBoxStateType) => void;
  private originSetMinimized!: (minimized: boolean) => void;
  private appMenuManager!: AppManager;
  private focueTimer: NodeJS.Timeout | undefined;
  private titlebarTimer: NodeJS.Timeout | undefined;

  get isWritable(){
    return this.isCurWritable;
  }

  get wmTheme(){
    return this.wm.prefersColorScheme && this.wm.prefersColorScheme !== 'auto' ? this.wm.prefersColorScheme : DefaultAppInMainViewPluginOptions.theme;
  }

  constructor(props: {
    windowManager: WindowManager;
    options: AppInMainViewOptions;
    logger: Logger;
  }) {
    this.wm = props.windowManager;
    if (this.wm.room) {
      this.isCurWritable = this.wm.room.isWritable;
    }
    this.logger = props.logger;
    this.pluginOptions = props.options;
    this.restrictedSetBoxState();
  }

  get topBoxId(){
    const nodes = Array.from(document.querySelectorAll('div.telebox-box')) as Array<HTMLDivElement>;
    if (!nodes.length) {
      return undefined;
    }
    let maxZIndex = 0;
    let topBoxId;
    for (const node of nodes) {
      if (getComputedStyle(node).display === 'none') {
        continue;
      }
      const zIndex = Number(getComputedStyle(node).zIndex);
      const id = node.getAttribute('data-tele-box-i-d');
      if(zIndex > maxZIndex && id) {
        maxZIndex = zIndex;
        topBoxId = id;
      }
    }
    return topBoxId;
  }

  get focused(){
    return this.wm.focused;
  }

  private init(){
    if (this.wm.room) {
      ((this.wm.room as any).logger as Logger).info(`[AppInMainViewPlugin] appInMainViewManager init ${JSON.stringify(this.pluginOptions)}`);
    }
    this.initInjectStyle();
    this.collector = new Collector({
      control: this,
      plugin: this.plugin,
    });
    this.observeWm();
    this.appMenuManager = new AppManager({
      control: this,
      options: this.pluginOptions,
    });
  }

  private initInjectStyle(){
    this.removeInjectStyle();
    const style = document.createElement('style');
    style.id = this.injectStyleId; // 唯一标识
    // 先添加到文档中，确保 style.sheet 可用
    document.head.appendChild(style);
    try {
      if (!style.sheet) {
        console.error('Style sheet is not available');
        return;
      }
      const cssRule = '.telebox-titles .telebox-titles-tab[data-tele-box-i-d], .telebox-box[data-tele-box-i-d], .telebox-titlebar.telebox-max-titlebar { display: none; }';
      // 尝试插入规则
      style.sheet.insertRule(cssRule, style.sheet.cssRules.length);
    } catch (error) {
      console.warn('Failed to insert style rule:', error);
      // 如果插入规则失败，使用 textContent 作为备选方案
      style.textContent = '.telebox-titles .telebox-titles-tab[data-tele-box-i-d], .telebox-box[data-tele-box-i-d], .telebox-titlebar.telebox-max-titlebar { display: none; }';
    }
  }

  private removeInjectStyle(){
    const style = document.getElementById(this.injectStyleId) as HTMLStyleElement;
    if (style) {
      style.remove();
    }
  }

  bindPlugin(plugin:AppInMainViewPlugin){
    this.plugin = plugin;
    this.init();
  }

  destroy(){
    this.unobserveWm();
    if (this.focueTimer) {
      clearTimeout(this.focueTimer);
      this.focueTimer = undefined;
    }
    if (this.titlebarTimer) {
      clearTimeout(this.titlebarTimer);
      this.titlebarTimer = undefined;
    }
    this.appMenuManager.destroy();
    this.removeInjectStyle();
    if (this.wm.room) {
      ((this.wm.room as any).logger as Logger).info('[AppInMainViewPlugin] AppInMainViewManager has been destroyed');
    }
  }

  private onWritableChange = () => {
    const isWritable = (this.wm.displayer as any).isWritable;
    this.isCurWritable = isWritable;
  };

  private setTitlebarNodeDisplay(display: 'flex' | 'none'){
    const titleBar = document.querySelector('div.telebox-titlebar.telebox-max-titlebar') as HTMLDivElement;
    if (titleBar) {
      if (display === 'flex') {
        titleBar.style.display = `${display}`;
      } else {
        titleBar.style.removeProperty('display');
      }
    }
  }

  private activeMaximizeBtn(app: AppId | HTMLDivElement, isActive: boolean=false){
    let maximizeBtn;
    if (app instanceof HTMLDivElement) {
      maximizeBtn = app.querySelector('button.telebox-titlebar-icon-maximize') as HTMLButtonElement;
    } else {
      maximizeBtn = document.querySelector(`.telebox-box[data-tele-box-i-d="${app}"] button.telebox-titlebar-icon-maximize`) as HTMLButtonElement;
    }
    if (!maximizeBtn) {
      return;
    }
    if (isActive && !maximizeBtn.classList.contains('is-active')) {
      maximizeBtn.classList.add('is-active');
    } else if (!isActive && maximizeBtn.classList.contains('is-active')) {
      maximizeBtn.classList.remove('is-active');
    }
  }

  private setAppNodeDisplay(appId: AppId, display: 'block' | 'none', isRenderMaximizeBtn: boolean=false){
    const appNodes = Array.from(document.querySelectorAll(`[data-tele-box-i-d="${appId}"]`)) as Array<HTMLButtonElement | HTMLDivElement>;
    if (!appNodes.length) {
      return;
    }
    appNodes.forEach((node) => {
      if (display === 'block') {
        node.style.display = `${display}`;
        if (isRenderMaximizeBtn && node instanceof HTMLDivElement) {
          if (this.wm.boxState === TeleBoxState.Maximized) {
            this.activeMaximizeBtn(node, true);
          } else {
            this.activeMaximizeBtn(node, false);
          }
        }
      } else {
        node.style.removeProperty('display');
      }
    });
  }

  observerFocusAppTimer(){
    if (this.focueTimer) {
      clearTimeout(this.focueTimer);
    }
    this.focueTimer = setTimeout(()=>{
      this.focueTimer = undefined;
      const boxState = this.wm.boxState;
      if (boxState === TeleBoxState.Maximized) {
        const topBoxId = this.topBoxId;
        if (topBoxId && this.focused !== topBoxId) {
          this.wm.focusApp(topBoxId);
        }
      }
    }, 100);
  }

  observeTitlebarTimer(){
    if (this.titlebarTimer) {
      clearTimeout(this.titlebarTimer);
    }
    this.titlebarTimer = setTimeout(() => {
      this.titlebarTimer = undefined;
      this.observeTitlebarHandler();
    }, 100);
  }
  private observeTitlebarHandler = () => {
    const status = this.wm.boxState;
    let isRenderTitlebar = false;
    const currentApps = this.getCurrentPageVisibleApps();
    if (status === TeleBoxState.Maximized) {
      if (currentApps.size < 2) {
        this.setTitlebarNodeDisplay('none');
      } else {
        this.setTitlebarNodeDisplay('flex');
      }
      isRenderTitlebar = true;
    } else {
      this.setTitlebarNodeDisplay('none');
    }
    for (const appId of currentApps) {
      if (isRenderTitlebar) {
        this.setAppNodeDisplay(appId, 'block', true);
      } else {
        this.activeMaximizeBtn(appId, false);
      }
    }
  };

  private observeBoxStateChangeHandler = () => {
    if (!this.checkBoxState()) return;
    this.observeTitlebarTimer();
    if (this.wm.boxState === TeleBoxState.Maximized) {
      this.observerFocusAppTimer();
    }
  };

  private getTargetParent = (dom: HTMLElement):HTMLDivElement | null => {
    if (dom.hasAttribute('data-tele-box-i-d')) {
      return dom as HTMLDivElement;
    } else if (dom.parentElement) {
      return this.getTargetParent(dom.parentElement as HTMLElement);
    }
    return null;
  };

  private minimizeBtnClickHandler = (e:MouseEvent | TouchEvent) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const target = this.getTargetParent(e.target as HTMLElement);
    if (target) {
      const id = target.getAttribute('data-tele-box-i-d');
      if (id) {
        this.hideApp(id);
      }
    }
  };

  private observeAppSetupHandler = (appId: AppId) => {
    const appElement = document.querySelector(`div.telebox-box[data-tele-box-i-d="${appId}"]`) as HTMLDivElement;
    if (appElement) {
      const value = this.collector.getAppState(appId);
      const scenePath = this.wm.mainView.focusScenePath;
      if (!value) {
        if (scenePath) {
          this.collector.addAppState(appId, {
            scenePath,
            status: 'visible',
          });
        }
      } else {
        if (value.status === 'visible' && scenePath === value.scenePath) {
          this.setAppNodeDisplay(appId, 'block');
        } else if (value.status === 'hidden') {
          this.setAppNodeDisplay(appId, 'none');
        }
        if (this.wm.boxState === TeleBoxState.Maximized) {
          this.observeTitlebarTimer();
          this.observerFocusAppTimer();
        }
      }
      // bind minimize btn click event
      const minimizeBtn = document.querySelector(`div[data-tele-box-i-d="${appId}"] .telebox-titlebar-icon-minimize`) as HTMLButtonElement;
      if (minimizeBtn) {
        minimizeBtn.removeEventListener('click', this.minimizeBtnClickHandler);
        minimizeBtn.addEventListener('click', this.minimizeBtnClickHandler);
      }
    }
    this.appMenuManager.updateAppInfo(appId);
  };

  private observeBoxCloseHandler = (props: { appId: AppId }) => {
    const isHas = this.collector.storage.has(props.appId);
    if (isHas) {
      this.collector.deleteAppState(props.appId);
    }
    const minimizeBtn = document.querySelector(`div[data-tele-box-i-d="${props.appId}"] .telebox-titlebar-icon-minimize`) as HTMLButtonElement;
    if (minimizeBtn) {
      minimizeBtn.removeEventListener('click', this.minimizeBtnClickHandler);
    }
  };

  private observeMainViewScenePathChangeHandler = (scenePath:string) => {
    this.collector.storage.forEach((appState, appId) => {
      if (appState.scenePath === scenePath && appState.status === 'visible') {
        this.setAppNodeDisplay(appId, 'block');
      } else {
        this.setAppNodeDisplay(appId, 'none');
      }
    });
    if (this.wm.boxState === TeleBoxState.Maximized ) {
      this.observeTitlebarTimer();
      this.observerFocusAppTimer();
    }
    const apps = this.getTargetPageApps(scenePath);
    this.appMenuManager.pageChangeHandler(scenePath, apps);
  };

  private observeMaxStateMinimizeBtnClickHandler = (e: MouseEvent) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const topBoxId = this.topBoxId;
    if (topBoxId) {
      this.hideApp(topBoxId);
    }
  };

  private restrictedSetBoxState(){
    this.originSetBoxState = this.wm.setBoxState;
    this.originSetMinimized = this.wm.setMinimized;
    this.wm.setBoxState = (status: TeleBoxStateType) => {
      if (status === TeleBoxState.Minimized) {
        this.logger.warn('[AppInMainViewPlugin] when use appInMainViewManager, setBoxState can not set to minimized');
        return;
      }
      this.originSetBoxState && this.originSetBoxState.call(this.wm, status);
    };
    this.wm.setMinimized = (minimized: boolean) => {
      if (minimized) {
        this.logger.warn('[AppInMainViewPlugin] when use appInMainViewManager, setMinimized can not set to minimized');
        return;
      }
      this.originSetMinimized && this.originSetMinimized.call(this.wm, minimized);
    };
  }

  private bindMaxStateMinimizeBtnClickHandler(){
    const maxStateMinimizeBtn = document.querySelector('div.telebox-max-titlebar .telebox-titlebar-icon-minimize') as HTMLButtonElement;
    if (maxStateMinimizeBtn) {
      maxStateMinimizeBtn.addEventListener('click', this.observeMaxStateMinimizeBtnClickHandler);
    }
  }

  private removeMaxStateMinimizeBtnClickHandler(){
    const maxStateMinimizeBtn = document.querySelector('div.telebox-max-titlebar .telebox-titlebar-icon-minimize') as HTMLButtonElement;
    if (maxStateMinimizeBtn) {
      maxStateMinimizeBtn.removeEventListener('click', this.observeMaxStateMinimizeBtnClickHandler);
    }
  }

  private observeMainViewMountedHandler = () => {
    this.bindMaxStateMinimizeBtnClickHandler();
  };

  private observeMainViewRebindHandler = () => {
    this.removeMaxStateMinimizeBtnClickHandler();
    this.bindMaxStateMinimizeBtnClickHandler();
  };

  private checkBoxState(){
    if (this.wm.boxState === TeleBoxState.Minimized) {
      this.logger.warn('[AppInMainViewPlugin] when use appInMainViewManager boxState can not minimized, but boxState is minimized now');
      if (this.isWritable) {
        this.wm.setMinimized(false);
      } else {
        this.logger.error(`[AppInMainViewPlugin] when use appInMainViewManager boxState can not minimized, but boxState is ${this.wm.boxState} and isWritable is ${this.isWritable} now.`);
      }
      return false;
    }
    return true;
  }

  observeWm(){
    this.bindMaxStateMinimizeBtnClickHandler();
    this.wm.emitter.on('boxStateChange', this.observeBoxStateChangeHandler);
    this.wm.emitter.on('onAppSetup', this.observeAppSetupHandler);
    this.wm.emitter.on('onBoxClose', this.observeBoxCloseHandler);
    this.wm.emitter.on('mainViewScenePathChange', this.observeMainViewScenePathChangeHandler);
    this.wm.emitter.on('onMainViewMounted', this.observeMainViewMountedHandler);
    this.wm.emitter.on('onMainViewRebind', this.observeMainViewRebindHandler);
    this.wm.displayer.callbacks.on('onEnableWriteNowChanged', this.onWritableChange);
    this.checkBoxState();
  }
  unobserveWm(){
    this.wm.setBoxState = this.originSetBoxState;
    this.wm.setMinimized = this.originSetMinimized;
    this.wm.emitter.off('boxStateChange', this.observeBoxStateChangeHandler);
    this.wm.emitter.off('onAppSetup', this.observeAppSetupHandler);
    this.wm.emitter.off('onBoxClose', this.observeBoxCloseHandler);
    this.wm.emitter.off('mainViewScenePathChange', this.observeMainViewScenePathChangeHandler);
    this.wm.emitter.off('onMainViewMounted', this.observeMainViewMountedHandler);
    this.wm.emitter.off('onMainViewRebind', this.observeMainViewRebindHandler);
    this.wm.displayer.callbacks.off('onEnableWriteNowChanged', this.onWritableChange);
    this.removeMaxStateMinimizeBtnClickHandler();
  }

  onAppStateChange(operation: OperationType, appId: AppId, value: AppState){
    const scenePath = this.wm.mainView.focusScenePath;
    if(!scenePath){
      return;
    }
    if (value.scenePath !== scenePath){
      this.setAppNodeDisplay(appId, 'none');
    } else {
      switch (operation) {
        case 'add': {
          this.setAppNodeDisplay(appId, 'block');
          break;
        }
        case 'delete': {
          this.setAppNodeDisplay(appId, 'none');
          break;
        }
        case 'update': {
          if (value.status === 'visible') {
            this.setAppNodeDisplay(appId, 'block');
          } else {
            this.setAppNodeDisplay(appId, 'none');
          }
          break;
        }
      }
      if (this.wm.boxState === TeleBoxState.Maximized) {
        this.observeTitlebarTimer();
        this.observerFocusAppTimer();
      }
    }
    this.appMenuManager.appChangeHandler(operation, appId, value);
  }

  hideApp(appId: AppId){
    const appState = this.collector.getAppState(appId);
    if (appState && appState.status === 'visible') {
      this.collector.updateAppState(appId, {
        ...appState,
        status: 'hidden',
      });
    }
  }

  showApp(appId: AppId){
    const appState = this.collector.getAppState(appId);
    if (appState && appState.status === 'hidden') {
      this.collector.updateAppState(appId, {
        ...appState,
        status: 'visible',
      });
    }
  }

  showCurrentPageApps(){
    const apps = this.getCurrentPageApps();
    apps.forEach((appState, appId) => {
      if (appState === 'hidden') {
        this.showApp(appId);
      }
    });
  }

  hiddenCurrentPageApps(){
    const apps = this.getCurrentPageVisibleApps();
    apps.forEach((appId) => {
      this.hideApp(appId);
    });
  }

  get isCurrentPageAppsAllVisible(){
    const apps = this.getCurrentPageApps();
    return apps.values().every((appState) => {
      return appState === 'visible';
    });
  }

  get isCurrentPageAppsAllHidden(){
    const apps = this.getCurrentPageApps();
    return apps.values().every((appState) => {
      return appState === 'hidden';
    });
  }

  getTargetPageVisibleApps(scenePath: string){
    const apps: Set<AppId> = new Set();
    this.collector.storage.forEach((appState, appId)=>{
      if (appState.scenePath === scenePath && appState.status === 'visible') {
        apps.add(appId);
      }
    });
    return apps;
  }

  getTargetPageApps(scenePath: string){
    const apps: Map<AppId, AppStatus> = new Map();
    this.collector.storage.forEach((appState, appId)=>{
      if (appState.scenePath === scenePath) {
        apps.set(appId, appState.status);
      }
    });
    return apps;
  }

  getCurrentPageVisibleApps(){
    const scenePath = this.wm.mainView.focusScenePath;
    if (!scenePath) {
      return new Set<AppId>();
    }
    return this.getTargetPageVisibleApps(scenePath);
  }

  getCurrentPageApps(){
    const scenePath = this.wm.mainView.focusScenePath;
    if (!scenePath) {
      return new Map<AppId, AppStatus>();
    }
    return this.getTargetPageApps(scenePath);
  }
}
