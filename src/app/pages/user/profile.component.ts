import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { mockStudent } from '../../core/mock-data';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <!-- Profile Header Card -->
      <div class="card mb-6">
        <div class="profile-header">
          <div class="profile-avatar">{{ initial }}</div>
          <div class="profile-info">
            <h2>{{ form.value.firstName }} {{ form.value.lastName }}</h2>
            <p>{{ form.value.studentNumber || 'No student ID' }} · {{ form.value.course || 'Student' }}</p>
          </div>
        </div>
        <div class="card-body">
          <div class="flex gap-4" style="flex-wrap:wrap;">
            <div style="text-align:center; flex:1; min-width:100px;">
              <div style="font-size:11px; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Year Level</div>
              <div style="font-weight:600; color:var(--gray-800);">{{ form.value.yearLevel || '—' }}</div>
            </div>
            <div style="text-align:center; flex:1; min-width:100px;">
              <div style="font-size:11px; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Email</div>
              <div style="font-weight:600; color:var(--gray-800); font-size:13px;">{{ form.value.email || '—' }}</div>
            </div>
            <div style="text-align:center; flex:1; min-width:100px;">
              <div style="font-size:11px; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Mobile</div>
              <div style="font-weight:600; color:var(--gray-800);">{{ form.value.mobile || '—' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="card mb-6">
        <div class="card-body">
          <div class="section-heading">Personal Information</div>

          <div *ngIf="message" class="alert" [ngClass]="isError ? 'alert-error' : 'alert-success'">
            {{ message }}
          </div>

          <form [formGroup]="form">
            <div class="form-grid">
              <div class="form-group">
                <label class="field-label">First Name</label>
                <input class="input" formControlName="firstName" />
              </div>
              <div class="form-group">
                <label class="field-label">Last Name</label>
                <input class="input" formControlName="lastName" />
              </div>
              <div class="form-group">
                <label class="field-label">Email Address</label>
                <input class="input" formControlName="email" type="email" />
              </div>
              <div class="form-group">
                <label class="field-label">Student ID Number</label>
                <input class="input" formControlName="studentNumber" />
              </div>
              <div class="form-group">
                <label class="field-label">Program / Course</label>
                <input class="input" formControlName="course" />
              </div>
              <div class="form-group">
                <label class="field-label">Year Level</label>
                <input class="input" formControlName="yearLevel" placeholder="e.g. 3rd Year" />
              </div>
              <div class="form-group">
                <label class="field-label">Mobile Number</label>
                <input class="input" formControlName="mobile" placeholder="e.g. 09XX XXX XXXX" />
              </div>
            </div>

            <div class="flex justify-between mt-6">
              <button class="btn btn-outline" type="button" (click)="reload()">Discard Changes</button>
              <button class="btn btn-primary" type="button" (click)="save()">Save Changes</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-body">
          <div class="section-heading">Recent Activity</div>
          <div style="display:grid; gap:10px;">
            <div *ngFor="let item of activity" class="flex justify-between items-center" style="padding:10px 0; border-bottom:1px solid var(--gray-100);">
              <span class="text-sm" style="color:var(--gray-700);">{{ item.label }}</span>
              <span class="text-xs text-muted">{{ item.when }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  message = '';
  isError = false;
  activity = [
    { label: 'TOR request — serving', when: 'Feb 10' },
    { label: 'Enrollment cert — approved', when: 'Feb 8' },
    { label: 'Good moral — released', when: 'Jan 30' }
  ];
  form: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      firstName: [''], lastName: [''], email: [''],
      studentNumber: [''], course: [''], mobile: [''], yearLevel: ['']
    });
  }

  get initial(): string {
    return (this.form.value.firstName || 'S').charAt(0).toUpperCase();
  }

  ngOnInit() { this.reload(); }

  reload() {
    this.api.getMyProfile().pipe(catchError(() => of(mockStudent))).subscribe((user: any) => {
      this.form.patchValue(user);
      this.message = '';
    });
  }

  save() {
    this.api.updateMyProfile(this.form.getRawValue()).pipe(catchError((err) => {
      this.message = err?.error?.message || 'Could not save profile changes.';
      this.isError = true;
      return of(null);
    })).subscribe((user) => {
      if (!user) return;
      this.form.patchValue(user);
      this.message = 'Profile updated successfully.';
      this.isError = false;
    });
  }
}
