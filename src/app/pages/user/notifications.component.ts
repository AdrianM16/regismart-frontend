import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div>
      <div class="page-header">
        <h1>Notifications</h1>
        <p>Updates on your appointments and document requests.</p>
      </div>

      <div class="empty-state card" *ngIf="notifications.length === 0 && !loading">
        <div class="card-body">
          <div class="icon">🔔</div>
          <h3>No notifications yet</h3>
          <p>You'll be notified when your appointment status changes.</p>
        </div>
      </div>

      <div *ngFor="let note of notifications" class="card mb-3">
        <div class="card-body" style="padding:16px 20px;">
          <div class="flex justify-between items-center">
            <div style="flex:1;">
              <div class="font-semibold" style="margin-bottom:4px; color:var(--gray-900);">{{ note.title }}</div>
              <div class="text-sm text-muted">{{ note.message }}</div>
            </div>
            <div class="text-xs text-muted" style="white-space:nowrap; margin-left:16px;">
              {{ note.createdAt | date:'MMM d, h:mm a' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getNotifications().subscribe({
      next: (data) => { this.notifications = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
