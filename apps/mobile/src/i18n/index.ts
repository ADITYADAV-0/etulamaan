import en from './translations/en.json';
import hi from './translations/hi.json';

export type Language = 'en' | 'hi';

let currentLanguage: Language = 'en';
const translations: Record<Language, any> = { en, hi };

export function setLanguage(lang: Language) {
  currentLanguage = lang;
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function t(path: string, params?: Record<string, string | number>): string {
  const keys = path.split('.');
  let result = translations[currentLanguage];

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      // Fallback to English
      let fallback = translations['en'];
      for (const k of keys) {
        if (fallback && typeof fallback === 'object' && k in fallback) {
          fallback = fallback[k];
        } else {
          return path; // Return raw key if missing
        }
      }
      result = fallback;
      break;
    }
  }

  if (typeof result === 'string' && params) {
    Object.keys(params).forEach(paramKey => {
      result = (result as string).replace(`{${paramKey}}`, String(params[paramKey]));
    });
  }

  return typeof result === 'string' ? result : path;
}
