import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  user = signal<User | null>(this.getStoredUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(payload: { email: string; password: string }) {
    return this.http.post<{ token: string; user: User }>(`${this.api}/auth/login`, payload).pipe(
      tap((res) => this.storeSession(res.token, res.user))
    );
  }

  register(payload: Record<string, string>) {
    return this.http.post<{ token: string; user: User }>(`${this.api}/auth/register`, payload).pipe(
      tap((res) => this.storeSession(res.token, res.user))
    );
  }

  logout() {
    localStorage.removeItem('regismart_token');
    localStorage.removeItem('regismart_user');
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  get token() {
    return localStorage.getItem('regismart_token');
  }

  get fullName() {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}` : 'Guest User';
  }

  private storeSession(token: string, user: User) {
    localStorage.setItem('regismart_token', token);
    localStorage.setItem('regismart_user', JSON.stringify(user));
    this.user.set(user);
    this.router.navigate([user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard']);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('regismart_user');
    return raw ? JSON.parse(raw) : null;
  }
}
