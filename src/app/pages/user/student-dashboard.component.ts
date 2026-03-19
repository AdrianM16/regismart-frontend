import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment, DocumentRequest } from '../../core/models';
import { mockAppointments, mockRequests } from '../../core/mock-data';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <!-- Page Header -->
      <div class="page-header">
        <h1>Welcome back, {{ firstName }}! 👋</h1>
        <p>Here's an overview of your registrar transactions.</p>
      </div>

      <!-- Stats Row -->
      <div class="stats-grid stats-grid-3 mb-6">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <h3>{{ activeCount }}</h3>
          <p>Active Appointments</p>
        </div>
        <div class="stat-card gold-accent">
          <div class="stat-icon">📄</div>
          <h3>{{ pendingCount }}</h3>
          <p>Pending Documents</p>
        </div>
        <div class="stat-card green-accent">
          <div class="stat-icon">✅</div>
          <h3>{{ doneCount }}</h3>
          <p>Completed</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card mb-6">
        <div class="card-body">
          <div class="section-heading">Quick Actions</div>
          <div class="flex gap-3" style="flex-wrap:wrap;">
            <a class="btn btn-primary" routerLink="/student/book">
              📅 Book Appointment
            </a>
            <a class="btn btn-outline" routerLink="/student/requests">
              📄 View My Requests
            </a>
            <a class="btn btn-outline" routerLink="/student/profile">
              👤 My Profile
            </a>
          </div>
        </div>
      </div>

      <!-- Recent Requests -->
      <div class="card">
        <div class="card-body">
          <div class="section-heading">Recent Transactions</div>

          <div *ngIf="recentRows.length === 0" class="empty-state">
            <div class="icon">📭</div>
            <h3>No transactions yet</h3>
            <p>Book your first appointment to get started.</p>
          </div>

          <div class="table-wrap" *ngIf="recentRows.length > 0">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of recentRows">
                  <td>
                    <span class="font-medium">{{ item.service }}</span>
                  </td>
                  <td class="text-muted text-sm">{{ item.date }}</td>
                  <td>
                    <span class="status-pill" [class]="statusClass(item.status)">
                      {{ item.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4" *ngIf="recentRows.length > 0">
            <a class="btn btn-outline btn-sm" routerLink="/student/requests">View all requests →</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentDashboardComponent implements OnInit {
  appointments: Appointment[] = [];
  requests: DocumentRequest[] = [];
  activeCount = 0;
  pendingCount = 0;
  doneCount = 0;
  recentRows: { service: string; date: string; status: string }[] = [];

  constructor(public auth: AuthService, private api: ApiService) {}

  get firstName(): string {
    return this.auth.fullName.split(' ')[0] || 'Student';
  }

  ngOnInit() {
    forkJoin({
      appointments: this.api.getMyAppointments().pipe(catchError(() => of(mockAppointments))),
      requests: this.api.getMyRequests().pipe(catchError(() => of(mockRequests)))
    }).subscribe(({ appointments, requests }) => {
      this.appointments = appointments as Appointment[];
      this.requests = requests as DocumentRequest[];
      this.recompute();
    });
  }

  recompute() {
    const activeStatuses = ['Pending', 'Approved', 'Confirmed', 'Arrived', 'Serving'];
    this.activeCount = this.appointments.filter(x => activeStatuses.includes(x.status)).length;
    this.pendingCount = this.requests.filter(x => ['Pending', 'Processing', 'Serving', 'Approved'].includes(x.status)).length;
    this.doneCount = [
      ...this.requests.filter(x => ['Completed', 'Ready for Release'].includes(x.status)),
      ...this.appointments.filter(x => x.status === 'Completed')
    ].length;

    const apptRows = this.appointments.map(x => ({
      service: x.serviceId?.name || 'Appointment',
      date: this.formatDate(x.appointmentDate),
      status: x.status,
      sortDate: x.appointmentDate
    }));
    const reqRows = this.requests.map(x => ({
      service: x.documentType || x.serviceId?.name,
      date: this.formatDate(x.createdAt || x.expectedReleaseDate || ''),
      status: x.status,
      sortDate: x.createdAt || x.expectedReleaseDate || ''
    }));

    this.recentRows = [...apptRows, ...reqRows]
      .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
      .slice(0, 6)
      .map(({ service, date, status }) => ({ service, date, status }));
  }

  formatDate(value: string) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  statusClass(status: string) {
    return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
  }
}
