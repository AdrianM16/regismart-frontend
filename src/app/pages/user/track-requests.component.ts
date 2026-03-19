import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="grid grid-2">
      <section class="card" style="padding:1.5rem;">
        <h2>My Document Requests</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Status</th>
                <th>Purpose</th>
                <th>Expected Release</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of requests">
                <td>{{ item.documentType }}</td>
                <td><span class="status-chip" [ngClass]="statusClass(item.status)">{{ item.status }}</span></td>
                <td>{{ item.purpose }}</td>
                <td>{{ item.expectedReleaseDate ? (item.expectedReleaseDate | date:'mediumDate') : 'TBA' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card" style="padding:1.5rem;">
        <h2>My Appointments</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of appointments">
                <td>{{ item.serviceId?.name }}</td>
                <td>{{ item.appointmentDate | date:'mediumDate' }}</td>
                <td>{{ item.timeSlot }}</td>
                <td><span class="status-chip" [ngClass]="statusClass(item.status)">{{ item.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `
})
export class TrackRequestsComponent implements OnInit {
  requests: any[] = [];
  appointments: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getMyRequests().subscribe((data) => (this.requests = data));
    this.api.getMyAppointments().subscribe((data) => (this.appointments = data));
  }

  statusClass(status: string) {
    return {
      'status-pending': status === 'Pending',
      'status-approved': status === 'Approved' || status === 'Serving' || status === 'Processing',
      'status-completed': status === 'Completed',
      'status-rejected': status === 'Rejected',
      'status-ready': status === 'Ready for Release'
    };
  }
}
