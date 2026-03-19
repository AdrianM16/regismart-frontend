import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="student-shell">

      <!-- Top Navigation Bar -->
      <header class="topbar">
        <div class="topbar-brand">
          <div class="topbar-brand-logo">R</div>
          <div class="topbar-brand-text">
            <span class="topbar-brand-name">RegiSmart</span>
            <span class="topbar-brand-sub">HAU Registrar</span>
          </div>
        </div>

        <nav class="topbar-nav">
          <a routerLink="/student/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/student/book"      routerLinkActive="active">Book Appointment</a>
          <a routerLink="/student/requests"  routerLinkActive="active">My Requests</a>
          <a routerLink="/student/profile"   routerLinkActive="active">Profile</a>
        </nav>

        <div class="topbar-user">
          <div class="topbar-avatar">{{ initial }}</div>
          <button class="topbar-nav-logout" type="button" (click)="logout()">Sign Out</button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="student-main">
        <router-outlet />
      </main>

      <!-- Mobile Bottom Navigation -->
      <nav class="mobile-nav">
        <div class="mobile-nav-inner">
          <a class="mobile-nav-item" routerLink="/student/dashboard" routerLinkActive="active">
            <span class="nav-icon">🏠</span>
            <span>Home</span>
          </a>
          <a class="mobile-nav-item" routerLink="/student/book" routerLinkActive="active">
            <span class="nav-icon">📅</span>
            <span>Book</span>
          </a>
          <a class="mobile-nav-item" routerLink="/student/requests" routerLinkActive="active">
            <span class="nav-icon">📄</span>
            <span>Requests</span>
          </a>
          <a class="mobile-nav-item" routerLink="/student/profile" routerLinkActive="active">
            <span class="nav-icon">👤</span>
            <span>Profile</span>
          </a>
        </div>
      </nav>

    </div>
  `
})
export class UserLayoutComponent {
  constructor(public auth: AuthService) {}

  get initial(): string {
    return (this.auth.fullName || 'S').charAt(0).toUpperCase();
  }

  logout() { this.auth.logout(); }
}
