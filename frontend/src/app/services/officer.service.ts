import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OfficerService {
  private API = 'http://localhost:8080/api/officer';

  constructor(private http: HttpClient) {}

  getAssigned() {
    return this.http.get<any[]>(`${this.API}/assigned`);
  }

  getStats() {
    return this.http.get<any>(`${this.API}/stats`);
  }

  resolve(id: number, status: string, note: string) {
    return this.http.put(`${this.API}/grievance/${id}/resolve`,
      { status, note });
  }
}