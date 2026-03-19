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
      <div class="auth-card">
        <div class="auth-logo">
          <div class="auth-logo-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1>RegiSmart</h1>
          <p>Holy Angel University · Registrar</p>
        </div>

        <div *ngIf="message" class="alert" [ngClass]="isError ? 'alert-error' : 'alert-info'">
          {{ message }}
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="field-label">Email Address</label>
            <input class="input" formControlName="email" type="email" placeholder="student@hau.edu.ph" />
          </div>
          <div class="form-group">
            <label class="field-label">Password</label>
            <input class="input" formControlName="password" type="password" placeholder="••••••••" />
          </div>
          <button class="btn btn-primary btn-full mt-4" type="submit" [disabled]="loading">
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-divider">or</div>

        <div class="auth-footer-link">
          Don't have an account?
          <a routerLink="/register">Create one here</a>
        </div>
        <div class="auth-footer-link mt-2">
          Alumni or guest?
          <a routerLink="/guest-request">Submit without login</a>
        </div>
        <div class="auth-footer-link mt-2">
          Have a reference code?
          <a routerLink="/track">Track your request</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  message = 'Demo — admin@regismart.local / Admin123! or student@regismart.local / Student123!';
  isError = false;
  loading = false;
  form: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      email: ['student@regismart.local', [Validators.required, Validators.email]],
      password: ['Student123!', [Validators.required]]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.isError = false;
    this.auth.login(this.form.getRawValue() as { email: string; password: string }).pipe(
      catchError(() => {
        this.message = 'Unable to reach the server. Please start the API server and MongoDB, then try again.';
        this.isError = true;
        this.loading = false;
        return of(null);
      })
    ).subscribe((result) => {
      if (result) this.loading = false;
    });
  }
}
