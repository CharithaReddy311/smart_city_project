import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API = 'http://localhost:8080/api/auth';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Only load auth state in browser, not on server
    if (this.isBrowser) {
      this.loadAuthState();
    }
  }

  private loadAuthState(): void {
    // Load persisted auth state from localStorage on browser startup
    const token = localStorage.getItem('civicpulse_token');
    const role = localStorage.getItem('civicpulse_role');
    const username = localStorage.getItem('civicpulse_username');
    
    // If any auth data is missing while token exists, clear all (corrupted state)
    if (token && (!role || !username)) {
      localStorage.removeItem('civicpulse_token');
      localStorage.removeItem('civicpulse_role');
      localStorage.removeItem('civicpulse_username');
    }
  }

  private isInBrowser(): boolean {
    return this.isBrowser && typeof localStorage !== 'undefined';
  }

  register(data: any) {
    return this.http.post(`${this.API}/register`, data);
  }

  login(data: any) {
    return this.http.post<any>(`${this.API}/login`, data).pipe(
      tap(res => {
        // Ensure we have all required fields before storing
        if (this.isInBrowser() && res && res.token && res.role && res.username) {
          localStorage.setItem('civicpulse_token', res.token);
          localStorage.setItem('civicpulse_role', res.role);
          localStorage.setItem('civicpulse_username', res.username);
        }
      })
    );
  }

  logout() {
    if (this.isInBrowser()) {
      localStorage.removeItem('civicpulse_token');
      localStorage.removeItem('civicpulse_role');
      localStorage.removeItem('civicpulse_username');
    }
    this.router.navigate(['/login']);
  }

  getToken(): string | null { 
    return this.isInBrowser() ? localStorage.getItem('civicpulse_token') : null;
  }
  
  getRole(): string | null { 
    return this.isInBrowser() ? localStorage.getItem('civicpulse_role') : null;
  }
  
  getUsername(): string | null { 
    return this.isInBrowser() ? localStorage.getItem('civicpulse_username') : null;
  }
  
  isLoggedIn(): boolean { 
    if (!this.isInBrowser()) return false;
    const token = localStorage.getItem('civicpulse_token');
    const role = localStorage.getItem('civicpulse_role');
    return !!(token && role);
  }
}