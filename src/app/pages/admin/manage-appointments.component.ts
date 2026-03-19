import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, interval, of, startWith, Subscription, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Appointment } from '../../core/models';
import { mockAppointments } from '../../core/mock-data';

type MonitorAppointment = Appointment & { isNew?: boolean };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div>
      <div class="page-header">
        <h1>Today's Queue</h1>
        <p>Live appointment monitor. Auto-refreshes every 8 seconds.</p>
      </div>

      <!-- Controls -->
      <div class="card mb-6">
        <div class="card-body" style="padding:16px 20px;">
          <div class="flex gap-3 items-center" style="flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:8px;">
              <label class="field-label" style="margin:0; white-space:nowrap;">Date</label>
              <input class="input" style="width:auto;" type="date" [(ngModel)]="selectedDate" (change)="loadOnce()" />
            </div>
            <input class="search-input" style="flex:1; min-width:220px;" [(ngModel)]="search" placeholder="🔍  Search by name, code, or service…" />
            <a class="btn btn-primary btn-sm" routerLink="/admin/walkins">+ Add Walk-in</a>
          </div>
        </div>
      </div>

      <div *ngIf="message" class="alert alert-info mb-4">{{ message }}</div>

      <!-- Queue Board -->
      <div class="queue-board">

        <!-- TO REVIEW -->
        <div class="queue-col pending">
          <div class="queue-col-header">
            To Review
            <span class="badge" style="background:var(--status-pending-bg); color:var(--status-pending-text);">
              {{ filtered(pending).length }}
            </span>
          </div>
          <div class="queue-item" *ngFor="let item of filtered(pending)">
            <strong>{{ serviceName(item) }}</strong>
            <span>{{ displayName(item) }}</span>
            <span>🕐 {{ item.timeSlot }} · {{ item.appointmentCode || 'N/A' }}</span>
            <span *ngIf="item.isNew" style="color:var(--gold); font-weight:700;">⭐ New</span>
            <div class="queue-item-actions">
              <button class="btn btn-success btn-xs" (click)="update(item._id || '', 'Approved')">Approve</button>
              <button class="btn btn-danger btn-xs" (click)="update(item._id || '', 'Rejected')">Reject</button>
            </div>
          </div>
          <div class="empty-state" style="padding:20px 0; font-size:13px;" *ngIf="filtered(pending).length === 0">
            <div>—</div><div style="margin-top:4px; color:var(--gray-400);">No pending items</div>
          </div>
        </div>

        <!-- EXPECTED -->
        <div class="queue-col approved">
          <div class="queue-col-header">
            Expected
            <span class="badge" style="background:var(--status-approved-bg); color:var(--status-approved-text);">
              {{ filtered(approved).length }}
            </span>
          </div>
          <div class="queue-item" *ngFor="let item of filtered(approved)">
            <strong>{{ serviceName(item) }}</strong>
            <span>{{ displayName(item) }}</span>
            <span>🕐 {{ item.timeSlot }} · {{ item.appointmentCode || 'N/A' }}</span>
            <div class="queue-item-actions">
              <button class="btn btn-primary btn-xs" (click)="update(item._id || '', 'Arrived')">Arrived</button>
              <button class="btn btn-outline btn-xs" (click)="update(item._id || '', 'No Show')">No Show</button>
            </div>
          </div>
          <div class="empty-state" style="padding:20px 0; font-size:13px;" *ngIf="filtered(approved).length === 0">
            <div>—</div><div style="margin-top:4px; color:var(--gray-400);">No expected arrivals</div>
          </div>
        </div>

        <!-- IN OFFICE -->
        <div class="queue-col serving">
          <div class="queue-col-header">
            In Office
            <span class="badge" style="background:var(--status-serving-bg); color:var(--status-serving-text);">
              {{ filtered(serving).length }}
            </span>
          </div>
          <div class="queue-item" *ngFor="let item of filtered(serving)">
            <strong>{{ serviceName(item) }}</strong>
            <span>{{ displayName(item) }}</span>
            <span>🕐 {{ item.timeSlot }} · {{ item.status }}</span>
            <div class="queue-item-actions">
              <button class="btn btn-primary btn-xs" *ngIf="item.status === 'Arrived'" (click)="update(item._id || '', 'Serving')">Start</button>
              <button class="btn btn-success btn-xs" *ngIf="item.status === 'Serving'" (click)="update(item._id || '', 'Completed')">Complete</button>
            </div>
          </div>
          <div class="empty-state" style="padding:20px 0; font-size:13px;" *ngIf="filtered(serving).length === 0">
            <div>—</div><div style="margin-top:4px; color:var(--gray-400);">No one serving now</div>
          </div>
        </div>

        <!-- DONE -->
        <div class="queue-col completed">
          <div class="queue-col-header">
            Done / Missed
            <span class="badge">{{ filtered(completed).length }}</span>
          </div>
          <div class="queue-item" *ngFor="let item of filtered(completed)">
            <strong>{{ serviceName(item) }}</strong>
            <span>{{ displayName(item) }}</span>
            <span class="status-pill" style="margin-top:4px;" [class]="statusClass(item.status)">{{ item.status }}</span>
          </div>
          <div class="empty-state" style="padding:20px 0; font-size:13px;" *ngIf="filtered(completed).length === 0">
            <div>—</div><div style="margin-top:4px; color:var(--gray-400);">Nothing here yet</div>
          </div>
        </div>

      </div>

      <p class="text-xs text-muted text-center mt-6">Auto-refreshing every 8 seconds.</p>
    </div>
  `
})
export class ManageAppointmentsComponent implements OnInit, OnDestroy {
  rows: MonitorAppointment[] = [];
  pending: MonitorAppointment[] = [];
  approved: MonitorAppointment[] = [];
  serving: MonitorAppointment[] = [];
  completed: MonitorAppointment[] = [];

  message = '';
  selectedDate = new Date().toISOString().slice(0, 10);
  search = '';
  sub?: Subscription;
  firstSeen = new Set<string>();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.sub = interval(8000)
      .pipe(startWith(0), switchMap(() => this.fetchRows()))
      .subscribe((rows) => this.assignRows(rows));
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  fetchRows() {
    return this.api.getAppointments({ date: this.selectedDate })
      .pipe(catchError(() => of(mockAppointments as MonitorAppointment[])));
  }

  loadOnce() {
    this.fetchRows().subscribe((rows) => this.assignRows(rows as MonitorAppointment[]));
  }

  assignRows(data: MonitorAppointment[]) {
    this.rows = (data || []).map((item: any) => {
      const id = item?._id || `${item?.appointmentCode}-${item?.timeSlot}`;
      const isNew = !this.firstSeen.has(id);
      this.firstSeen.add(id);
      return { ...item, isNew };
    });
    this.pending   = this.rows.filter(x => x.status === 'Pending');
    this.approved  = this.rows.filter(x => ['Approved', 'Confirmed'].includes(x.status));
    this.serving   = this.rows.filter(x => ['Arrived', 'Serving'].includes(x.status));
    this.completed = this.rows.filter(x => ['Completed', 'Rejected', 'No Show', 'Cancelled'].includes(x.status));
  }

  filtered(items: MonitorAppointment[]) {
    const q = this.search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item =>
      `${this.displayName(item)} ${item.appointmentCode || ''} ${this.serviceName(item)}`.toLowerCase().includes(q)
    );
  }

  serviceName(item: any): string {
    if (!item?.serviceId) return 'Unknown Service';
    return typeof item.serviceId === 'string' ? item.serviceId : (item.serviceId.name || 'Unknown Service');
  }

  displayName(item: any): string {
    if (item?.fullName) return item.fullName;
    const name = `${item?.userId?.firstName || ''} ${item?.userId?.lastName || ''}`.trim();
    return name || 'Unknown Requester';
  }

  update(id: string, status: string) {
    if (!id) { this.message = 'Appointment ID is missing.'; return; }
    this.api.updateAppointmentStatus(id, status)
      .pipe(catchError((err) => {
        this.message = err?.error?.message || 'Could not update appointment.';
        return of(null);
      }))
      .subscribe((result) => {
        if (!result) return;
        this.message = `Appointment moved to ${status}.`;
        this.loadOnce();
        setTimeout(() => this.message = '', 3000);
      });
  }

  statusClass(status: string) {
    return 'status-' + (status || '').toLowerCase().replace(/\s+/g, '-');
  }
}
