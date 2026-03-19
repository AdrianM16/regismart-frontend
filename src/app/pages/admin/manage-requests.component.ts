import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, interval, of, startWith, Subscription, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="page-header">
        <h1>Document Requests</h1>
        <p>Manage all submitted document requests. Auto-refreshes every 8 seconds.</p>
      </div>

      <div *ngIf="message" class="alert alert-info mb-4">{{ message }}</div>

      <!-- Search -->
      <div class="search-bar">
        <input class="search-input" [(ngModel)]="query" placeholder="🔍  Search by name, reference code, or document type…" />
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Requester</th>
                <th>Document</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filtered()">
                <td>
                  <div class="font-semibold" style="margin-bottom:2px;">
                    {{ item.fullName || ((item.userId?.firstName || '') + ' ' + (item.userId?.lastName || '')) }}
                    <span class="new-badge" *ngIf="item.isNew" style="margin-left:6px;">NEW</span>
                  </div>
                  <div class="text-xs text-muted">{{ item.requesterType || 'Student' }} · Ref: {{ item.referenceNumber }}</div>
                </td>
                <td>
                  <div class="font-medium text-sm">{{ item.documentType }}</div>
                  <div class="text-xs text-muted" *ngIf="item.purpose">{{ item.purpose }}</div>
                </td>
                <td>
                  <span class="status-pill" [class]="statusClass(item.status)">{{ item.status }}</span>
                </td>
                <td>
                  <div class="flex gap-2" style="flex-wrap:wrap;">
                    <button class="btn btn-success btn-xs" *ngIf="item.status === 'Pending'" (click)="update(item._id, 'Approved')">Approve</button>
                    <button class="btn btn-primary btn-xs" *ngIf="item.status === 'Approved'" (click)="update(item._id, 'Processing')">Process</button>
                    <button class="btn btn-primary btn-xs" *ngIf="item.status === 'Approved' || item.status === 'Processing'" (click)="update(item._id, 'Serving')">Serve</button>
                    <button class="btn btn-outline btn-xs" *ngIf="item.status === 'Processing' || item.status === 'Serving'" (click)="update(item._id, 'Completed')">Complete</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filtered().length === 0">
                <td colspan="4" style="text-align:center; padding:40px; color:var(--gray-400);">
                  {{ query ? 'No results matching your search.' : 'No document requests found.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p class="text-xs text-muted text-center mt-4">Auto-refreshing every 8 seconds.</p>
    </div>
  `
})
export class ManageRequestsComponent implements OnInit, OnDestroy {
  requests: any[] = [];
  message = '';
  query = '';
  sub?: Subscription;
  firstSeen = new Set<string>();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.sub = interval(8000).pipe(
      startWith(0),
      switchMap(() => this.api.getRequests().pipe(catchError(() => of([]))))
    ).subscribe((data: any) => {
      this.requests = (data || []).map((item: any) => {
        const isNew = !this.firstSeen.has(item._id);
        this.firstSeen.add(item._id);
        return { ...item, isNew };
      });
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  filtered() {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.requests;
    return this.requests.filter((item: any) =>
      `${item.fullName} ${item.referenceNumber} ${item.documentType}`.toLowerCase().includes(q)
    );
  }

  update(id: string, status: string) {
    const payload: any = { status };
    if (status === 'Completed') payload.expectedReleaseDate = new Date().toISOString();
    this.api.updateRequestStatus(id, payload).pipe(catchError((err) => {
      this.message = err?.error?.message || 'Could not update request.';
      return of(null);
    })).subscribe((result) => {
      if (!result) return;
      this.message = `Request moved to ${status}.`;
      setTimeout(() => this.message = '', 3000);
    });
  }

  statusClass(status: string) {
    return 'status-' + (status || '').toLowerCase().replace(/\s+/g, '-');
  }
}
