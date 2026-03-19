import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getServices() { return this.http.get<any[]>(`${this.api}/services`); }
  getAvailability(serviceId: string, date: string) { return this.http.get<any>(`${this.api}/appointments/availability`, { params: { serviceId, date } }); }
  createAppointment(payload: any) { return this.http.post(`${this.api}/appointments`, payload); }
  createGuestAppointment(payload: any) { return this.http.post(`${this.api}/appointments/guest`, payload); }
  createManualAppointment(payload: any) { return this.http.post(`${this.api}/appointments/manual`, payload); }
  getMyAppointments() { return this.http.get<any[]>(`${this.api}/appointments/my`); }
  confirmMyAppointment(id: string) { return this.http.patch(`${this.api}/appointments/my/${id}/confirm`, {}); }
  getAppointments(params: any = {}) { return this.http.get<any[]>(`${this.api}/appointments`, { params }); }
  updateAppointmentStatus(id: string, status: string) { return this.http.patch(`${this.api}/appointments/${id}/status`, { status }); }

  createRequest(payload: any) { return this.http.post(`${this.api}/requests`, payload); }
  getMyRequests() { return this.http.get<any[]>(`${this.api}/requests/my`); }
  getRequests() { return this.http.get<any[]>(`${this.api}/requests`); }
  trackRequest(code: string) { return this.http.get<any>(`${this.api}/requests/track/${code}`); }
  updateRequestStatus(id: string, payload: any) { return this.http.patch(`${this.api}/requests/${id}/status`, payload); }

  getNotifications() { return this.http.get<any[]>(`${this.api}/notifications/my`); }
  getDashboardSummary() { return this.http.get<any>(`${this.api}/dashboard/summary`); }
  getReports(params: { from?: string; to?: string }) { return this.http.get<any>(`${this.api}/reports/transactions`, { params: params as any }); }

  getMyProfile() { return this.http.get<any>(`${this.api}/users/me`); }
  updateMyProfile(payload: any) { return this.http.put<any>(`${this.api}/users/me`, payload); }
  getUsers() { return this.http.get<any[]>(`${this.api}/users`); }
  updateUserStatus(id: string, status: string) { return this.http.patch<any>(`${this.api}/users/${id}/status`, { status }); }
}
