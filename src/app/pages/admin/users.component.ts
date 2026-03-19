import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models';
import { mockUsers } from '../../core/mock-data';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="page-header">
        <h1>Student Accounts</h1>
        <p>Manage registered student and admin accounts.</p>
      </div>

      <div *ngIf="message" class="alert alert-info mb-4">{{ message }}</div>

      <!-- Stats -->
      <div class="stats-grid stats-grid-3 mb-6">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <h3>{{ users.length }}</h3>
          <p>Total Accounts</p>
        </div>
        <div class="stat-card gold-accent">
          <div class="stat-icon">🎓</div>
          <h3>{{ studentCount }}</h3>
          <p>Students</p>
        </div>
        <div class="stat-card blue-accent">
          <div class="stat-icon">🛡️</div>
          <h3>{{ adminCount }}</h3>
          <p>Admins</p>
        </div>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <input class="search-input" placeholder="🔍  Search by name, student ID, or email…" [(ngModel)]="query" />
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Student ID</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filtered()">
                <td>
                  <div class="flex items-center gap-3">
                    <div style="width:32px; height:32px; border-radius:50%; background:var(--maroon); color:white; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0;">
                      {{ (user.firstName || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-medium">{{ user.firstName }} {{ user.lastName }}</span>
                  </div>
                </td>
                <td>
                  <span class="text-xs font-semibold" style="text-transform:uppercase; letter-spacing:0.08em;"
                    [style.color]="user.role === 'admin' ? 'var(--maroon)' : 'var(--gray-600)'">
                    {{ user.role }}
                  </span>
                </td>
                <td class="text-sm text-muted">{{ user.studentNumber || '—' }}</td>
                <td class="text-sm text-muted">{{ user.email }}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <div style="width:7px; height:7px; border-radius:50%;"
                      [style.background]="user.status === 'inactive' ? '#EF4444' : '#10B981'">
                    </div>
                    <span class="text-sm">{{ user.status === 'inactive' ? 'Inactive' : 'Active' }}</span>
                  </div>
                </td>
                <td>
                  <button
                    class="btn btn-xs"
                    [class]="user.status === 'inactive' ? 'btn-success' : 'btn-outline'"
                    (click)="toggleStatus(user)"
                  >
                    {{ user.status === 'inactive' ? 'Enable' : 'Disable' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="filtered().length === 0">
                <td colspan="6" style="text-align:center; padding:40px; color:var(--gray-400);">
                  {{ query ? 'No users match your search.' : 'No users found.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  query = '';
  studentCount = 0;
  adminCount = 0;
  message = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getUsers().pipe(catchError(() => of(mockUsers))).subscribe((data) => {
      this.users = data as User[];
      this.studentCount = this.users.filter(x => x.role === 'student').length;
      this.adminCount = this.users.filter(x => x.role === 'admin').length;
    });
  }

  filtered() {
    const q = this.query.toLowerCase();
    return this.users.filter(u =>
      `${u.firstName} ${u.lastName} ${u.email} ${u.studentNumber || ''}`.toLowerCase().includes(q)
    );
  }

  toggleStatus(user: User) {
    const nextStatus = user.status === 'inactive' ? 'active' : 'inactive';
    this.api.updateUserStatus(user._id, nextStatus).pipe(catchError((err) => {
      this.message = err?.error?.message || 'Could not update user status.';
      return of(null);
    })).subscribe((result) => {
      if (!result) return;
      this.message = `User account ${nextStatus === 'active' ? 'enabled' : 'disabled'}.`;
      this.load();
      setTimeout(() => this.message = '', 3000);
    });
  }
}
