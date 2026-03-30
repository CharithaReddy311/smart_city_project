import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GrievanceService } from '../services/grievance.service';
import { AdminService } from '../services/admin.service';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
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
          <div class="user-dot" style="background:#60a5fa"></div>
          <div>
            <div class="user-role" style="color:#60a5fa">ADMIN</div>
            <div class="user-name">&#64;{{ auth.getUsername() }}</div>
          </div>
        </div>

        <div class="nav-section-label">MANAGEMENT</div>
        <div class="nav-item active">
          <span class="nav-icon">🏠</span> Dashboard
        </div>
        <div class="nav-item" (click)="router.navigate(['/admin/grievances'])">
          <span class="nav-icon">☰</span> All Grievances
          <span class="nav-badge">{{ total }}</span>
        </div>
        <div class="nav-item" (click)="router.navigate(['/admin/assign-officers'])">
          <span class="nav-icon">👤</span> Assign Officers
          <span class="nav-badge" style="background:#f59e0b">{{ unassigned }}</span>
        </div>
        <div class="nav-item" (click)="router.navigate(['/admin/users'])">
          <span class="nav-icon">👥</span> Manage Users
          <span class="nav-badge">{{ totalUsers }}</span>
        </div>

        <div class="nav-section-label">ANALYTICS</div>
        <div class="nav-item" (click)="router.navigate(['/admin/analytics'])">
          <span class="nav-icon">📊</span> Analytics & Reports
        </div>
        <div class="nav-item" (click)="router.navigate(['/admin/analytics'])">
          <span class="nav-icon">📈</span> SLA Reports
        </div>
        <div class="nav-item">
          <span class="nav-icon">⚙️</span> System Settings
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
            <div class="page-title">Dashboard</div>
            <div class="page-date">{{ today }}</div>
          </div>
          <div class="topnav-right">
            <div class="role-badge" style="border-color:#60a5fa; color:#60a5fa">ADMIN</div>
            <div class="avatar" style="background:#2563eb">A</div>
          </div>
        </div>

        <div class="welcome-banner" style="background: linear-gradient(135deg, #0d1b3e 0%, #0a1628 100%); border-color:#1e3a5f">
          <div class="welcome-text">
            <h2>Hello, <span style="color:#60a5fa">{{ auth.getUsername() }} admin</span> 🛡️</h2>
            <p>You have {{ pending }} pending grievances and {{ urgent }} urgent issues requiring immediate attention.</p>
          </div>
          <div class="welcome-icon">🛡️</div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(99,102,241,0.1)">📊</div>
              <div class="stat-chip chip-blue">+{{ recent }} this week</div>
            </div>
            <div class="stat-num">{{ total }}</div>
            <div class="stat-label">Total Grievances</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(245,158,11,0.1)">⏳</div>
              <div class="stat-chip chip-red">{{ urgent }} urgent</div>
            </div>
            <div class="stat-num">{{ pending }}</div>
            <div class="stat-label">Pending Review</div>
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
              <div class="stat-icon-box" style="background:rgba(245,158,11,0.1)">👤</div>
              <div class="stat-chip chip-green">On duty</div>
            </div>
            <div class="stat-num">{{ officerCount }}</div>
            <div class="stat-label">Active Officers</div>
          </div>
        </div>

        <div class="content-grid">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Recent Grievances</div>
              <button class="view-all-btn" (click)="router.navigate(['/admin/grievances'])">View all →</button>
            </div>
            <div *ngIf="grievances.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>No grievances yet</h3>
            </div>
            <div class="grievance-item" *ngFor="let g of grievances.slice(0,5)"
                 (click)="router.navigate(['/admin/grievances'])">
              <div class="g-icon">{{ getCatIcon(g.category) }}</div>
              <div class="g-info">
                <div class="g-title">{{ g.title }}</div>
                <div class="g-meta">Citizen #{{ g.citizenId || 'N/A' }} · {{ g.submissionDate | date:'dd MMM yyyy' }}</div>
              </div>
              <div class="g-badges">
                <span class="badge badge-high" *ngIf="g.priority >= 3">HIGH</span>
                <span class="badge badge-medium" *ngIf="g.priority == 2">MEDIUM</span>
                <span class="badge badge-low" *ngIf="g.priority <= 1">LOW</span>
                <span class="badge" [ngClass]="getStatusClass(g.status)">{{ formatStatus(g.status) }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">Quick Actions</div></div>
            <div class="quick-action-item" (click)="router.navigate(['/admin/grievances'])">
              <div class="qa-icon">📋</div>
              <div>
                <div class="qa-label">Review All Grievances</div>
                <div class="qa-sub">{{ pending }} pending review</div>
              </div>
              <span class="qa-arrow">→</span>
            </div>
            <div class="quick-action-item" (click)="router.navigate(['/admin/assign-officers'])">
              <div class="qa-icon">👤</div>
              <div>
                <div class="qa-label">Assign Officers</div>
                <div class="qa-sub">{{ unassigned }} unassigned</div>
              </div>
              <span class="qa-arrow">→</span>
            </div>
            <div class="quick-action-item" (click)="router.navigate(['/admin/analytics'])">
              <div class="qa-icon">📊</div>
              <div>
                <div class="qa-label">Analytics & Reports</div>
                <div class="qa-sub">View trends & SLA metrics</div>
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
export class AdminDashboardComponent implements OnInit {
  grievances: any[] = [];
  total = 0; pending = 0; inProgress = 0; resolved = 0; recent = 0; urgent = 0;
  unassigned = 0;
  totalUsers = 0;
  officerCount = 0;
  loadError = '';
  private grievanceRetryDone = false;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  constructor(
    public auth: AuthService,
    public router: Router,
    private gs: GrievanceService,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    queueMicrotask(() => this.loadDashboardData());
  }

  private loadDashboardData() {

    this.gs.getAllGrievances().subscribe({
      next: d => {
        const rows = this.toArray(d);
        if (rows.length === 0 && !this.grievanceRetryDone) {
          this.grievanceRetryDone = true;
          setTimeout(() => this.loadDashboardData(), 250);
          return;
        }
        this.grievances = rows;
        this.total = rows.length;
        this.pending    = rows.filter((g: any) => g.status === 'PENDING').length;
        this.inProgress = rows.filter((g: any) => g.status === 'IN_PROGRESS').length;
        this.resolved   = rows.filter((g: any) => g.status === 'RESOLVED').length;
        this.urgent = rows.filter((g: any) => g.priority >= 3).length;
        this.unassigned = rows.filter((g: any) => !g.assignedOfficerId).length;

        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        this.recent = rows.filter((g: any) => {
          if (!g.submissionDate) return false;
          return new Date(g.submissionDate).getTime() >= oneWeekAgo;
        }).length;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadError = 'Unable to load grievance stats from API.';
        this.cdr.detectChanges();
      }
    });

    this.adminService.getUsers().subscribe({
      next: users => {
        const rows = this.toArray(users);
        this.totalUsers = rows.length;
        this.officerCount = rows.filter((u: any) => u.role === 'OFFICER').length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
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

  getStatusClass(s: string): string {
    const m: any = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-progress', RESOLVED: 'badge-resolved' };
    return m[s] || 'badge-pending';
  }

  formatStatus(s: string): string {
    return s?.replace('_', ' ') || '';
  }
}
