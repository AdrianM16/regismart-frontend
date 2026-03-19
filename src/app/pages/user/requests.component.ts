import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, interval, of, startWith, Subscription, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Appointment, DocumentRequest } from '../../core/models';
import { mockAppointments, mockRequests } from '../../core/mock-data';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="page-header">
        <h1>My Requests</h1>
        <p>All your appointment bookings and document requests in one place.</p>
      </div>

      <div *ngIf="createdMessage" class="alert alert-success">
        ✅ {{ createdMessage }}
      </div>

      <!-- Search -->
      <div class="search-bar">
        <input
          class="search-input"
          placeholder="🔍  Search by service, reference code, or date…"
          [(ngModel)]="query"
        />
      </div>

      <!-- Empty State -->
      <div class="empty-state card" *ngIf="filtered().length === 0">
        <div class="card-body">
          <div class="icon">📭</div>
          <h3>No requests found</h3>
          <p>{{ query ? 'Try a different search term.' : 'You haven\'t made any requests yet.' }}</p>
        </div>
      </div>

      <!-- Request Cards -->
      <div *ngFor="let item of filtered()">
        <div class="card mb-4">
          <div class="card-body">
            <div class="request-card-head">
              <div style="flex:1;">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-semibold" style="font-size:16px;">{{ item.title }}</span>
                  <span class="status-pill" [class]="statusClass(item.status)">{{ item.status }}</span>
                </div>
                <div class="flex gap-4">
                  <span class="text-sm text-muted">📅 {{ item.dateLabel }}</span>
                  <span class="text-sm text-muted">🔖 Ref: {{ item.reference }}</span>
                  <span class="text-sm text-muted" *ngIf="item.timeSlot">🕐 {{ item.timeSlot }}</span>
                </div>
              </div>
            </div>

            <!-- Progress Track -->
            <div class="step-indicator mt-4" *ngIf="item.kind === 'appointment'">
              <div class="step-indicator-item" [class.active]="item.status === 'Pending'">Pending</div>
              <div class="step-indicator-item" [class.active]="item.status === 'Approved' || item.status === 'Confirmed'">Approved</div>
              <div class="step-indicator-item" [class.active]="item.status === 'Serving' || item.status === 'Arrived'">Serving</div>
              <div class="step-indicator-item" [class.active]="item.status === 'Completed'" [class.done]="item.status === 'Completed'">Done</div>
            </div>
            <div class="step-indicator mt-4" *ngIf="item.kind === 'request'">
              <div class="step-indicator-item" [class.active]="item.status === 'Pending'">Pending</div>
              <div class="step-indicator-item" [class.active]="item.status === 'Processing'">Processing</div>
              <div class="step-indicator-item" [class.active]="item.status === 'Ready for Release'">Ready</div>
              <div class="step-indicator-item" [class.active]="item.status === 'Completed'" [class.done]="item.status === 'Completed'">Done</div>
            </div>

            <div class="flex gap-2 mt-4" *ngIf="item.purpose">
              <span class="text-sm text-muted">Purpose:</span>
              <span class="text-sm">{{ item.purpose }}</span>
            </div>

            <!-- Action: Confirm Attendance -->
            <div class="flex mt-4" *ngIf="item.kind === 'appointment' && item.status === 'Approved'">
              <button class="btn btn-success btn-sm" (click)="confirm(item.id)">
                ✓ Confirm Attendance
              </button>
            </div>
          </div>
        </div>
      </div>

      <p class="text-xs text-muted text-center mt-4">Auto-refreshes every 8 seconds.</p>
    </div>
  `
})
export class RequestsComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  requests: DocumentRequest[] = [];
  query = '';
  createdMessage = '';
  sub?: Subscription;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('created')) this.createdMessage = 'Your request was submitted successfully and is now pending review.';
    });
    this.sub = interval(8000).pipe(startWith(0), switchMap(() => this.fetchRows())).subscribe(({ appointments, requests }) => {
      this.appointments = appointments as Appointment[];
      this.requests = requests as DocumentRequest[];
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  fetchRows() {
    return forkJoin({
      appointments: this.api.getMyAppointments().pipe(catchError(() => of(mockAppointments))),
      requests: this.api.getMyRequests().pipe(catchError(() => of(mockRequests)))
    });
  }

  filtered() {
    const rows = [
      ...this.requests.map(item => ({
        id: item._id, kind: 'request',
        title: item.documentType,
        reference: item.referenceNumber || item._id,
        dateLabel: this.formatDate(item.expectedReleaseDate || item.createdAt || ''),
        status: item.status,
        purpose: item.purpose,
        timeSlot: item.appointmentId?.timeSlot || ''
      })),
      ...this.appointments.map(item => ({
        id: item._id, kind: 'appointment',
        title: item.serviceId?.name || 'Appointment',
        reference: item.appointmentCode || item._id,
        dateLabel: this.formatDate(item.appointmentDate),
        status: item.status,
        purpose: item.purpose || '',
        timeSlot: item.timeSlot
      }))
    ];
    const q = this.query.toLowerCase();
    return rows.filter(item =>
      `${item.title} ${item.reference} ${item.dateLabel}`.toLowerCase().includes(q)
    );
  }

  confirm(id: string) {
    this.api.confirmMyAppointment(id).pipe(catchError(() => of(null))).subscribe((result) => {
      if (!result) return;
      this.appointments = this.appointments.map(item =>
        item._id === id ? { ...item, status: 'Confirmed' } : item
      );
    });
  }

  formatDate(value: string) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  statusClass(status: string) {
    return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
  }
}
