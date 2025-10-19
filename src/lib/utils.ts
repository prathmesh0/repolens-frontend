import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function removeFromLocalStorage(key: string) {
  if (localStorage) {
    localStorage.removeItem(key);
  }
}
