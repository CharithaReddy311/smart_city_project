import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GrievanceService } from '../../services/grievance.service';
import { AuthService } from '../../services/auth.service';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-grievance-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        <div class="nav-item" (click)="router.navigate(['/admin/dashboard'])"><span class="nav-icon">🏠</span> Dashboard</div>
        <div class="nav-item active"><span class="nav-icon">☰</span> All Grievances <span class="nav-badge">{{ all.length }}</span></div>
        <div class="nav-item" (click)="router.navigate(['/admin/assign-officers'])"><span class="nav-icon">👤</span> Assign Officers <span class="nav-badge" style="background:#f59e0b">{{ unassignedCount }}</span></div>
        <div class="nav-item" (click)="router.navigate(['/admin/users'])"><span class="nav-icon">👥</span> Manage Users</div>
        <div class="nav-section-label">ANALYTICS</div>
        <div class="nav-item" (click)="router.navigate(['/admin/analytics'])"><span class="nav-icon">📊</span> Analytics & Reports</div>
        <div class="nav-item"><span class="nav-icon">⚙️</span> System Settings</div>
        <div class="sidebar-footer">
          <button class="signout-btn" (click)="auth.logout()"><span>↪</span> Sign Out</button>
        </div>
      </aside>

      <main class="main-content">
        <div class="topnav">
          <div>
            <div class="page-title">All Grievances</div>
            <div class="page-date">{{ today }}</div>
          </div>
          <div class="topnav-right">
            <div class="role-badge" style="border-color:#60a5fa; color:#60a5fa">ADMIN</div>
            <div class="avatar" style="background:#2563eb">A</div>
          </div>
        </div>

        <div class="page-content">
          <div class="page-header">
            <h1>☰ All Grievances</h1>
            <p>Review, assign and manage all citizen complaints.</p>
          </div>

          <!-- Stats -->
          <div class="stats-grid" style="margin-bottom:20px;">
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px;">{{ all.length }}</div>
              <div class="stat-label">Total</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#f59e0b;">{{ pendingCount }}</div>
              <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#60a5fa;">{{ progressCount }}</div>
              <div class="stat-label">In Progress</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#22c55e;">{{ resolvedCount }}</div>
              <div class="stat-label">Resolved</div>
            </div>
          </div>

          <!-- Search -->
          <div class="search-row" style="margin-bottom:16px;">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input [(ngModel)]="searchTerm" placeholder="Search grievances..." (input)="applyFilter()"/>
            </div>
            <select class="filter-select" [(ngModel)]="statusFilter" (change)="applyFilter()">
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select class="filter-select" [(ngModel)]="categoryFilter" (change)="applyFilter()">
              <option value="">All Categories</option>
              <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
            </select>
          </div>

          <!-- Table -->
          <div class="card">
            <div *ngIf="filtered.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>No grievances found</h3>
            </div>
            <table class="data-table" *ngIf="filtered.length > 0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let g of filtered">
                  <td style="color:#60a5fa; font-weight:700; font-size:12px;">GRV-{{ String(g.id).padStart(3,'0') }}</td>
                  <td>
                    <div style="font-weight:600; color:#e2e8f0;">{{ g.title }}</div>
                  </td>
                  <td>
                    <span style="font-size:14px;">{{ getCatIcon(g.category) }}</span>
                    {{ g.category }}
                  </td>
                  <td>{{ g.location }}</td>
                  <td><span class="badge" [ngClass]="getStatusClass(g.status)">{{ formatStatus(g.status) }}</span></td>
                  <td>
                    <span class="badge" [ngClass]="getPriorityClass(g.priority)">{{ getPriorityLabel(g.priority) }}</span>
                  </td>
                  <td>{{ g.submissionDate | date:'dd MMM' }}</td>
                </tr>
              </tbody>
            </table>
            <p class="error-text" *ngIf="loadError">{{ loadError }}</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['../../../styles/shared-layout.scss'],
  styles: [`
    :host { display: block; }
    .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap:16px; }
    .error-text { color: #fca5a5; font-size: 12px; margin: 10px 0 0; }
  `]
})
export class GrievanceListComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  loadError = '';
  searchTerm = ''; statusFilter = '';
  categoryFilter = '';
  categories: string[] = [];
  pendingCount = 0; progressCount = 0; resolvedCount = 0; unassignedCount = 0;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  String = String;

  constructor(
    private gs: GrievanceService,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    queueMicrotask(() => {
      this.loadGrievances();
    });
  }

  loadGrievances() {
    this.loadError = '';
    this.gs.getAllGrievances().subscribe({
      next: d => {
        const rows = this.toArray(d);
        this.all = rows;
        this.filtered = rows;
        this.categories = Array.from(new Set(rows.map((g: any) => g.category).filter(Boolean))).sort();
        this.pendingCount  = rows.filter((g: any) => g.status === 'PENDING').length;
        this.progressCount = rows.filter((g: any) => g.status === 'IN_PROGRESS').length;
        this.resolvedCount = rows.filter((g: any) => g.status === 'RESOLVED').length;
        this.unassignedCount = rows.filter((g: any) => !g.assignedOfficerId).length;
        this.cdr.detectChanges();
      },
      error: () => {
        this.all = [];
        this.filtered = [];
        this.pendingCount = 0;
        this.progressCount = 0;
        this.resolvedCount = 0;
        this.unassignedCount = 0;
        this.loadError = 'Unable to load grievances from API.';
        this.cdr.detectChanges();
      }
    });
  }

  private toArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }

  applyFilter() {
    this.filtered = this.all.filter(g => {
      const matchSearch = !this.searchTerm || g.title?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.statusFilter || g.status === this.statusFilter;
      const matchCategory = !this.categoryFilter || g.category === this.categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }

  getCatIcon(cat: string): string {
    const m: any = { WATER: '💧', ROAD: '🛣️', SANITATION: '🗑️', ELECTRICITY: '⚡', STREET_LIGHT: '💡', OTHER: '📋' };
    return m[cat] || '📋';
  }
  getStatusClass(s: string): string {
    const m: any = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-progress', RESOLVED: 'badge-resolved' };
    return m[s] || 'badge-pending';
  }
  getPriorityClass(p: number): string {
    if (p >= 3) return 'badge-high';
    if (p === 2) return 'badge-medium';
    return 'badge-low';
  }
  getPriorityLabel(p: number): string {
    if (p >= 3) return 'HIGH';
    if (p === 2) return 'MEDIUM';
    return 'LOW';
  }
  formatStatus(s: string): string { return s?.replace('_', ' ') || ''; }
}
