import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="left-panel">
        <div class="brand">
          <div class="brand-icon">🏙️</div>
          <span class="brand-name">Civic Smart City</span>
        </div>
        <div class="badge-pill">JOIN THE PLATFORM</div>
        <h1 class="hero-text">
          Your Voice <span class="accent">Matters</span><br/>In Your City
        </h1>
        <p class="hero-sub">
          Register to submit grievances, track civic issues, and help
          build a smarter, more responsive city.
        </p>
        <div class="stats-row">
          <div class="stat">
            <div class="stat-num">12K+</div>
            <div class="stat-label">Active Citizens</div>
          </div>
          <div class="stat">
            <div class="stat-num">340+</div>
            <div class="stat-label">Issues Resolved</div>
          </div>
          <div class="stat">
            <div class="stat-num">98%</div>
            <div class="stat-label">Satisfaction</div>
          </div>
        </div>
      </div>
      <div class="right-panel">
        <div class="form-card">
          <h2>Create Account</h2>
          <p class="form-sub">
            Already have an account?
            <a routerLink="/login">Sign in</a>
          </p>
          <form [formGroup]="form" (ngSubmit)="onRegister()">
            <div class="field">
              <label>Full Name</label>
              <div class="input-wrap">
                <span class="input-icon">👤</span>
                <input formControlName="username" placeholder="Your full name"/>
              </div>
            </div>
            <div class="field">
              <label>Email Address</label>
              <div class="input-wrap">
                <span class="input-icon">📧</span>
                <input formControlName="email" type="email" placeholder="you@email.com"/>
              </div>
            </div>
            <div class="field">
              <label>Password</label>
              <div class="input-wrap">
                <span class="input-icon">🔒</span>
                <input formControlName="password" type="password" placeholder="Min 6 characters"/>
              </div>
            </div>
            <div class="field">
              <label>Register as</label>
              <div class="select-wrap">
                <select formControlName="role">
                  <option value="CITIZEN">Citizen</option>
                  <option value="OFFICER">Department Officer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <p class="success" *ngIf="success">{{ success }}</p>
            <p class="err" *ngIf="error">{{ error }}</p>
            <button type="submit" [disabled]="form.invalid || loading" class="btn-signin">
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>
          <p class="register-link">
            Already registered? <a routerLink="/login">Sign in →</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .login-wrapper { display: flex; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
    .left-panel {
      flex: 0 0 55%; background: linear-gradient(135deg, #0a0f2e 0%, #0d1b4b 50%, #091533 100%);
      padding: 48px 56px; display: flex; flex-direction: column;
      justify-content: center; gap: 24px; position: relative; overflow: hidden;
    }
    .left-panel::before {
      content: ''; position: absolute; top: -100px; right: -100px;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(0,150,200,0.15) 0%, transparent 70%);
    }
    .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .brand-icon {
      width: 44px; height: 44px; background: #1a3a6b; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; font-size: 22px;
    }
    .brand-name { color: #fff; font-size: 18px; font-weight: 600; }
    .badge-pill {
      display: inline-block; padding: 5px 14px;
      border: 1px solid rgba(0,150,220,0.5); border-radius: 20px;
      color: #60a5fa; font-size: 11px; letter-spacing: 1.5px; font-weight: 600; width: fit-content;
    }
    .hero-text { font-size: 48px; font-weight: 900; color: #fff; line-height: 1.15; }
    .accent { color: #22d3ee; }
    .hero-sub { color: #94a3b8; font-size: 15px; line-height: 1.7; max-width: 420px; }
    .stats-row { display: flex; gap: 40px; margin-top: 12px; }
    .stat-num { font-size: 28px; font-weight: 800; color: #fff; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 2px; }
    .right-panel {
      flex: 1; background: #fff; display: flex;
      align-items: center; justify-content: center; padding: 48px 40px;
    }
    .form-card { width: 100%; max-width: 400px; }
    h2 { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    .form-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; }
    .form-sub a { color: #2563eb; text-decoration: none; font-weight: 500; }
    .field { margin-bottom: 18px; }
    label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }
    .input-wrap {
      display: flex; align-items: center; border: 2px solid #e5e7eb;
      border-radius: 10px; padding: 0 14px; gap: 10px; transition: border-color 0.2s;
    }
    .input-wrap:focus-within { border-color: #2563eb; }
    .input-icon { font-size: 16px; flex-shrink: 0; }
    .input-wrap input {
      flex: 1; border: none; outline: none; padding: 13px 0;
      font-size: 15px; color: #111; background: transparent;
    }
    .select-wrap { border: 2px solid #e5e7eb; border-radius: 10px; padding: 0 14px; }
    .select-wrap select {
      width: 100%; border: none; outline: none; padding: 13px 0;
      font-size: 15px; color: #111; background: transparent; cursor: pointer;
    }
    .btn-signin {
      width: 100%; padding: 14px; background: #2563eb; color: #fff;
      border: none; border-radius: 10px; font-size: 16px; font-weight: 700;
      cursor: pointer; margin-top: 8px;
    }
    .btn-signin:hover:not(:disabled) { background: #1d4ed8; }
    .btn-signin:disabled { background: #93c5fd; cursor: not-allowed; }
    .err { color: #ef4444; font-size: 13px; margin-bottom: 10px; }
    .success { color: #10b981; font-size: 13px; margin-bottom: 10px; }
    .register-link { text-align: center; font-size: 14px; color: #64748b; margin-top: 20px; }
    .register-link a { color: #2563eb; text-decoration: none; font-weight: 600; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  error = ''; success = ''; loading = false;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role:     ['CITIZEN', Validators.required]
    });
  }
  onRegister() {
    this.error = ''; this.success = ''; this.loading = true;
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => { this.loading = false; this.error = 'Registration failed. Email may already exist.'; }
    });
  }
}
