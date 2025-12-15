
import Cookies, { CookieAttributes } from "js-cookie";

export const cookieStorage = {
  getItem(key: string, defaultValue?: string) {
    return Cookies.get(key) ?? defaultValue ?? null;
  },
  getItemJSON<T>(key: string, defaultValue?: T) {
    try {
      return JSON.parse(cookieStorage.getItem(key) || "") as T;
    } catch {
      return defaultValue ?? null;
    }
  },
  setItem(key: string, newValue: string, options?: CookieAttributes) {
    Cookies.set(key, String(newValue), options);
  },
  removeItem(key: string) {
    Cookies.remove(key);
  },
};
