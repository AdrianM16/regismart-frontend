import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
        <h1>Add Walk-in Entry</h1>
        <p>Manually encode a walk-in, alumni, or visitor appointment into the system.</p>
      </div>

      <div *ngIf="message" class="alert" [ngClass]="isError ? 'alert-error' : 'alert-success'">
        {{ message }}
      </div>

      <div class="card">
        <div class="card-body">

          <div class="section-heading">Requester Information</div>
          <div class="form-grid mb-6">
            <div class="form-group">
              <label class="field-label">Requester Type</label>
              <select class="input" [(ngModel)]="requesterType">
                <option value="walk-in">Walk-in</option>
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
              <input class="input" [(ngModel)]="email" type="email" placeholder="requester@email.com" />
            </div>
            <div class="form-group">
              <label class="field-label">Contact Number</label>
              <input class="input" [(ngModel)]="contactNumber" placeholder="09XX XXX XXXX" />
            </div>
            <div class="form-group">
              <label class="field-label">Student Number <span style="font-weight:400; text-transform:none; letter-spacing:0;">(Optional)</span></label>
              <input class="input" [(ngModel)]="studentNumber" placeholder="20XX-XXXXX" />
            </div>
          </div>

          <div class="section-heading">Appointment Details</div>
          <div class="form-grid mb-6">
            <div class="form-group">
              <label class="field-label">Service</label>
              <select class="input" [(ngModel)]="serviceId">
                <option *ngFor="let service of services" [value]="service._id">{{ service.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="field-label">Date</label>
              <input class="input" type="date" [(ngModel)]="appointmentDate" />
            </div>
            <div class="form-group">
              <label class="field-label">Time Slot</label>
              <select class="input" [(ngModel)]="timeSlot">
                <option *ngFor="let slot of slots" [value]="slot">{{ slot }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="field-label">Purpose</label>
              <input class="input" [(ngModel)]="purpose" placeholder="e.g. Scholarship, Employment" />
            </div>
            <div class="form-group grid-full">
              <label class="field-label">Notes <span style="font-weight:400; text-transform:none; letter-spacing:0;">(Optional)</span></label>
              <input class="input" [(ngModel)]="notes" placeholder="Any additional notes for this entry" />
            </div>
          </div>

          <div class="flex justify-between">
            <button class="btn btn-outline" type="button" (click)="clearForm()">Clear Form</button>
            <button class="btn btn-primary" type="button" (click)="submit()" [disabled]="loading">
              {{ loading ? 'Saving…' : '✓ Save Walk-in Entry' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  `
})
export class WalkinComponent implements OnInit {
  services: Service[] = [];
  requesterType = 'walk-in';
  fullName = ''; email = ''; contactNumber = ''; studentNumber = '';
  serviceId = '';
  appointmentDate = new Date().toISOString().slice(0, 10);
  timeSlot = '8:00 AM';
  purpose = ''; notes = '';
  message = ''; isError = false; loading = false;
  slots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getServices().pipe(catchError(() => of(mockServices))).subscribe((data) => {
      this.services = data as Service[];
      this.serviceId = this.services[0]?._id || '';
    });
  }

  submit() {
    if (!this.fullName || !this.email || !this.serviceId) {
      this.message = 'Please fill in the required fields: Full Name, Email, and Service.';
      this.isError = true;
      return;
    }
    this.loading = true;
    this.isError = false;
    this.api.createManualAppointment({
      requesterType: this.requesterType, fullName: this.fullName, email: this.email,
      contactNumber: this.contactNumber, studentNumber: this.studentNumber,
      serviceId: this.serviceId, appointmentDate: this.appointmentDate,
      timeSlot: this.timeSlot, purpose: this.purpose, notes: this.notes
    }).pipe(catchError((err) => {
      this.message = err?.error?.message || 'Could not save manual entry.';
      this.isError = true;
      this.loading = false;
      return of(null);
    })).subscribe((result) => {
      if (!result) return;
      this.message = 'Walk-in entry saved successfully and added to today\'s queue.';
      this.isError = false;
      this.loading = false;
    });
  }

  clearForm() {
    this.fullName = ''; this.email = ''; this.contactNumber = '';
    this.studentNumber = ''; this.purpose = ''; this.notes = '';
    this.requesterType = 'walk-in';
    this.appointmentDate = new Date().toISOString().slice(0, 10);
    this.message = '';
  }
}
