import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme';
  private dark = true;
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (!this.isBrowser) {
      return;
    }

    const saved = localStorage.getItem(this.storageKey);
    this.dark = saved ? saved === 'dark' : true;
    this.apply();
  }

  isDark(): boolean {
    return this.dark;
  }

  toggle(): void {
    this.dark = !this.dark;
    this.apply();
  }

  private apply(): void {
    if (!this.isBrowser) {
      return;
    }

    const theme = this.dark ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }
}
