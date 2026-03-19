import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Service } from '../../core/models';
import { mockServices } from '../../core/mock-data';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="page-header">
        <h1>Book an Appointment</h1>
        <p>Select your service, date, and time slot — your booking will be reviewed by the registrar.</p>
      </div>

      <!-- Step Indicator -->
      <div class="step-indicator mb-6">
        <div class="step-indicator-item" [class.active]="step === 1" [class.done]="step > 1">1 · Service</div>
        <div class="step-indicator-item" [class.active]="step === 2" [class.done]="step > 2">2 · Schedule</div>
        <div class="step-indicator-item" [class.active]="step === 3">3 · Confirm</div>
      </div>

      <div *ngIf="message" class="alert" [ngClass]="isError ? 'alert-error' : 'alert-success'">
        {{ message }}
      </div>

      <!-- STEP 1: Choose Service -->
      <div class="card mb-4" *ngIf="step === 1">
        <div class="card-body">
          <div class="section-heading">Select a Service</div>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap:12px;">
            <div
              *ngFor="let service of services"
              (click)="selectService(service)"
              class="service-option"
              [class.selected]="selectedServiceId === service._id"
              style="border:2px solid var(--gray-200); border-radius:var(--radius); padding:16px; cursor:pointer; transition:all 0.15s; background:var(--white);"
              [style.borderColor]="selectedServiceId === service._id ? 'var(--maroon)' : ''"
              [style.background]="selectedServiceId === service._id ? 'rgba(107,13,35,0.04)' : ''"
            >
              <div style="font-size:22px; margin-bottom:6px;">
                {{ service.category === 'document' ? '📄' : '📅' }}
              </div>
              <div style="font-weight:600; color:var(--gray-900); margin-bottom:4px; font-size:14px;">
                {{ service.name }}
              </div>
              <div style="font-size:12px; color:var(--gray-500);">
                {{ service.description || (service.category === 'document' ? 'Document request' : 'Appointment booking') }}
              </div>
            </div>
          </div>
          <div class="flex justify-between mt-6">
            <span></span>
            <button class="btn btn-primary" [disabled]="!selectedServiceId" (click)="step=2">
              Next: Choose Schedule →
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 2: Date & Time -->
      <div class="card mb-4" *ngIf="step === 2">
        <div class="card-body">
          <div class="section-heading">Choose Date & Time</div>
          <div class="form-grid mb-6">
            <div class="form-group">
              <label class="field-label">Available Date</label>
              <select class="input" [(ngModel)]="selectedDate" (ngModelChange)="loadAvailability()">
                <option *ngFor="let day of dates" [value]="day.date" [disabled]="!day.available">
                  {{ day.text }}{{ day.available ? '' : ' — Unavailable' }}
                </option>
              </select>
            </div>
            <div class="form-group" *ngIf="selectedService?.category === 'document'">
              <label class="field-label">Purpose</label>
              <input class="input" [(ngModel)]="purpose" placeholder="e.g. Scholarship, Employment, Transfer" />
            </div>
          </div>

          <label class="field-label mb-2">Available Time Slots</label>
          <div class="timeslot-grid mb-4">
            <button
              class="timeslot-chip"
              type="button"
              *ngFor="let slot of slotAvailability"
              [disabled]="!slot.available"
              [class.active]="selectedSlot === slot.slot"
              (click)="selectedSlot = slot.slot"
            >
              {{ slot.slot }}
            </button>
          </div>
          <div *ngIf="slotAvailability.length === 0" class="text-muted text-sm">
            Loading available slots…
          </div>

          <div class="form-group mt-4">
            <label class="field-label">Additional Notes <span style="font-weight:400; text-transform:none; letter-spacing:0;">(Optional)</span></label>
            <input class="input" [(ngModel)]="notes" placeholder="Any notes for the registrar office" />
          </div>

          <div class="flex justify-between mt-6">
            <button class="btn btn-outline" (click)="step=1">← Back</button>
            <button class="btn btn-primary" [disabled]="!selectedDate || !selectedSlot" (click)="step=3">
              Next: Review →
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 3: Confirm -->
      <div class="card mb-4" *ngIf="step === 3">
        <div class="card-body">
          <div class="section-heading">Review & Confirm</div>

          <div style="background:var(--cream); border-radius:var(--radius); padding:20px; margin-bottom:24px;">
            <div style="display:grid; gap:12px;">
              <div class="flex justify-between" style="border-bottom:1px solid var(--gray-200); padding-bottom:10px;">
                <span class="text-muted text-sm font-medium" style="text-transform:uppercase; letter-spacing:0.06em;">Service</span>
                <span class="font-semibold">{{ selectedService?.name }}</span>
              </div>
              <div class="flex justify-between" style="border-bottom:1px solid var(--gray-200); padding-bottom:10px;">
                <span class="text-muted text-sm font-medium" style="text-transform:uppercase; letter-spacing:0.06em;">Date</span>
                <span class="font-semibold">{{ formatDate(selectedDate) }}</span>
              </div>
              <div class="flex justify-between" style="border-bottom:1px solid var(--gray-200); padding-bottom:10px;">
                <span class="text-muted text-sm font-medium" style="text-transform:uppercase; letter-spacing:0.06em;">Time</span>
                <span class="font-semibold">{{ selectedSlot }}</span>
              </div>
              <div class="flex justify-between" *ngIf="purpose" style="border-bottom:1px solid var(--gray-200); padding-bottom:10px;">
                <span class="text-muted text-sm font-medium" style="text-transform:uppercase; letter-spacing:0.06em;">Purpose</span>
                <span class="font-semibold">{{ purpose }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted text-sm font-medium" style="text-transform:uppercase; letter-spacing:0.06em;">Status</span>
                <span class="status-pill status-pending">Pending Review</span>
              </div>
            </div>
          </div>

          <p class="text-sm text-muted mb-6">
            Your appointment will be reviewed by the registrar. You will be notified once it is approved.
            Please arrive on time on your scheduled date.
          </p>

          <div class="flex justify-between">
            <button class="btn btn-outline" (click)="step=2">← Edit</button>
            <button class="btn btn-primary" [disabled]="isSubmitting" (click)="submit()">
              {{ isSubmitting ? 'Submitting…' : '✓ Submit Appointment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookAppointmentComponent implements OnInit {
  services: Service[] = [];
  selectedServiceId = '';
  selectedDate = '';
  selectedSlot = '';
  purpose = '';
  notes = '';
  message = '';
  isError = false;
  isSubmitting = false;
  step = 1;

  dates: { date: string; text: string; available: boolean }[] = [];
  slotAvailability: { slot: string; available: boolean }[] = [];

  constructor(private api: ApiService, private router: Router) {}

  get selectedService() {
    return this.services.find(s => s._id === this.selectedServiceId) || null;
  }

  ngOnInit() {
    this.dates = this.buildDates();
    this.api.getServices().pipe(catchError(() => of(mockServices))).subscribe((data) => {
      this.services = (data as Service[]).filter(x => x.category === 'appointment' || x.category === 'document');
      this.selectedDate = this.dates.find(d => d.available)?.date || '';
    });
  }

  selectService(service: Service) {
    this.selectedServiceId = service._id;
  }

  buildDates() {
    return Array.from({ length: 10 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const isWeekend = [0, 6].includes(date.getDay());
      return {
        date: date.toISOString().slice(0, 10),
        text: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        available: !isWeekend
      };
    });
  }

  loadAvailability() {
    if (!this.selectedServiceId || !this.selectedDate) return;
    this.slotAvailability = [];
    this.api.getAvailability(this.selectedServiceId, this.selectedDate)
      .pipe(catchError(() => of({ slots: [] })))
      .subscribe((result) => {
        this.slotAvailability = (result?.slots || []).map((item: any) => ({ slot: item.slot, available: item.available }));
        this.selectedSlot = this.slotAvailability.find(s => s.available)?.slot || '';
      });
  }

  submit() {
    this.message = '';
    if (!this.selectedServiceId) { this.message = 'Please choose a service.'; this.isError = true; return; }
    if (!this.selectedDate)      { this.message = 'Please choose a date.'; this.isError = true; return; }
    if (!this.selectedSlot)      { this.message = 'Please choose a time slot.'; this.isError = true; return; }
    if (this.selectedService?.category === 'document' && !this.purpose.trim()) {
      this.message = 'Please enter the purpose of your document request.'; this.isError = true; return;
    }

    this.isSubmitting = true;
    this.api.createAppointment({
      serviceId: this.selectedServiceId,
      appointmentDate: this.selectedDate,
      timeSlot: this.selectedSlot,
      purpose: this.purpose,
      notes: this.notes
    }).pipe(catchError((err) => {
      this.message = err?.error?.message || 'Appointment could not be saved. Please try again.';
      this.isError = true;
      this.isSubmitting = false;
      return of(null);
    })).subscribe((result: any) => {
      if (!result) return;
      this.isSubmitting = false;
      this.router.navigate(['/student/requests'], {
        queryParams: { created: result?.appointment?.appointmentCode || '1' }
      });
    });
  }

  formatDate(value: string) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
}
