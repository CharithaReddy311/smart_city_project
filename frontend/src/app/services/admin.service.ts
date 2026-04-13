import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private API = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getAllGrievances() {
    return this.http.get<any[]>(`${this.API}/grievance/all`);
  }

  getOfficers() {
    return this.http.get<any[]>(`${this.API}/officers`);
  }

  getDepartments() {
    return this.http.get<any[]>(`${this.API}/departments`);
  }

  getUsers() {
    return this.http.get<any[]>(`${this.API}/users`);
  }

  deleteUser(id: number) {
    return this.http.delete<{ message: string }>(`${this.API}/users/${id}`);
  }

  assignOfficer(id: number, officerId: number,
                priority: number, deadlineDays: number, departmentId?: number) {
    const payload: any = { officerId, priority, deadlineDays };
    if (departmentId) {
      payload.departmentId = departmentId;
    }
    return this.http.put(
      `${this.API}/grievance/${id}/assign`,
      payload
    );
  }
}