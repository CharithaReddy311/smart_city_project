import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-manage-users',
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
        <div class="nav-item" (click)="router.navigate(['/admin/dashboard'])"><span class="nav-icon">🏠</span> Dashboard</div>
        <div class="nav-item" (click)="router.navigate(['/admin/grievances'])"><span class="nav-icon">☰</span> All Grievances</div>
        <div class="nav-item" (click)="router.navigate(['/admin/assign-officers'])"><span class="nav-icon">👤</span> Assign Officers</div>
        <div class="nav-item active"><span class="nav-icon">👥</span> Manage Users <span class="nav-badge">{{ users.length }}</span></div>

        <div class="nav-section-label">ANALYTICS</div>
        <div class="nav-item" (click)="router.navigate(['/admin/analytics'])"><span class="nav-icon">📊</span> Analytics & Reports</div>

        <div class="sidebar-footer">
          <button class="signout-btn" (click)="auth.logout()"><span>↪</span> Sign Out</button>
        </div>
      </aside>

      <main class="main-content">
        <div class="topnav">
          <div>
            <div class="page-title">Manage Users</div>
            <div class="page-date">{{ today }}</div>
          </div>
          <div class="topnav-right">
            <div class="role-badge" style="border-color:#60a5fa; color:#60a5fa">ADMIN</div>
            <div class="avatar" style="background:#2563eb">A</div>
          </div>
        </div>

        <div class="page-content">
          <div class="stats-grid" style="margin-bottom:20px;">
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px;">{{ users.length }}</div>
              <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#0d9488;">{{ citizenCount }}</div>
              <div class="stat-label">Citizens</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#60a5fa;">{{ officerCount }}</div>
              <div class="stat-label">Officers</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#f59e0b;">{{ adminCount }}</div>
              <div class="stat-label">Admins</div>
            </div>
          </div>

          <div class="card">
            <div *ngIf="loading" class="empty-state"><h3>Loading users...</h3></div>
            <div *ngIf="!loading && users.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>No users found</h3>
            </div>
            <p class="err" *ngIf="error">{{ error }}</p>
            <table class="data-table" *ngIf="!loading && users.length > 0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of users">
                  <td>{{ u.id }}</td>
                  <td>{{ u.username }}</td>
                  <td>{{ u.email }}</td>
                  <td><span class="badge" [ngClass]="roleClass(u.role)">{{ u.role }}</span></td>
                  <td>
                    <button
                      (click)="deleteUser(u.id, u.username, u.role)"
                      [disabled]="u.role === 'ADMIN' || deletingId === u.id"
                      style="padding:6px 14px; background:#dc2626; border:none; border-radius:6px; color:#fff; font-size:12px; font-weight:600; cursor:pointer;">
                      {{ deletingId === u.id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['../../../styles/shared-layout.scss'],
  styles: [`
    :host { display: block; }
    .stats-grid { display:grid; grid-template-columns: repeat(4,1fr); gap:16px; }
    .err { color:#ef4444; margin: 10px 0; font-size: 12px; }
  `]
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  deletingId: number | null = null;
  error = '';
  citizenCount = 0;
  officerCount = 0;
  adminCount = 0;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    queueMicrotask(() => this.loadUsers());
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.adminService.getUsers().subscribe({
      next: (data) => {
        const rows = this.toArray(data);
        this.users = rows;
        this.citizenCount = rows.filter((u: any) => u.role === 'CITIZEN').length;
        this.officerCount = rows.filter((u: any) => u.role === 'OFFICER').length;
        this.adminCount = rows.filter((u: any) => u.role === 'ADMIN').length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load users. If backend was just changed, restart backend server.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(id: number, username: string, role: string) {
    if (role === 'ADMIN') {
      return;
    }
    if (!confirm(`Delete user ${username}? This cannot be undone.`)) {
      return;
    }
    this.deletingId = id;
    this.error = '';
    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: () => {
        this.deletingId = null;
        this.error = 'Failed to delete user.';
        this.cdr.detectChanges();
      }
    });
  }

  roleClass(role: string): string {
    if (role === 'ADMIN') return 'badge-high';
    if (role === 'OFFICER') return 'badge-progress';
    return 'badge-resolved';
  }

  private toArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }
}
