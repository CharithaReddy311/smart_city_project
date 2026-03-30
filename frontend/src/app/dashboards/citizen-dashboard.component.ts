import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GrievanceService } from '../services/grievance.service';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="app-layout">
      <!-- SIDEBAR -->
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
        <div class="nav-item active" (click)="router.navigate(['/citizen/dashboard'])">
          <span class="nav-icon">🏠</span> Overview
        </div>
        <div class="nav-item" (click)="router.navigate(['/citizen/submit'])">
          <span class="nav-icon">➕</span> Submit Grievance
        </div>
        <div class="nav-item" (click)="router.navigate(['/citizen/my-complaints'])">
          <span class="nav-icon">☰</span> My Grievances
          <span class="nav-badge" *ngIf="grievances.length > 0">{{ grievances.length }}</span>
        </div>
        <div class="nav-item" (click)="router.navigate(['/admin/analytics'])">
          <span class="nav-icon">📊</span> Analytics
        </div>

        <div class="nav-section-label">ACCOUNT</div>
        <div class="nav-item" (click)="router.navigate(['/citizen/feedback/1'])">
          <span class="nav-icon">⭐</span> Feedback & Ratings
        </div>
        <div class="nav-item">
          <span class="nav-icon">👤</span> My Profile
        </div>
        <div class="nav-item">
          <span class="nav-icon">🔔</span> Notifications
          <span class="nav-badge" style="background:#f59e0b">2</span>
        </div>

        <div class="sidebar-footer">
          <button class="signout-btn" (click)="auth.logout()">
            <span>↪</span> Sign Out
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="main-content">
        <div class="topnav">
          <div>
            <div class="page-title">Dashboard</div>
            <div class="page-date">{{ today }}</div>
          </div>
          <div class="topnav-right">
            <div class="role-badge">CITIZEN</div>
            <div class="avatar">{{ auth.getUsername()?.[0]?.toUpperCase() }}</div>
          </div>
        </div>

        <!-- WELCOME BANNER -->
        <div class="welcome-banner">
          <div class="welcome-text">
            <h2>Welcome back, <span>{{ auth.getUsername() }}</span> 👋</h2>
            <p>Track your grievances and report new civic issues from here.</p>
          </div>
          <div class="welcome-icon">🏘️</div>
        </div>

        <!-- STATS -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(59,130,246,0.1)">📋</div>
              <div class="stat-chip chip-blue">+1 today</div>
            </div>
            <div class="stat-num">{{ pending }}</div>
            <div class="stat-label">Open Issues</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(245,158,11,0.1)">⚙️</div>
              <div class="stat-chip chip-amber">Active</div>
            </div>
            <div class="stat-num">{{ inProgress }}</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(34,197,94,0.1)">✅</div>
              <div class="stat-chip chip-green">All time</div>
            </div>
            <div class="stat-num">{{ resolved }}</div>
            <div class="stat-label">Resolved</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(245,158,11,0.1)">🔔</div>
              <div class="stat-chip chip-amber">Unread</div>
            </div>
            <div class="stat-num">2</div>
            <div class="stat-label">Notifications</div>
          </div>
        </div>

        <!-- CONTENT GRID -->
        <div class="content-grid">
          <!-- Recent Grievances -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">My Grievances</div>
              <button class="view-all-btn" (click)="router.navigate(['/citizen/my-complaints'])">
                View all →
              </button>
            </div>
            <div *ngIf="grievances.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>No complaints yet</h3>
              <p>Submit your first grievance to get started</p>
            </div>
            <div class="grievance-item" *ngFor="let g of grievances.slice(0,4)"
                 (click)="router.navigate(['/citizen/my-complaints'])">
              <div class="g-icon">{{ getCategoryIcon(g.category) }}</div>
              <div class="g-info">
                <div class="g-title">{{ g.title }}</div>
                <div class="g-meta">{{ g.location }} · {{ g.submissionDate | date:'dd MMM yyyy' }}</div>
              </div>
              <div class="g-badges">
                <span class="badge" [ngClass]="getStatusClass(g.status)">{{ g.status }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Quick Actions</div>
            </div>
            <div class="quick-action-item" (click)="router.navigate(['/citizen/submit'])">
              <div class="qa-icon">📝</div>
              <div>
                <div class="qa-label">File New Grievance</div>
                <div class="qa-sub">Report a civic issue in your area</div>
              </div>
              <span class="qa-arrow">→</span>
            </div>
            <div class="quick-action-item" (click)="router.navigate(['/citizen/my-complaints'])">
              <div class="qa-icon">📍</div>
              <div>
                <div class="qa-label">Track My Issues</div>
                <div class="qa-sub">View status of your submissions</div>
              </div>
              <span class="qa-arrow">→</span>
            </div>
            <div class="quick-action-item">
              <div class="qa-icon">👤</div>
              <div>
                <div class="qa-label">Edit Profile</div>
                <div class="qa-sub">Update your account details</div>
              </div>
              <span class="qa-arrow">→</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['../../styles/shared-layout.scss'],
  styles: [`
    :host { display: block; }
    .stats-grid { grid-template-columns: repeat(4, 1fr); }
  `]
})
export class CitizenDashboardComponent implements OnInit {
  grievances: any[] = [];
  pending = 0; inProgress = 0; resolved = 0;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  constructor(public auth: AuthService, public router: Router, private gs: GrievanceService) {}

  ngOnInit() {
    this.gs.getMyGrievances().subscribe({
      next: data => {
        this.grievances = data;
        this.pending    = data.filter(g => g.status === 'PENDING').length;
        this.inProgress = data.filter(g => g.status === 'IN_PROGRESS').length;
        this.resolved   = data.filter(g => g.status === 'RESOLVED').length;
      },
      error: () => {}
    });
  }

  getCategoryIcon(cat: string): string {
    const m: any = { WATER: '💧', ROAD: '🛣️', SANITATION: '🗑️', ELECTRICITY: '⚡', STREET_LIGHT: '💡', OTHER: '📋' };
    return m[cat] || '📋';
  }

  getStatusClass(s: string): string {
    const m: any = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-progress', RESOLVED: 'badge-resolved', REOPENED: 'badge-reopened' };
    return m[s] || 'badge-pending';
  }
}
