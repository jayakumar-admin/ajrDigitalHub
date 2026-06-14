import { Injectable, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light' | 'neon';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<AppTheme>('dark');

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
    if (typeof window !== 'undefined') {
      localStorage.setItem('ajr-hub-theme', theme);
      
      // Update body classes
      const body = document.body;
      body.classList.remove('dark', 'light', 'neon');
      body.classList.add(theme);

      // Update html classes for tailwind variables compatibility
      const html = document.documentElement;
      html.classList.remove('dark', 'light', 'neon');
      html.classList.add(theme);

      // Neon is a dark-based theme, so ensure standard Tailwind dark: utility classes also apply in neon theme
      if (theme === 'dark' || theme === 'neon') {
        html.classList.add('dark');
        body.classList.add('dark');
      }
    }
  }
}
