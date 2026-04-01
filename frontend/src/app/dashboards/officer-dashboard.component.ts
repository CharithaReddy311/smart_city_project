import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OfficerService } from '../services/officer.service';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-dot">🏙️</div>
          <div class="brand-text">Civic<span>Pulse</span></div>
        </div>
        <div class="user-pill">
          <div class="user-dot" style="background:#a78bfa"></div>
          <div>
            <div class="user-role" style="color:#a78bfa">OFFICER</div>
            <div class="user-name">&#64;{{ auth.getUsername() }}</div>
          </div>
        </div>

        <div class="nav-section-label">WORK</div>
        <div class="nav-item active">
          <span class="nav-icon">🏠</span> Overview
        </div>
        <div class="nav-item" (click)="router.navigate(['/officer/assigned'])">
          <span class="nav-icon">📋</span> Assigned to Me
          <span class="nav-badge" style="background:#a78bfa">{{ assigned.length }}</span>
        </div>
        <div class="nav-item" (click)="router.navigate(['/officer/assigned'])">
          <span class="nav-icon">🔧</span> In Progress
          <span class="nav-badge">{{ inProgress }}</span>
        </div>
        <div class="nav-item" (click)="router.navigate(['/officer/assigned'])">
          <span class="nav-icon">✅</span> Completed
        </div>

        <div class="nav-section-label">ANALYTICS</div>
        <div class="nav-item">
          <span class="nav-icon">📊</span> Analytics
        </div>

        <div class="nav-section-label">INFO</div>
        <div class="nav-item">
          <span class="nav-icon">👤</span> My Profile
        </div>
        <div class="nav-item">
          <span class="nav-icon">🔔</span> Notifications
          <span class="nav-badge" style="background:#f59e0b">3</span>
        </div>

        <div class="sidebar-footer">
          <button class="signout-btn" (click)="auth.logout()">
            <span>↪</span> Sign Out
          </button>
        </div>
      </aside>

      <main class="main-content">
        <div class="topnav">
          <div>
            <div class="page-title">Officer Dashboard</div>
            <div class="page-date">{{ today }}</div>
          </div>
          <div class="topnav-right">
            <div class="role-badge" style="border-color:#a78bfa; color:#a78bfa">OFFICER</div>
            <div class="avatar" style="background:#7c3aed">O</div>
          </div>
        </div>

        <div class="welcome-banner teal">
          <div class="welcome-text">
            <h2>Ready to serve, <span style="color:#0d9488">{{ auth.getUsername() }}</span> 👷</h2>
            <p>You have {{ assigned.length }} assigned grievances and {{ inProgress }} currently in progress. Keep up the great work!</p>
          </div>
          <div class="welcome-icon">🔧</div>
        </div>

        <div *ngIf="error" class="card" style="margin-bottom:14px;">
          <p style="margin:0; color:#f87171; font-size:13px;">{{ error }}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(245,158,11,0.1)">📋</div>
              <div class="stat-chip chip-amber">{{ pendingCount }} pending</div>
            </div>
            <div class="stat-num">{{ totalAssigned }}</div>
            <div class="stat-label">Assigned Grievances</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(59,130,246,0.1)">⚙️</div>
              <div class="stat-chip chip-blue">Active</div>
            </div>
            <div class="stat-num">{{ inProgress }}</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(34,197,94,0.1)">✅</div>
              <div class="stat-chip chip-green">This month</div>
            </div>
            <div class="stat-num">{{ resolvedCount }}</div>
            <div class="stat-label">Resolved</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(245,158,11,0.1)">🏆</div>
              <div class="stat-chip chip-green">Live</div>
            </div>
            <div class="stat-num" style="color:#22c55e">{{ slaScore }}%</div>
            <div class="stat-label">SLA Score</div>
          </div>
        </div>

        <div class="content-grid">
          <div class="card">
            <div class="card-header">
              <div class="card-title">My Assigned Grievances</div>
              <button class="view-all-btn" (click)="router.navigate(['/officer/assigned'])">View all →</button>
            </div>
            <div *ngIf="assigned.length === 0" class="empty-state">
              <div class="empty-icon">✅</div>
              <h3>No grievances assigned yet</h3>
            </div>
            <div class="grievance-item" *ngFor="let g of assigned.slice(0,4)"
                 (click)="router.navigate(['/officer/resolve', g.id])">
              <div class="g-icon">{{ getCatIcon(g.category) }}</div>
              <div class="g-info">
                <div class="g-title">{{ g.title }}</div>
                <div class="g-meta">📍 {{ g.location }} · 👤 {{ g.deadline ? 'Due: ' + (g.deadline | date:'dd MMM') : 'Today' }}</div>
              </div>
              <div class="g-badges">
                <span class="badge" [ngClass]="g.status === 'PENDING' ? 'badge-new' : 'badge-progress'">
                  {{ g.status === 'PENDING' ? 'NEW' : 'IN PROGRESS' }}
                </span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">Quick Actions</div></div>
            <div class="quick-action-item" (click)="router.navigate(['/officer/assigned'])">
              <div class="qa-icon">📋</div>
              <div>
                <div class="qa-label">View Assigned</div>
                <div class="qa-sub">{{ assigned.length }} grievances awaiting</div>
              </div>
              <span class="qa-arrow">→</span>
            </div>
            <div class="quick-action-item" (click)="router.navigate(['/officer/assigned'])">
              <div class="qa-icon">🔧</div>
              <div>
                <div class="qa-label">Update Progress</div>
                <div class="qa-sub">{{ inProgress }} tasks active</div>
              </div>
              <span class="qa-arrow">→</span>
            </div>
            <div class="quick-action-item">
              <div class="qa-icon">✅</div>
              <div>
                <div class="qa-label">View Completed</div>
                <div class="qa-sub">{{ resolvedCount }} grievances resolved</div>
              </div>
              <span class="qa-arrow">→</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['../../styles/shared-layout.scss'],
  styles: [':host { display: block; }']
})
export class OfficerDashboardComponent implements OnInit {
  assigned: any[] = [];
  totalAssigned = 0;
  inProgress = 0; resolvedCount = 0; pendingCount = 0;
  slaScore = 0;
  error = '';
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  constructor(public auth: AuthService, public router: Router, private os: OfficerService) {}

  ngOnInit() {
    this.error = '';
    this.os.getAssigned().subscribe({
      next: d => {
        this.assigned = this.toArray(d);
        this.applyLocalStatsFromAssigned();
      },
      error: () => {
        this.assigned = [];
        this.applyLocalStatsFromAssigned();
        this.error = 'Unable to load assigned grievances. Please log in again as officer and ensure backend is running.';
      }
    });

    this.os.getStats().subscribe({
      next: (stats) => {
        // Keep count cards aligned to /assigned source of truth.
        this.slaScore = Number(stats?.slaScore ?? 0);
      },
      error: () => {
        this.slaScore = 0;
      }
    });
  }

  private applyLocalStatsFromAssigned() {
    this.totalAssigned = this.assigned.length;
    this.inProgress = this.assigned.filter((g: any) => g.status === 'IN_PROGRESS').length;
    this.resolvedCount = this.assigned.filter((g: any) => g.status === 'RESOLVED').length;
    this.pendingCount = this.assigned.filter((g: any) => g.status === 'PENDING').length;
  }

  private toArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }

  getCatIcon(cat: string): string {
    const m: any = { WATER: '💧', ROAD: '🛣️', SANITATION: '🗑️', ELECTRICITY: '⚡', STREET_LIGHT: '💡', OTHER: '📋' };
    return m[cat] || '📋';
  }
}
