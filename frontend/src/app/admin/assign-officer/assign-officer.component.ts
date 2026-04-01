import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-assign-officer',
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
        <div class="nav-item" (click)="router.navigate(['/admin/grievances'])"><span class="nav-icon">☰</span> All Grievances <span class="nav-badge">{{ total }}</span></div>
        <div class="nav-item active"><span class="nav-icon">👤</span> Assign Officers <span class="nav-badge" style="background:#f59e0b">{{ activeCount }}</span></div>
        <div class="nav-item" (click)="router.navigate(['/admin/users'])"><span class="nav-icon">👥</span> Manage Users</div>
        <div class="nav-section-label">ANALYTICS</div>
        <div class="nav-item" (click)="router.navigate(['/admin/analytics'])"><span class="nav-icon">📊</span> Analytics & Reports</div>
        <div class="sidebar-footer">
          <button class="signout-btn" (click)="auth.logout()"><span>↪</span> Sign Out</button>
        </div>
      </aside>

      <main class="main-content">
        <div class="topnav">
          <div>
            <div class="page-title">Assign Officers</div>
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
              <div class="stat-num" style="font-size:28px;">{{ total }}</div>
              <div class="stat-label">Total Grievances</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#f59e0b;">{{ active.length }}</div>
              <div class="stat-label">Active Grievances</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#60a5fa;">{{ assignedCount }}</div>
              <div class="stat-label">Assigned Active</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#22c55e;">{{ unassignedCount }}</div>
              <div class="stat-label">Unassigned Active</div>
            </div>
          </div>

          <div class="card">
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px;">
              <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()" style="min-width:180px; padding:7px 9px; border:1px solid #334155; border-radius:6px; background:#0f172a; color:#e2e8f0;">
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REOPENED">Reopened</option>
              </select>
              <select [(ngModel)]="categoryFilter" (ngModelChange)="applyFilters()" style="min-width:180px; padding:7px 9px; border:1px solid #334155; border-radius:6px; background:#0f172a; color:#e2e8f0;">
                <option value="ALL">All Categories</option>
                <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
              </select>
            </div>

            <div *ngIf="filteredRows.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>No grievances for selected filters</h3>
            </div>

            <table class="data-table" *ngIf="filteredRows.length > 0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Current Officer</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Assign / Change</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let g of filteredRows">
                  <td style="color:#60a5fa; font-weight:700; font-size:12px;">GRV-{{ String(g.id).padStart(3,'0') }}</td>
                  <td>{{ g.title }}</td>
                  <td>{{ g.category || '-' }}</td>
                  <td><span class="badge" [ngClass]="statusClass(g.status)">{{ formatStatus(g.status) }}</span></td>
                  <td>
                    <div>{{ officerName(g.assignedOfficerId) }}</div>
                    <div style="font-size:11px; color:#94a3b8;">{{ officerEmail(g.assignedOfficerId) }}</div>
                  </td>
                  <td>{{ departmentName(g.departmentId) }}</td>
                  <td>{{ priorityLabel(g.priority) }}</td>
                  <td>{{ formatDeadline(g.deadline) }}</td>
                  <td>
                    <div *ngIf="g.assignedOfficerId && !isEditing(g.id)" style="display:flex; gap:8px; align-items:center;">
                      <button
                        (click)="startEdit(g)"
                        [disabled]="assigningId === g.id"
                        style="padding:6px 14px; background:#334155; border:none; border-radius:6px; color:#fff; font-size:12px; font-weight:600; cursor:pointer;">
                        Update
                      </button>
                    </div>
                    <div *ngIf="!g.assignedOfficerId || isEditing(g.id)" style="display:flex; gap:8px; align-items:center;">
                      <select [(ngModel)]="selectedDepartment[g.id]" style="min-width:150px; padding:6px 8px; border:1px solid #334155; border-radius:6px; background:#0f172a; color:#e2e8f0;">
                        <option value="">Select Department</option>
                        <option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</option>
                      </select>
                      <select [(ngModel)]="selectedOfficer[g.id]" style="min-width:160px; padding:6px 8px; border:1px solid #334155; border-radius:6px; background:#0f172a; color:#e2e8f0;">
                        <option value="">Select Officer</option>
                        <option *ngFor="let o of officers" [value]="o.id">{{ o.username }} ({{ o.email }})</option>
                      </select>
                      <select [(ngModel)]="selectedPriority[g.id]" style="min-width:110px; padding:6px 8px; border:1px solid #334155; border-radius:6px; background:#0f172a; color:#e2e8f0;">
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                        <option value="3">High</option>
                      </select>
                      <select [(ngModel)]="selectedDeadlineDays[g.id]" style="min-width:140px; padding:6px 8px; border:1px solid #334155; border-radius:6px; background:#0f172a; color:#e2e8f0;">
                        <option value="1">1 day</option>
                        <option value="3">3 days</option>
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                        <option value="30">30 days</option>
                      </select>
                      <button
                        (click)="assign(g)"
                        [disabled]="!selectedOfficer[g.id] || !selectedDepartment[g.id] || assigningId === g.id"
                        style="padding:6px 14px; background:#0d9488; border:none; border-radius:6px; color:#fff; font-size:12px; font-weight:600; cursor:pointer;">
                        {{ assigningId === g.id ? 'Saving...' : (g.assignedOfficerId ? 'Save' : 'Assign') }}
                      </button>
                      <button
                        *ngIf="g.assignedOfficerId && isEditing(g.id)"
                        (click)="cancelEdit(g.id)"
                        [disabled]="assigningId === g.id"
                        style="padding:6px 14px; background:#1e293b; border:none; border-radius:6px; color:#cbd5e1; font-size:12px; font-weight:600; cursor:pointer;">
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p class="err" *ngIf="error">{{ error }}</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['../../../styles/shared-layout.scss'],
  styles: [`
    :host { display:block; }
    .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
    .err { color:#ef4444; font-size:12px; margin-top:10px; }
  `]
})
export class AssignOfficerComponent implements OnInit {
  all: any[] = [];
  active: any[] = [];
  filteredRows: any[] = [];
  officers: any[] = [];
  departments: any[] = [];
  categories: string[] = [];
  selectedOfficer: Record<number, string> = {};
  selectedDepartment: Record<number, string> = {};
  selectedPriority: Record<number, string> = {};
  selectedDeadlineDays: Record<number, string> = {};
  statusFilter = 'ALL';
  categoryFilter = 'ALL';
  editingAssignments: Record<number, boolean> = {};
  assigningId: number | null = null;
  error = '';
  total = 0;
  activeCount = 0;
  assignedCount = 0;
  unassignedCount = 0;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  String = String;

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
    queueMicrotask(() => {
      this.loadOfficers();
      this.loadDepartments();
      this.loadGrievances();
    });
  }

  loadOfficers() {
    this.adminService.getOfficers().subscribe({
      next: d => {
        this.officers = this.toArray(d);
        this.cdr.detectChanges();
      },
      error: () => {
        this.officers = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadGrievances() {
    this.error = '';
    this.adminService.getAllGrievances().subscribe({
      next: d => {
        const rows = this.toArray(d);
        this.all = rows;
        this.total = rows.length;
        this.active = rows.filter((g: any) => g.status === 'PENDING' || g.status === 'IN_PROGRESS');
        this.activeCount = this.active.length;
        this.categories = Array.from(new Set(rows.map((g: any) => g.category).filter(Boolean))).sort();
        rows.forEach((g: any) => {
          this.selectedOfficer[g.id] = g.assignedOfficerId ? String(g.assignedOfficerId) : '';
          this.selectedDepartment[g.id] = g.departmentId ? String(g.departmentId) : this.defaultDepartmentIdForCategory(g.category);
          this.selectedPriority[g.id] = String(g.priority ?? 2);
          this.selectedDeadlineDays[g.id] = this.deriveDeadlineDays(g.deadline);
        });
        this.assignedCount = this.active.filter((g: any) => !!g.assignedOfficerId).length;
        this.unassignedCount = this.active.filter((g: any) => !g.assignedOfficerId).length;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.all = [];
        this.active = [];
        this.filteredRows = [];
        this.total = 0;
        this.activeCount = 0;
        this.error = 'Unable to load grievances.';
        this.cdr.detectChanges();
      }
    });
  }

  assign(g: any) {
    const officerId = Number(this.selectedOfficer[g.id]);
    const departmentId = Number(this.selectedDepartment[g.id]);
    const priority = Number(this.selectedPriority[g.id] || '2');
    const deadlineDays = Number(this.selectedDeadlineDays[g.id] || '3');
    if (!officerId || !departmentId) {
      return;
    }
    this.assigningId = g.id;
    this.error = '';
    this.adminService.assignOfficer(g.id, officerId, priority, deadlineDays, departmentId).subscribe({
      next: () => {
        this.assigningId = null;
        this.editingAssignments[g.id] = false;
        this.loadGrievances();
      },
      error: () => {
        this.assigningId = null;
        this.error = 'Failed to update officer assignment.';
        this.cdr.detectChanges();
      }
    });
  }

  officerName(id: number | null | undefined): string {
    if (!id) return 'Unassigned';
    const officer = this.officers.find((o: any) => o.id === id);
    return officer ? officer.username : `Officer #${id}`;
  }

  officerEmail(id: number | null | undefined): string {
    if (!id) return '-';
    const officer = this.officers.find((o: any) => o.id === id);
    return officer?.email || '-';
  }

  departmentName(id: number | null | undefined): string {
    if (!id) return 'Unassigned';
    const department = this.departments.find((d: any) => d.id === id);
    return department ? department.name : `Department #${id}`;
  }

  statusClass(s: string): string {
    const m: any = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-progress', RESOLVED: 'badge-resolved' };
    return m[s] || 'badge-pending';
  }

  formatStatus(s: string): string {
    return s?.replace('_', ' ') || '';
  }

  isEditing(id: number): boolean {
    return !!this.editingAssignments[id];
  }

  startEdit(g: any) {
    this.selectedOfficer[g.id] = g.assignedOfficerId ? String(g.assignedOfficerId) : '';
    this.selectedDepartment[g.id] = g.departmentId ? String(g.departmentId) : this.defaultDepartmentIdForCategory(g.category);
    this.selectedPriority[g.id] = String(g.priority ?? 2);
    this.selectedDeadlineDays[g.id] = this.deriveDeadlineDays(g.deadline);
    this.editingAssignments[g.id] = true;
  }

  cancelEdit(id: number) {
    this.editingAssignments[id] = false;
  }

  priorityLabel(priority: number | null | undefined): string {
    const level = Math.max(1, Math.min(3, Number(priority ?? 2)));
    const labels: Record<number, string> = {
      1: 'Low',
      2: 'Medium',
      3: 'High'
    };
    return labels[level] || 'Medium';
  }

  formatDeadline(deadline: string | null | undefined): string {
    if (!deadline) return '-';
    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private deriveDeadlineDays(deadline: string | null | undefined): string {
    if (!deadline) return '3';
    const due = new Date(deadline).getTime();
    if (Number.isNaN(due)) return '3';
    const now = Date.now();
    const days = Math.max(1, Math.round((due - now) / (1000 * 60 * 60 * 24)));
    const allowed = [1, 3, 7, 14, 30];
    const nearest = allowed.reduce((best, curr) => {
      return Math.abs(curr - days) < Math.abs(best - days) ? curr : best;
    }, 3);
    return String(nearest);
  }

  applyFilters() {
    this.filteredRows = this.all.filter((g: any) => {
      const statusOk = this.statusFilter === 'ALL' || g.status === this.statusFilter;
      const categoryOk = this.categoryFilter === 'ALL' || g.category === this.categoryFilter;
      return statusOk && categoryOk;
    });
  }

  private loadDepartments() {
    this.adminService.getDepartments().subscribe({
      next: d => {
        this.departments = this.toArray(d);
        this.cdr.detectChanges();
      },
      error: () => {
        this.departments = [];
        this.cdr.detectChanges();
      }
    });
  }

  private defaultDepartmentIdForCategory(category: string | null | undefined): string {
    if (!category || !this.departments.length) return '';
    const match = this.departments.find((d: any) => String(d.category || '').toUpperCase() === String(category).toUpperCase());
    return match ? String(match.id) : '';
  }

  private toArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }
}