import { Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private doc = inject(DOCUMENT);
  isDark = signal<boolean>(false);

  constructor() {
    const stored = localStorage.getItem('ep_theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.enableDark();
    }
  }

  toggleTheme(): void {
    if (this.isDark()) {
      this.enableLight();
    } else {
      this.enableDark();
    }
  }

  enableDark(): void {
    this.doc.documentElement.classList.add('dark');
    localStorage.setItem('ep_theme', 'dark');
    this.isDark.set(true);
  }

  enableLight(): void {
    this.doc.documentElement.classList.remove('dark');
    localStorage.setItem('ep_theme', 'light');
    this.isDark.set(false);
  }
}
