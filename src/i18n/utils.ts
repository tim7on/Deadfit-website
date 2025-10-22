import { BASE_ROUTE } from '../constants/info';
import { ui, defaultLang, showDefaultLang, routes } from './ui';


export function getLangFromUrl(url: URL) {
  const [, , lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function getRouteFromUrl(url: URL): string | undefined {
  const pathname = new URL(url).pathname;
  // Remove base path and split
  const pathWithoutBase = pathname.replace(BASE_ROUTE, '');
  const parts = pathWithoutBase.split('/').filter(Boolean);

  if (parts.length === 0) return undefined;

  // Check if the first part is a language code
  const possibleLang = parts[0];
  if (possibleLang in ui) {
    // If it's a language code, the route is the second part
    const route = parts[1];
    if (!route) return undefined;

    if (defaultLang === possibleLang) {
      const defaultRoutes = routes[defaultLang];
      return route in defaultRoutes ? route : undefined;
    }

    const langRoutes = routes[possibleLang as keyof typeof routes];
    const getKeyByValue = (obj: Record<string, string>, value: string): string | undefined => {
      return Object.keys(obj).find((key) => obj[key] === value);
    }

    const reversedKey = getKeyByValue(langRoutes, route);
    if (reversedKey !== undefined) {
      return reversedKey;
    }
  } else {
    // If the first part is not a language code, it's the route itself
    const route = parts[0];
    const defaultRoutes = routes[defaultLang];
    return route in defaultRoutes ? route : undefined;
  }

  return undefined;
}


export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: keyof typeof ui = lang) {
    const pathName = path.replaceAll('/', '')
    const hasTranslation = defaultLang !== l && routes[l] !== undefined && (routes[l] as Record<string, string>)[pathName] !== undefined
    const translatedPath = hasTranslation ? '/' + (routes[l] as Record<string, string>)[pathName] : path

    const fullPath = !showDefaultLang && l === defaultLang ? `${BASE_ROUTE}${translatedPath}` : `${BASE_ROUTE}/${l}${translatedPath}`
    return fullPath;
  }
}


export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}
