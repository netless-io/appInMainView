export type Language = 'en' | 'zh-CN';

export type I18nData<T extends string> = Record<Language, Record<T, string>>;


export type I18nKey = 'show' | 'hidden';

export const I18n: I18nData<I18nKey> = {
  'en': {
    show: 'show all',
    hidden: 'hidden all',
  },
  'zh-CN': {
    show: '全部展开',
    hidden: '全部收起',
  },
};