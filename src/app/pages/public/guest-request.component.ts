import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Service } from '../../core/models';
import { mockServices } from '../../core/mock-data';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="public-shell" style="align-items:flex-start; padding-top:40px; padding-bottom:40px;">
      <!-- Success State -->
      <div class="auth-card" *ngIf="submitted" style="text-align:center; max-width:480px;">
        <div style="font-size:56px; margin-bottom:16px;">✅</div>
        <h2 style="font-family:var(--font-display); color:var(--maroon); margin-bottom:8px;">Request Submitted!</h2>
        <p class="text-muted mb-6">Your request has been received and will be reviewed by the registrar office.</p>

        <div style="background:var(--cream); border-radius:var(--radius); padding:20px; margin-bottom:24px;">
          <div style="font-size:12px; font-weight:600; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">
            Your Tracking Code
          </div>
          <div style="font-family:var(--font-display); font-size:28px; font-weight:700; color:var(--maroon); letter-spacing:0.04em;">
            {{ trackingCode }}
          </div>
          <div style="font-size:12px; color:var(--gray-400); margin-top:6px;">
            Save this code to track your request status
          </div>
        </div>

        <div class="flex gap-3" style="flex-direction:column;">
          <a class="btn btn-primary btn-full" routerLink="/track">🔍 Track This Request</a>
          <button class="btn btn-outline btn-full" type="button" (click)="reset()">Submit Another Request</button>
          <a class="btn btn-ghost btn-full" routerLink="/">← Back to Home</a>
        </div>
      </div>

      <!-- Form -->
      <div class="auth-card auth-card-wide" *ngIf="!submitted">
        <div class="auth-logo">
          <div class="auth-logo-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h1>RegiSmart</h1>
          <p>Alumni & Guest Request Form</p>
        </div>

        <div *ngIf="errorMessage" class="alert alert-error">{{ errorMessage }}</div>

        <div class="form-grid">
          <div class="form-group">
            <label class="field-label">Requester Type</label>
            <select class="input" [(ngModel)]="requesterType">
              <option value="alumni">Alumni</option>
              <option value="visitor">Visitor / Guest</option>
            </select>
          </div>
          <div class="form-group">
            <label class="field-label">Full Name</label>
            <input class="input" [(ngModel)]="fullName" placeholder="Juan dela Cruz" />
          </div>
          <div class="form-group">
            <label class="field-label">Email Address</label>
            <input class="input" [(ngModel)]="email" type="email" placeholder="yourname@email.com" />
          </div>
          <div class="form-group">
            <label class="field-label">Contact Number</label>
            <input class="input" [(ngModel)]="contactNumber" placeholder="09XX XXX XXXX" />
          </div>
          <div class="form-group">
            <label class="field-label">Former Student Number <span style="font-weight:400; text-transform:none; letter-spacing:0;">(Optional)</span></label>
            <input class="input" [(ngModel)]="studentNumber" placeholder="20XX-XXXXX" />
          </div>
          <div class="form-group">
            <label class="field-label">Service Requested</label>
            <select class="input" [(ngModel)]="serviceId" (ngModelChange)="loadAvailability()">
              <option *ngFor="let service of services" [value]="service._id">{{ service.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="field-label">Purpose</label>
            <input class="input" [(ngModel)]="purpose" placeholder="e.g. Employment, Scholarship, Transfer" />
          </div>
          <div class="form-group">
            <label class="field-label">Preferred Date</label>
            <select class="input" [(ngModel)]="appointmentDate" (ngModelChange)="loadAvailability()">
              <option *ngFor="let day of days" [value]="day">{{ formatDay(day) }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="field-label">Preferred Time Slot</label>
            <select class="input" [(ngModel)]="timeSlot">
              <option *ngFor="let slot of slots" [value]="slot.slot" [disabled]="!slot.available">
                {{ slot.slot }}{{ slot.available ? '' : ' — Full' }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="field-label">Additional Notes <span style="font-weight:400; text-transform:none; letter-spacing:0;">(Optional)</span></label>
            <input class="input" [(ngModel)]="notes" placeholder="Any special instructions" />
          </div>
        </div>

        <button class="btn btn-primary btn-full mt-6" type="button" (click)="submit()" [disabled]="loading">
          {{ loading ? 'Submitting…' : 'Submit Request' }}
        </button>

        <div class="auth-footer-link mt-4">
          Have an account?
          <a routerLink="/login">Sign in instead</a>
        </div>
      </div>
    </div>
  `
})
export class GuestRequestComponent implements OnInit {
  services: Service[] = [];
  requesterType = 'alumni';
  fullName = ''; email = ''; contactNumber = ''; studentNumber = '';
  serviceId = ''; purpose = ''; appointmentDate = ''; timeSlot = ''; notes = '';
  errorMessage = ''; trackingCode = '';
  submitted = false; loading = false;
  days: string[] = [];
  slots: { slot: string; available: boolean }[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return date.toISOString().slice(0, 10);
    });
    this.appointmentDate = this.days[0];
    this.api.getServices().pipe(catchError(() => of(mockServices))).subscribe((data) => {
      this.services = (data as Service[]).filter(x => x.category === 'document' || x.category === 'appointment');
      this.serviceId = this.services[0]?._id || '';
      this.loadAvailability();
    });
  }

  loadAvailability() {
    if (!this.serviceId || !this.appointmentDate) return;
    this.api.getAvailability(this.serviceId, this.appointmentDate).pipe(catchError(() => of({ slots: [] }))).subscribe((data) => {
      this.slots = data.slots || [];
      this.timeSlot = this.slots.find((s: any) => s.available)?.slot || '';
    });
  }

  formatDay(day: string) {
    return new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  submit() {
    if (!this.fullName || !this.email || !this.serviceId || !this.appointmentDate || !this.timeSlot) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.api.createGuestAppointment({
      requesterType: this.requesterType, fullName: this.fullName, email: this.email,
      contactNumber: this.contactNumber, studentNumber: this.studentNumber,
      serviceId: this.serviceId, purpose: this.purpose,
      appointmentDate: this.appointmentDate, timeSlot: this.timeSlot, notes: this.notes
    }).pipe(catchError((err) => {
      this.errorMessage = err?.error?.message || 'Could not submit request. Please try again.';
      this.loading = false;
      return of(null);
    })).subscribe((result: any) => {
      if (!result) return;
      this.trackingCode = result.trackingCode || result.appointment?.appointmentCode || '—';
      this.submitted = true;
      this.loading = false;
    });
  }

  reset() {
    this.submitted = false; this.trackingCode = '';
    this.fullName = ''; this.email = ''; this.purpose = '';
  }
}
