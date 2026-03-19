import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="public-shell">
      <div class="auth-card auth-card-wide">
        <div class="auth-logo">
          <div class="auth-logo-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1>RegiSmart</h1>
          <p>Create Student Account</p>
        </div>

        <div *ngIf="message" class="alert" [ngClass]="isError ? 'alert-error' : 'alert-success'">
          {{ message }}
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <div class="form-group">
              <label class="field-label">First Name</label>
              <input class="input" formControlName="firstName" placeholder="Juan" />
            </div>
            <div class="form-group">
              <label class="field-label">Last Name</label>
              <input class="input" formControlName="lastName" placeholder="dela Cruz" />
            </div>
            <div class="form-group">
              <label class="field-label">Email Address</label>
              <input class="input" formControlName="email" type="email" placeholder="student@hau.edu.ph" />
            </div>
            <div class="form-group">
              <label class="field-label">Student ID Number</label>
              <input class="input" formControlName="studentNumber" placeholder="20XX-XXXXX" />
            </div>
            <div class="form-group">
              <label class="field-label">Program / Course</label>
              <input class="input" formControlName="course" placeholder="e.g. BS Information Technology" />
            </div>
            <div class="form-group">
              <label class="field-label">Password</label>
              <input class="input" formControlName="password" type="password" placeholder="Create a strong password" />
            </div>
          </div>
          <button class="btn btn-primary btn-full mt-4" type="submit" [disabled]="loading">
            {{ loading ? 'Creating account…' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-divider">or</div>
        <div class="auth-footer-link">
          Already have an account?
          <a routerLink="/login">Sign in here</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  message = '';
  isError = false;
  loading = false;
  form: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      studentNumber: ['', Validators.required],
      course: ['BS Information Technology', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.isError = false;
    this.auth.register(this.form.getRawValue() as Record<string, string>).pipe(
      catchError(() => {
        this.message = 'Registration failed. Please check your connection or try a different email.';
        this.isError = true;
        this.loading = false;
        return of(null);
      })
    ).subscribe((result) => {
      if (result) this.loading = false;
    });
  }
}
