import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthState } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Reactive state
  private _authState = signal<AuthState>({
    user: this.getStoredUser(),
    token: localStorage.getItem('ep_token'),
    isLoggedIn: !!localStorage.getItem('ep_token'),
  });

  readonly user = computed(() => this._authState().user);
  readonly token = computed(() => this._authState().token);
  readonly isLoggedIn = computed(() => this._authState().isLoggedIn);

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { name: string; email: string; password: string; mobile?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  verifyEmail(data: { userId: string; otp: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, data).pipe(
      tap((res: any) => {
        if (res.success) this.setSession(res.token, res.user);
      })
    );
  }

  resendOTP(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-otp`, { userId });
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        if (res.success) this.setSession(res.token, res.user);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: { userId: string; otp: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  logout(): void {
    localStorage.removeItem('ep_token');
    localStorage.removeItem('ep_user');
    this._authState.set({ user: null, token: null, isLoggedIn: false });
    this.router.navigate(['/login']);
  }

  updateStoredUser(user: User): void {
    localStorage.setItem('ep_user', JSON.stringify(user));
    this._authState.update(state => ({ ...state, user }));
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem('ep_token', token);
    localStorage.setItem('ep_user', JSON.stringify(user));
    this._authState.set({ user, token, isLoggedIn: true });
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('ep_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
