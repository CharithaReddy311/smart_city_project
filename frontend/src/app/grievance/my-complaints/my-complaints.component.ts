import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-complaints',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-dot">🏙️</div>
          <div class="brand-text">Civic<span>Pulse</span></div>
        </div>
        <div class="user-pill">
          <div class="user-dot"></div>
          <div>
            <div class="user-role">CITIZEN</div>
            <div class="user-name">&#64;{{ auth.getUsername() }}</div>
          </div>
        </div>
        <div class="nav-section-label">MAIN</div>
        <div class="nav-item" (click)="router.navigate(['/citizen/dashboard'])"><span class="nav-icon">🏠</span> Overview</div>
        <div class="nav-item active"><span class="nav-icon">➕</span> Submit Grievance</div>
        <div class="nav-item" (click)="router.navigate(['/citizen/my-complaints'])"><span class="nav-icon">☰</span> My Grievances</div>
        <div class="nav-section-label">ACCOUNT</div>
        <div class="nav-item"><span class="nav-icon">⭐</span> Feedback & Ratings</div>
        <div class="nav-item"><span class="nav-icon">👤</span> My Profile</div>
        <div class="nav-item"><span class="nav-icon">🔔</span> Notifications <span class="nav-badge" style="background:#f59e0b">2</span></div>
        <div class="sidebar-footer">
          <button class="signout-btn" (click)="auth.logout()"><span>↪</span> Sign Out</button>
        </div>
      </aside>

      <main class="main-content">
        <div class="topnav">
          <div>
            <div class="page-title">Submit Grievance</div>
            <div class="page-date">{{ today }}</div>
          </div>
          <div class="topnav-right">
            <div class="role-badge">CITIZEN</div>
            <div class="avatar">{{ auth.getUsername()?.[0]?.toUpperCase() }}</div>
          </div>
        </div>

        <div class="page-content">
          <div class="page-header">
            <h1>📝 File a New Grievance</h1>
            <p>Report a civic issue in your area. We'll track it until resolved.</p>
          </div>

          <div class="card" style="max-width:720px;">
            <div class="card-header">
              <div class="card-title">Grievance Details</div>
              <div class="stat-chip chip-teal">Step 1 of 1</div>
            </div>

            <div style="padding:24px;">
              <form [formGroup]="form" (ngSubmit)="onSubmit()">

                <div class="form-group">
                  <label class="form-label">Issue Title *</label>
                  <input class="form-input" formControlName="title"
                    placeholder="Brief description of the issue"/>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                  <div class="form-group">
                    <label class="form-label">Category *</label>
                    <select class="form-select" formControlName="category">
                      <option value="">Select category</option>
                      <option value="WATER">💧 Water Supply</option>
                      <option value="ROAD">🛣️ Roads & Pavement</option>
                      <option value="SANITATION">🗑️ Sanitation</option>
                      <option value="ELECTRICITY">⚡ Electricity</option>
                      <option value="STREET_LIGHT">💡 Street Lights</option>
                      <option value="OTHER">📋 Other</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Location *</label>
                    <div style="display:flex; gap:8px;">
                      <input class="form-input" formControlName="location" placeholder="Area or address" style="flex:1;"/>
                      <button type="button" (click)="detectLocation()"
                        style="padding:0 14px; background:#1e293b; border:1px solid #334155; border-radius:10px; color:#94a3b8; cursor:pointer; white-space:nowrap; font-size:13px;">
                        📍 GPS
                      </button>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Description *</label>
                  <textarea class="form-textarea" formControlName="description" rows="4"
                    placeholder="Describe the issue in detail — when it started, severity, impact on residents..."></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">Upload Image (optional)</label>
                  <div class="upload-zone" (click)="fileInput.click()" [class.has-file]="selectedFile">
                    <input #fileInput type="file" accept="image/*" style="display:none"
                      (change)="onFileSelect($event)"/>
                    <div *ngIf="!selectedFile" style="text-align:center;">
                      <div style="font-size:32px; margin-bottom:8px;">📷</div>
                      <div style="font-size:14px; color:#475569;">Click to upload photo evidence</div>
                      <div style="font-size:12px; color:#334155; margin-top:4px;">PNG, JPG up to 10MB</div>
                    </div>
                    <div *ngIf="selectedFile" style="text-align:center; color:#0d9488;">
                      <div style="font-size:24px; margin-bottom:6px;">✅</div>
                      <div style="font-size:13px; font-weight:600;">{{ selectedFile.name }}</div>
                    </div>
                  </div>
                </div>

                <div *ngIf="success" class="msg-success">{{ success }}</div>
                <div *ngIf="error" class="msg-error">{{ error }}</div>

                <div style="display:flex; gap:12px;">
                  <button type="submit" class="submit-btn" [disabled]="form.invalid || loading">
                    {{ loading ? 'Submitting...' : '📤 Submit Grievance' }}
                  </button>
                  <button type="button"
                    style="padding:12px 24px; background:#1e293b; border:1px solid #334155; border-radius:10px; color:#94a3b8; cursor:pointer; font-size:14px;"
                    (click)="router.navigate(['/citizen/dashboard'])">
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['../../../styles/shared-layout.scss'],
  styles: [`
    :host { display: block; }
    .upload-zone {
      border: 2px dashed #1e293b; border-radius: 12px; padding: 32px 20px;
      cursor: pointer; transition: all 0.2s; background: #0d1117;
    }
    .upload-zone:hover { border-color: #0d9488; }
    .upload-zone.has-file { border-color: #0d9488; background: rgba(13,148,136,0.05); }
  `]
})
export class MyComplaintsComponent {
  form: FormGroup;
  selectedFile: File | null = null;
  error = ''; success = ''; loading = false;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  constructor(private fb: FormBuilder, private http: HttpClient, public auth: AuthService, public router: Router) {
    this.form = this.fb.group({
      title:       ['', Validators.required],
      category:    ['', Validators.required],
      location:    ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  detectLocation() {
    if (!navigator.geolocation) { this.error = 'GPS not supported'; return; }
    navigator.geolocation.getCurrentPosition(
      pos => this.form.patchValue({ location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }),
      () => this.error = 'Could not get location'
    );
  }

  onSubmit() {
    this.error = ''; this.success = ''; this.loading = true;
    const fd = new FormData();
    fd.append('title', this.form.value.title);
    fd.append('description', this.form.value.description);
    fd.append('category', this.form.value.category);
    fd.append('location', this.form.value.location);
    if (this.selectedFile) fd.append('image', this.selectedFile);

    this.http.post('http://localhost:8080/api/citizen/grievance/submit', fd).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Grievance submitted successfully!';
        setTimeout(() => this.router.navigate(['/citizen/my-complaints']), 1500);
      },
      error: () => { this.loading = false; this.error = 'Submission failed. Please try again.'; }
    });
  }
}
