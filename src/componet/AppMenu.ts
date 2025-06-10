import { AppId } from '../types';
import './style.less';
import { AppManager, AppValue } from '../appManager';
import { I18n, I18nKey, Language } from './locale';
import { NameSpace } from '../const';

export interface AppMenuProps {
  manager: AppManager;
  onlyShowHidden: boolean;
  language: Language;
  theme: 'light' | 'dark';
}

export class AppMenu {
  private readonly namespace: string = NameSpace;
  public readonly container: HTMLDivElement = document.createElement('div');
  private readonly badge: HTMLDivElement = document.createElement('div');
  private readonly menuView: HTMLDivElement = document.createElement('div');
  private readonly manager: AppManager;
  private readonly onlyShowHidden: boolean;
  private readonly language: Language;
  private i18n: Record<I18nKey, string>;
  private theme: 'light' | 'dark';
  private isBindContainer: boolean = false;

  constructor(props: AppMenuProps) {
    this.manager = props.manager;
    this.onlyShowHidden = props.onlyShowHidden;
    this.language = props.language;
    this.i18n = I18n[this.language];
    this.theme = props.theme;
    this.init();
    this.observe();
  }

  private c(className: string): string {
    return `${this.namespace}-${className}`;
  }

  private containerClickHandler = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (this.manager.control.wm.readonly) {
      return;
    }
    const isShowMenuView = getComputedStyle(this.menuView).display === 'flex';
    if (isShowMenuView) {
      this.menuView.style.display = 'none';
    } else {
      this.menuView.style.display = 'flex';
    }
  };

  private menuViewClickHandler = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const target = e.target as HTMLElement;
    const id = target.getAttribute(`data-${this.c('app-id')}`);
    if (id) {
      this.manager.control.showApp(id);
      return;
    }
    const type = target.getAttribute(`data-${this.c('btn-type')}`);
    if (type === 'show-all') {
      this.manager.control.showCurrentPageApps();
      return;
    } 
    if (type === 'hidden-all') {
      this.manager.control.hiddenCurrentPageApps();
      return;
    }
  };

  private bindContainer(){
    const collectorBtn = document.querySelector('button.telebox-collector') as HTMLButtonElement;
    if (collectorBtn) {
      collectorBtn.insertAdjacentElement('afterend', this.container);
      this.isBindContainer = true;
    }
  }

  private removeContainer(){
    const parent = this.container.parentElement;
    if (parent) {
      parent.removeChild(this.container);
      this.isBindContainer = false;
    }
  }

  private createDefaultAppMenu(){
    this.badge.classList.add(this.c('app-menu-badge'));
    this.menuView.classList.add(this.c('app-menu-tooltip'));
    this.container.classList.add(this.c('app-menu-container'), this.theme);
    this.menuView.addEventListener('click', this.menuViewClickHandler);
    this.container.addEventListener('click', this.containerClickHandler);
    this.container.append(this.badge, this.menuView);
    this.bindContainer();
  }

  private async init(){
    const apps = await this.manager.getApps();
    this.createDefaultAppMenu();
    this.render(apps);
  }

  private appMenuChangeHandler = (apps: Map<AppId, AppValue>) => {
    this.render(apps);
  };

  private onPrefersColorSchemeChangeHandler = () => {
    this.container.classList.remove(this.theme);
    this.theme = this.manager.control.wmTheme;
    this.container.classList.add(this.theme);
  };
  

  private onMainViewMountedHandler = () => {
    if (!this.isBindContainer) {
      this.bindContainer();
    }
  };

  private onMainViewRebindHandler = () => {
    this.removeContainer();
    this.bindContainer();
  };

  private onFullscreenChangeHandler = (fullscreen: boolean) => {
    if (fullscreen) {
      this.container.style.display = 'none';
    } else {
      this.container.style.display = 'block';
    }
  };

  observe() {
    this.manager.control.publicEventEmitter.on('appMenuChange', this.appMenuChangeHandler);
    this.manager.control.wm.emitter.on('prefersColorSchemeChange', this.onPrefersColorSchemeChangeHandler);
    this.manager.control.wm.emitter.on('onMainViewMounted', this.onMainViewMountedHandler);
    this.manager.control.wm.emitter.on('onMainViewRebind', this.onMainViewRebindHandler);
    this.manager.control.wm.emitter.on('fullscreenChange', this.onFullscreenChangeHandler);
  }
  
  unobserve(){
    this.manager.control.publicEventEmitter.off('appMenuChange', this.appMenuChangeHandler);
    this.manager.control.wm.emitter.off('prefersColorSchemeChange', this.onPrefersColorSchemeChangeHandler);
    this.manager.control.wm.emitter.off('onMainViewMounted', this.onMainViewMountedHandler);
    this.manager.control.wm.emitter.off('onMainViewRebind', this.onMainViewRebindHandler);
    this.manager.control.wm.emitter.off('fullscreenChange', this.onFullscreenChangeHandler);
  }

  private createItem(appId: AppId, app: AppValue){
    const appItem = document.createElement('div');
    appItem.classList.add(this.c('app-menu-item'));
    if (app.status === 'hidden') {
      appItem.classList.add('active');
    }
    if (!this.onlyShowHidden) {
      appItem.classList.add('has-dot');
    }
    appItem.setAttribute(`data-${this.c('app-id')}`, appId);
    if (!this.onlyShowHidden && app.status === 'visible') {
      const dotDiv = document.createElement('div');
      dotDiv.classList.add(this.c('app-menu-item-dot'));
      appItem.appendChild(dotDiv);
    }
    const titleDiv = document.createElement('div');
    titleDiv.classList.add(this.c('app-menu-item-title'));
    if (app.appInfo) {
      const attr = app.appInfo.appAttributes;
      const title = attr.options.title || appId;
      titleDiv.innerText = title;
    } else {
      titleDiv.innerText = appId;
    }
    appItem.appendChild(titleDiv);
    return appItem;
  }

  private createShowBtn(){
    const showAllItem = document.createElement('div');
    showAllItem.classList.add(this.c('app-menu-item'), 'show-all');
    showAllItem.setAttribute(`data-${this.c('btn-type')}`, 'show-all');
    const titleDiv = document.createElement('div');
    titleDiv.classList.add(this.c('app-menu-item-title'));
    titleDiv.innerText = this.i18n.show;
    showAllItem.appendChild(titleDiv);
    return showAllItem;

  }
  private createHidBtn(){
    const hidAllItem = document.createElement('div');
    hidAllItem.classList.add(this.c('app-menu-item'), 'hidden-all');
    hidAllItem.setAttribute(`data-${this.c('btn-type')}`, 'hidden-all');
    const titleDiv = document.createElement('div');
    titleDiv.classList.add(this.c('app-menu-item-title'));
    titleDiv.innerText = this.i18n.hidden;
    hidAllItem.appendChild(titleDiv);
    return hidAllItem;

  }

  private updateMenuView(apps: Map<AppId, AppValue>){
    let isActiveShowAll = false;
    let isActiveHidAll = false;
    const currentPageApps = this.manager.control.getCurrentPageApps();
    currentPageApps.forEach((status) => {
      if (status === 'visible') {
        isActiveHidAll = true;
      } else {
        isActiveShowAll = true;
      }
    });
    const items: HTMLDivElement[] = [];
    apps.forEach((app, appId) => {
      items.push(this.createItem(appId, app));
    });
    const showAllItem = this.createShowBtn();
    if (isActiveShowAll) {
      showAllItem.classList.add('active');
    }
    const hidAllItem = this.createHidBtn();
    if (isActiveHidAll) {
      hidAllItem.classList.add('active');
    }
    this.menuView.append(...items, showAllItem, hidAllItem);
  }

  render(apps: Map<AppId, AppValue>) {
    this.menuView.style.display = 'none';
    this.badge.innerText = '';
    this.menuView.innerHTML = '';
    if (apps.size === 0) {
      this.container.style.display = 'none';
    } else {
      this.badge.innerText = apps.size.toString();
      this.updateMenuView(apps);
      this.container.style.display = 'block';
    }
  }
  destroy(){
    this.unobserve();
    this.badge.remove();
    this.menuView.removeEventListener('click', this.menuViewClickHandler);
    this.menuView.remove();
    this.container.removeEventListener('click', this.containerClickHandler);
    this.container.remove();
    this.removeContainer();
  }
}

