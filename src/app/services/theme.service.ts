import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'dark' | 'light' | 'neon';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<AppTheme>('dark');
  theme$ = new BehaviorSubject<AppTheme>('dark');

  constructor() {
    this.loadTheme();
  }

  loadTheme() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ajr-hub-theme') as AppTheme;
      if (saved && ['dark', 'light', 'neon'].includes(saved)) {
        this.setTheme(saved);
      } else {
        this.setTheme('dark');
      }
    }
  }

  setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
    this.theme$.next(theme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('ajr-hub-theme', theme);
      
      const body = document.body;
      const html = document.documentElement;
      
      const themeClass = theme + '-theme';

      // Update body classes
      body.classList.remove('dark-theme', 'light-theme', 'neon-theme');
      body.classList.add(themeClass);

      // Support for standard tailwind "dark:" utilities
      if (theme === 'dark' || theme === 'neon') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }
}
