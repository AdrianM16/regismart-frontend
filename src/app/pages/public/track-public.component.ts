import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="public-shell">
      <div class="auth-card" style="max-width:520px;">
        <div class="auth-logo">
          <div class="auth-logo-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h1>Track Request</h1>
          <p>Holy Angel University · Registrar</p>
        </div>

        <div class="form-group">
          <label class="field-label">Reference / Tracking Code</label>
          <input
            class="input"
            [(ngModel)]="code"
            placeholder="e.g. APPT-20260301-XXXX"
            (keydown.enter)="search()"
          />
        </div>
        <button class="btn btn-primary btn-full" (click)="search()" [disabled]="loading || !code.trim()">
          {{ loading ? 'Searching…' : '🔍 Track Request' }}
        </button>

        <div *ngIf="errorMessage" class="alert alert-error mt-4">{{ errorMessage }}</div>

        <!-- Result -->
        <div *ngIf="result" style="margin-top:24px;">
          <div style="background:var(--cream); border-radius:var(--radius); padding:20px;">
            <div class="flex justify-between items-center mb-4">
              <div>
                <div class="font-semibold" style="font-size:16px; color:var(--gray-900);">
                  {{ result.type === 'request' ? result.data.documentType : result.data.serviceId?.name }}
                </div>
                <div class="text-sm text-muted mt-1" *ngIf="result.data.fullName">
                  Requested by: {{ result.data.fullName }}
                </div>
              </div>
              <span class="status-pill" [class]="statusClass(result.data.status)">{{ result.data.status }}</span>
            </div>

            <div style="display:grid; gap:10px;">
              <div class="flex justify-between" style="padding:8px 0; border-bottom:1px solid var(--gray-200);">
                <span class="text-sm text-muted">Reference Code</span>
                <span class="text-sm font-semibold" style="font-family:monospace;">
                  {{ result.type === 'request' ? result.data.referenceNumber : result.data.appointmentCode }}
                </span>
              </div>
              <div class="flex justify-between" *ngIf="result.data.appointmentDate" style="padding:8px 0; border-bottom:1px solid var(--gray-200);">
                <span class="text-sm text-muted">Appointment Date</span>
                <span class="text-sm font-semibold">{{ result.data.appointmentDate | date:'MMMM d, y' }}</span>
              </div>
              <div class="flex justify-between" *ngIf="result.data.timeSlot" style="padding:8px 0; border-bottom:1px solid var(--gray-200);">
                <span class="text-sm text-muted">Time Slot</span>
                <span class="text-sm font-semibold">{{ result.data.timeSlot }}</span>
              </div>
              <div class="flex justify-between" *ngIf="result.data.purpose" style="padding:8px 0;">
                <span class="text-sm text-muted">Purpose</span>
                <span class="text-sm font-semibold">{{ result.data.purpose }}</span>
              </div>
            </div>
          </div>

          <p class="text-xs text-muted text-center mt-4">
            If your request has been completed, please visit the registrar office to claim your documents.
          </p>
        </div>

        <div class="auth-footer-link mt-6">
          <a routerLink="/">← Back to Home</a>
          ·
          <a routerLink="/guest-request">Submit a new request</a>
        </div>
      </div>
    </div>
  `
})
export class TrackPublicComponent {
  code = '';
  errorMessage = '';
  loading = false;
  result: any = null;

  constructor(private api: ApiService) {}

  search() {
    if (!this.code.trim()) return;
    this.loading = true;
    this.errorMessage = '';
    this.result = null;
    this.api.trackRequest(this.code.trim()).pipe(catchError((err) => {
      this.errorMessage = err?.error?.message || 'Reference code not found. Please check and try again.';
      this.loading = false;
      return of(null);
    })).subscribe((result) => {
      this.loading = false;
      if (!result) return;
      this.result = result;
    });
  }

  statusClass(status: string) {
    return 'status-' + (status || '').toLowerCase().replace(/\s+/g, '-');
  }
}
