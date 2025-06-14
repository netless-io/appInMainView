import { AppInMainViewOptions } from './types';

declare let __NAME__: string, __VERSION__: string;
export const pkg_version = __VERSION__;
export const pkg_name = __NAME__;

if (typeof window !== 'undefined') {
  let str = (window as { __netlessUA?: string }).__netlessUA || '';
  str += ` ${pkg_name}@${pkg_version}`;
  (window as { __netlessUA?: string }).__netlessUA = str;
}

export const DefaultAppInMainViewPluginOptions: Required<AppInMainViewOptions> = {
  enableDefaultUI: true,
  onlyShowHidden: false,
  language: 'en',
  theme: 'light',
};

export const NameSpace = 'default-app-in-main-view-plugin';