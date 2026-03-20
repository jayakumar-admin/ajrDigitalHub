import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private platformId = inject(PLATFORM_ID);
  darkMode = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkMode.set(saved === 'true' || (!saved && prefersDark));
    }

    effect(() => {
      const isDark = this.darkMode();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('darkMode', isDark.toString());
        if (isDark) {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
      }
    });
  }

  toggle() {
    this.darkMode.update(v => !v);
  }
}
