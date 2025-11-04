import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const saveToLocalStorage = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeFromLocalStorage = (key: string) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

export const getFromLocalStorage = (key: string) => {
  if (typeof window === 'undefined') return null;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const clearAuthStorage = () => {
  removeFromLocalStorage('token');
  removeFromLocalStorage('refreshToken');
  removeFromLocalStorage('user');
};

export function parseJSONSafe(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}
