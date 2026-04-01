import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private API = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getAllGrievances() {
    return this.http.get<any[]>(
      'http://localhost:8080/api/admin/grievance/all').pipe(
      catchError(err => {
        if (err?.status === 404) {
          return this.http.get<any[]>(
            'http://localhost:8080/api/admin/grievances/all');
        }
        return throwError(() => err);
      })
    );
  }

  getOfficers() {
    return this.http.get<any[]>(`${this.API}/officers`);
  }

  getDepartments() {
    return this.http.get<any[]>(`${this.API}/departments`);
  }

  getUsers() {
    return this.http.get<any[]>(`${this.API}/users`).pipe(
      catchError(err => {
        if (err?.status === 404) {
          return this.http.get<any[]>(`${this.API}/user/all`);
        }
        return throwError(() => err);
      })
    );
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.API}/users/${id}`).pipe(
      catchError(err => {
        if (err?.status === 404) {
          return this.http.delete(`${this.API}/user/${id}`);
        }
        return throwError(() => err);
      })
    );
  }

  assignOfficer(id: number, officerId: number,
                priority: number, deadlineDays: number,
                departmentId?: number) {
    return this.http.put(
      `${this.API}/grievance/${id}/assign`,
      { officerId, priority, deadlineDays, departmentId }
    );
  }
}