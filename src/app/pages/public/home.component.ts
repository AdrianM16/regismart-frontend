import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="public-shell">
      <div class="landing-hero">
        <div class="landing-badge">
          <span></span>
          Holy Angel University · Office of the Registrar
        </div>
        <h1 class="landing-title">
          Your Registrar,<br>
          <span class="accent">Smarter.</span>
        </h1>
        <p class="landing-subtitle">
          Book appointments, submit document requests, track your status in real-time —
          no more long lines or repeated follow-ups.
        </p>

        <div class="landing-actions">
          <a class="landing-action-card" routerLink="/login">
            <div class="icon">🎓</div>
            <div class="label">Student Login</div>
            <div class="sublabel">For enrolled students</div>
          </a>
          <a class="landing-action-card" routerLink="/register">
            <div class="icon">📝</div>
            <div class="label">Create Account</div>
            <div class="sublabel">New student? Register here</div>
          </a>
          <a class="landing-action-card" routerLink="/guest-request">
            <div class="icon">🎓</div>
            <div class="label">Alumni / Guest</div>
            <div class="sublabel">Request without login</div>
          </a>
          <a class="landing-action-card" routerLink="/track">
            <div class="icon">🔍</div>
            <div class="label">Track Request</div>
            <div class="sublabel">Use your reference code</div>
          </a>
        </div>

        <div class="landing-features">
          <div class="landing-feature">
            <strong>📅 Online Booking</strong>
            Schedule your registrar visit anytime, from anywhere
          </div>
          <div class="landing-feature">
            <strong>📄 Document Tracking</strong>
            Real-time status updates on all your document requests
          </div>
          <div class="landing-feature">
            <strong>🏫 Queue Management</strong>
            Structured workflow ensures no student is missed
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {}
