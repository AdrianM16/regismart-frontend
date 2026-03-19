import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-shell">

      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <div class="admin-sidebar-brand">RegiSmart</div>
          <div class="admin-sidebar-sub">Admin Panel · HAU</div>
        </div>

        <div class="admin-sidebar-nav">
          <div class="admin-sidebar-nav-label">Overview</div>
          <a routerLink="/admin/dashboard" routerLinkActive="active">
            <span class="nav-icon">📊</span> Dashboard
          </a>
          <a routerLink="/admin/queue" routerLinkActive="active">
            <span class="nav-icon">🗂️</span> Today's Queue
          </a>

          <div class="admin-sidebar-nav-label">Management</div>
          <a routerLink="/admin/requests" routerLinkActive="active">
            <span class="nav-icon">📄</span> Doc Requests
          </a>
          <a routerLink="/admin/walkins" routerLinkActive="active">
            <span class="nav-icon">🚶</span> Walk-ins
          </a>
          <a routerLink="/admin/users" routerLinkActive="active">
            <span class="nav-icon">👥</span> Students
          </a>

          <div class="admin-sidebar-nav-label">Analytics</div>
          <a routerLink="/admin/reports" routerLinkActive="active">
            <span class="nav-icon">📈</span> Reports
          </a>
        </div>
      </aside>

      <!-- Main Area -->
      <div class="admin-main">
        <!-- Admin Topbar -->
        <header class="admin-topbar">
          <div class="admin-topbar-title">Holy Angel University · Office of the Registrar</div>
          <div class="admin-topbar-actions">
            <a class="btn btn-outline btn-sm" routerLink="/admin/walkins">+ Walk-in</a>
            <button class="btn btn-primary btn-sm" type="button" (click)="logout()">Sign Out</button>
          </div>
        </header>

        <!-- Page Content -->
        <div class="admin-content">
          <router-outlet />
        </div>
      </div>

      <!-- Mobile Bottom Nav (Admin) -->
      <nav class="mobile-nav">
        <div class="mobile-nav-inner">
          <a class="mobile-nav-item" routerLink="/admin/dashboard" routerLinkActive="active">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a class="mobile-nav-item" routerLink="/admin/queue" routerLinkActive="active">
            <span class="nav-icon">🗂️</span>
            <span>Queue</span>
          </a>
          <a class="mobile-nav-item" routerLink="/admin/reports" routerLinkActive="active">
            <span class="nav-icon">📈</span>
            <span>Reports</span>
          </a>
          <a class="mobile-nav-item" routerLink="/admin/users" routerLinkActive="active">
            <span class="nav-icon">👥</span>
            <span>Students</span>
          </a>
        </div>
      </nav>

    </div>
  `
})
export class AdminLayoutComponent {
  constructor(public auth: AuthService) {}
  logout() { this.auth.logout(); }
}
