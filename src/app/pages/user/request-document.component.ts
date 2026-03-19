import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="card" style="padding:1.5rem;">
      <h1>Request a Document</h1>
      <p class="muted">Submit your academic document request online and monitor the status afterwards.</p>
      <form [formGroup]="form" (ngSubmit)="submit()" class="grid grid-2">
        <div>
          <label>Service</label>
          <select class="select" formControlName="serviceId">
            <option value="">Select a service</option>
            <option *ngFor="let item of services" [value]="item._id">{{ item.name }}</option>
          </select>
        </div>
        <div>
          <label>Document Type</label>
          <input class="input" formControlName="documentType" placeholder="Example: Form 137">
        </div>
        <div style="grid-column:1/-1">
          <label>Purpose</label>
          <input class="input" formControlName="purpose" placeholder="Example: Employment, transfer, scholarship">
        </div>
        <div style="grid-column:1/-1">
          <label>Additional Notes</label>
          <textarea class="input" rows="4" formControlName="notes"></textarea>
        </div>
        <div style="grid-column:1/-1">
          <button class="btn btn-primary" type="submit">Submit Request</button>
        </div>
      </form>
      <p *ngIf="message" style="margin-top:1rem; font-weight:700;">{{ message }}</p>
    </section>
  `
})
export class RequestDocumentComponent implements OnInit {
  services: any[] = [];
  message = '';
  form: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      serviceId: ['', Validators.required],
      documentType: ['', Validators.required],
      purpose: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    this.api.getServices().subscribe((items) => {
      this.services = items.filter((item) => item.category === 'document');
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.api.createRequest(this.form.getRawValue()).subscribe(() => {
      this.message = 'Document request submitted successfully.';
      this.form.reset();
    });
  }
}
