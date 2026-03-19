import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, interval, of, Subscription, switchMap, startWith } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="page-header">
        <h1>Admin Dashboard</h1>
        <p>Real-time overview of registrar operations. Auto-refreshes every 8 seconds.</p>
      </div>

      <div *ngIf="message" class="alert alert-error">{{ message }}</div>

      <!-- Stats -->
      <div class="stats-grid stats-grid-4 mb-6">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <h3>{{ metrics.today }}</h3>
          <p>Today's Appointments</p>
        </div>
        <div class="stat-card blue-accent">
          <div class="stat-icon">🏃</div>
          <h3>{{ metrics.inQueue }}</h3>
          <p>Arrived / Serving</p>
        </div>
        <div class="stat-card gold-accent">
          <div class="stat-icon">⏳</div>
          <h3>{{ metrics.pending }}</h3>
          <p>Need Approval</p>
        </div>
        <div class="stat-card green-accent">
          <div class="stat-icon">✅</div>
          <h3>{{ metrics.completed }}</h3>
          <p>Completed Today</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;" class="dashboard-grid">
        <!-- Pending Approvals -->
        <div class="card">
          <div class="card-body">
            <div class="section-heading">Pending Approvals</div>

            <div class="empty-state" style="padding:24px 0;" *ngIf="approvals.length === 0">
              <div class="icon">🎉</div>
              <h3>All caught up!</h3>
              <p>No pending approvals right now.</p>
            </div>

            <div *ngFor="let row of approvals" style="padding:12px 0; border-bottom:1px solid var(--gray-100);">
              <div class="flex justify-between items-center">
                <div style="flex:1; min-width:0;">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-sm" style="color:var(--gray-900); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      {{ row.student }}
                    </span>
                    <span class="new-badge" *ngIf="row.isNew">NEW</span>
                  </div>
                  <div class="text-xs text-muted">{{ row.service }} · {{ row.requesterType }}</div>
                </div>
                <button class="btn btn-success btn-xs" style="margin-left:12px; flex-shrink:0;" (click)="approve(row)">
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Most Requested Services -->
        <div class="card">
          <div class="card-body">
            <div class="section-heading">Most Requested Services</div>
            <div class="bar-list" *ngIf="mostRequested.length > 0">
              <div class="bar-item" *ngFor="let item of mostRequested">
                <span>{{ item.label }}</span>
                <div class="bar-track"><div class="bar-fill" [style.width.%]="item.value"></div></div>
                <strong>{{ item.count }}</strong>
              </div>
            </div>
            <div class="empty-state" style="padding:24px 0;" *ngIf="mostRequested.length === 0">
              <p>No data yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media (max-width: 768px) {
      .dashboard-grid { grid-template-columns: 1fr !important; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  metrics = { today: 0, inQueue: 0, pending: 0, completed: 0 };
  approvals: any[] = [];
  mostRequested: { label: string; value: number; count: number }[] = [];
  message = '';
  sub?: Subscription;
  firstSeen = new Set<string>();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.sub = interval(8000).pipe(
      startWith(0),
      switchMap(() => this.api.getDashboardSummary().pipe(catchError((err) => {
        this.message = err?.error?.message || 'Could not load dashboard. Is the backend running?';
        return of(null);
      })))
    ).subscribe((summary: any) => {
      if (!summary) return;
      this.metrics = {
        today: summary.cards?.todayAppointments || 0,
        inQueue: summary.cards?.servingAppointments || 0,
        pending: summary.cards?.pendingRequests || 0,
        completed: (summary.cards?.completedAppointments || 0) + (summary.cards?.completedRequests || 0)
      };
      this.approvals = (summary.pendingApprovals || []).slice(0, 8).map((row: any) => {
        const id = row.id;
        const isNew = !this.firstSeen.has(id);
        this.firstSeen.add(id);
        return { ...row, isNew };
      });
      const requested = summary.mostRequested || [];
      const max = Math.max(...requested.map((x: any) => x.count), 1);
      this.mostRequested = requested
        .map((item: any) => ({ label: item.label, count: item.count, value: Math.round((item.count / max) * 100) }))
        .slice(0, 6);
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  approve(row: any) {
    const request$ = row.type === 'appointment'
      ? this.api.updateAppointmentStatus(row.id, 'Approved')
      : this.api.updateRequestStatus(row.id, { status: 'Approved' });
    request$.pipe(catchError((err) => {
      this.message = err?.error?.message || 'Could not approve item.';
      return of(null);
    })).subscribe((result) => {
      if (!result) return;
      this.approvals = this.approvals.filter(a => a.id !== row.id);
    });
  }
}
