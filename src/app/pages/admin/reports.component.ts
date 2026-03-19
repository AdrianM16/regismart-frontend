import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="page-header">
        <h1>Service Reports</h1>
        <p>Transaction summary and service usage analytics.</p>
      </div>

      <!-- Summary Stats -->
      <div class="stats-grid stats-grid-4 mb-6">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <h3>{{ totalTransactions }}</h3>
          <p>Total Transactions</p>
        </div>
        <div class="stat-card green-accent">
          <div class="stat-icon">✅</div>
          <h3>{{ completionRate }}%</h3>
          <p>Completion Rate</p>
        </div>
        <div class="stat-card gold-accent">
          <div class="stat-icon">📋</div>
          <h3>{{ activeServices }}</h3>
          <p>Services Used</p>
        </div>
        <div class="stat-card blue-accent">
          <div class="stat-icon">📅</div>
          <h3>{{ peakDay }}</h3>
          <p>Busiest Day</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;" class="reports-grid">
        <!-- Service Breakdown -->
        <div class="card">
          <div class="card-body">
            <div class="section-heading">Requests by Service</div>
            <div class="bar-list" *ngIf="services.length > 0">
              <div class="bar-item" *ngFor="let item of services">
                <span>{{ item.label }}</span>
                <div class="bar-track"><div class="bar-fill" [style.width.%]="item.value"></div></div>
                <strong>{{ item.count }}</strong>
              </div>
            </div>
            <div class="empty-state" style="padding:24px 0;" *ngIf="services.length === 0">
              <p>No service data yet.</p>
            </div>
          </div>
        </div>

        <!-- Status Breakdown -->
        <div class="card">
          <div class="card-body">
            <div class="section-heading">Status Distribution</div>
            <div style="display:grid; gap:12px;" *ngIf="statusBreakdown.length > 0">
              <div *ngFor="let item of statusBreakdown" class="flex justify-between items-center" style="padding:8px 0; border-bottom:1px solid var(--gray-100);">
                <span class="status-pill" [class]="item.class">{{ item.label }}</span>
                <div class="flex items-center gap-3">
                  <div class="bar-track" style="width:100px;"><div class="bar-fill" [style.width.%]="item.pct" [style.background]="item.color"></div></div>
                  <strong class="text-sm">{{ item.count }}</strong>
                </div>
              </div>
            </div>
            <div class="empty-state" style="padding:24px 0;" *ngIf="statusBreakdown.length === 0">
              <p>No status data yet.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Log -->
      <div class="card">
        <div class="card-body">
          <div class="section-heading">Recent Transaction Log</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Student / Requester</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of logs">
                  <td><code style="font-size:12px; color:var(--maroon);">{{ row.ref }}</code></td>
                  <td class="text-sm">{{ row.student || '—' }}</td>
                  <td><span class="text-xs text-muted" style="text-transform:uppercase; letter-spacing:0.06em;">{{ row.type }}</span></td>
                  <td><span class="status-pill" [class]="row.class">{{ row.status }}</span></td>
                </tr>
                <tr *ngIf="logs.length === 0">
                  <td colspan="4" style="text-align:center; padding:32px; color:var(--gray-400);">No transactions recorded yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media (max-width: 768px) {
      .reports-grid { grid-template-columns: 1fr !important; }
    }
  `]
})
export class ReportsComponent implements OnInit {
  totalTransactions = 0;
  completionRate = 0;
  activeServices = 0;
  peakDay = '—';
  services: { label: string; value: number; count: number }[] = [];
  statusBreakdown: { label: string; count: number; pct: number; class: string; color: string }[] = [];
  logs: { ref: string; student: string; status: string; class: string; type: string }[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getReports({}).pipe(catchError(() => of({ appointments: [], requests: [] }))).subscribe((report: any) => {
      const appointments = report.appointments || [];
      const requests = report.requests || [];
      const all = [
        ...appointments.map((item: any) => ({ ...item, type: 'Appointment', serviceName: item.serviceId?.name || 'Appointment' })),
        ...requests.map((item: any) => ({ ...item, type: 'Request', serviceName: item.documentType || item.serviceId?.name || 'Request' }))
      ];

      this.totalTransactions = all.length;
      const completed = all.filter((item: any) => ['Completed', 'Ready for Release'].includes(item.status)).length;
      this.completionRate = all.length ? Math.round((completed / all.length) * 100) : 0;
      this.activeServices = new Set(all.map((item: any) => item.serviceName)).size;

      const dayMap = new Map<string, number>();
      for (const item of all) {
        const day = new Date(item.createdAt || item.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      }
      this.peakDay = Array.from(dayMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

      const serviceMap = new Map<string, number>();
      for (const item of all) serviceMap.set(item.serviceName, (serviceMap.get(item.serviceName) || 0) + 1);
      const max = Math.max(...Array.from(serviceMap.values()), 1);
      this.services = Array.from(serviceMap.entries())
        .map(([label, count]) => ({ label, count, value: Math.round((count / max) * 100) }))
        .sort((a, b) => b.count - a.count).slice(0, 6);

      const statusMap = new Map<string, number>();
      for (const item of all) statusMap.set(item.status, (statusMap.get(item.status) || 0) + 1);
      const totalItems = all.length || 1;
      const statusColors: Record<string, string> = {
        'Completed': '#10B981', 'Approved': '#10B981', 'Pending': '#F59E0B',
        'Processing': '#3B82F6', 'Serving': '#3B82F6', 'Rejected': '#EF4444'
      };
      this.statusBreakdown = Array.from(statusMap.entries()).map(([label, count]) => ({
        label, count, pct: Math.round((count / totalItems) * 100),
        class: 'status-' + label.toLowerCase().replace(/\s+/g, '-'),
        color: statusColors[label] || '#6B7280'
      })).sort((a, b) => b.count - a.count);

      this.logs = all.slice(0, 15).map((item: any) => ({
        ref: String(item._id).slice(-6).toUpperCase(),
        student: `${item.userId?.firstName || item.fullName || ''} ${item.userId?.lastName || ''}`.trim(),
        status: item.status,
        class: 'status-' + String(item.status).toLowerCase().replace(/\s+/g, '-'),
        type: item.type
      }));
    });
  }
}
