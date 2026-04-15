import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex" style="background: var(--bg-primary)">
      <!-- Left panel -->
      <div class="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)">
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-16">
            <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">💰</div>
            <span class="text-white font-extrabold text-2xl">ExpensePro</span>
          </div>
          <h2 class="text-4xl font-extrabold text-white leading-tight mb-4">
            Take control of<br>your finances
          </h2>
          <p class="text-indigo-200 text-lg leading-relaxed">
            Track expenses, manage income, and gain<br>powerful insights into your spending habits.
          </p>
        </div>
        <!-- Stats cards -->
        <div class="grid grid-cols-2 gap-4 relative z-10">
          @for (stat of stats; track stat.label) {
            <div class="rounded-2xl p-4" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15)">
              <div class="text-3xl mb-1">{{ stat.icon }}</div>
              <div class="text-white font-bold text-lg">{{ stat.value }}</div>
              <div class="text-indigo-300 text-xs mt-0.5">{{ stat.label }}</div>
            </div>
          }
        </div>
        <!-- Decorative circles -->
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style="background: radial-gradient(circle, #818cf8, transparent)"></div>
        <div class="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10" style="background: radial-gradient(circle, #a78bfa, transparent)"></div>
      </div>

      <!-- Right panel - Login Form -->
      <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md animate-slide-up">
          <!-- Mobile logo -->
          <div class="flex items-center gap-3 mb-8 lg:hidden">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">💰</div>
            <span class="font-extrabold text-xl" style="color: var(--text-primary)">ExpensePro</span>
          </div>

          <h1 class="text-3xl font-extrabold mb-2" style="color: var(--text-primary)">Welcome back 👋</h1>
          <p class="mb-8 text-sm" style="color: var(--text-muted)">Sign in to your account to continue</p>

          <form (ngSubmit)="onLogin()" #loginForm="ngForm">
            <div class="space-y-4">
              <div class="ep-form-group">
                <label class="ep-label" for="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  class="ep-input"
                  placeholder="you@example.com"
                  [(ngModel)]="form.email"
                  name="email"
                  required
                  email
                >
              </div>

              <div class="ep-form-group">
                <div class="flex items-center justify-between mb-1.5">
                  <label class="ep-label mb-0" for="password">Password</label>
                  <a routerLink="/forgot-password" class="text-xs font-semibold" style="color: var(--primary)">Forgot password?</a>
                </div>
                <div class="relative">
                  <input
                    id="password"
                    [type]="showPassword ? 'text' : 'password'"
                    class="ep-input pr-12"
                    placeholder="Enter your password"
                    [(ngModel)]="form.password"
                    name="password"
                    required
                  >
                  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-lg opacity-50 hover:opacity-100" (click)="showPassword = !showPassword">
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>
            </div>

            @if (errorMsg) {
              <div class="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <span>⚠️</span> {{ errorMsg }}
              </div>
            }

            <button
              type="submit"
              class="ep-btn-primary ep-btn-lg w-full mt-6"
              [disabled]="loading"
            >
              @if (loading) {
                <span class="animate-spin">⟳</span> Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <p class="text-center mt-6 text-sm" style="color: var(--text-muted)">
            Don't have an account?
            <a routerLink="/signup" class="font-semibold ml-1" style="color: var(--primary)">Create one free →</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  form = { email: '', password: '' };
  loading = false;
  showPassword = false;
  errorMsg = '';

  stats = [
    { icon: '📊', value: '...', label: 'Active Users' },
    { icon: '💸', value: '...', label: 'Expenses Tracked' },
    { icon: '💎', value: 'Priceless', label: 'Community Love' },
    { icon: '🔒', value: '100%', label: 'Secure & Free' },
  ];

  constructor(private authService: AuthService, private router: Router, private toast: ToastService, private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/stats`).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.stats[0].value = `${res.users}`;
          this.stats[1].value = `₹${res.expensesAmount.toLocaleString()}`;
        }
      },
      error: () => {
         this.stats[0].value = '0';
         this.stats[1].value = '₹0';
      }
    });
  }

  onLogin(): void {
    if (!this.form.email || !this.form.password) {
      this.errorMsg = 'Please fill in all fields.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    this.authService.login(this.form).subscribe({
      next: () => {
        this.toast.success('Welcome back! 🎉');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const res = err.error;
        if (res?.requireVerification) {
          this.router.navigate(['/verify-email'], { queryParams: { userId: res.userId } });
        } else {
          this.errorMsg = res?.message || 'Login failed. Please try again.';
        }
      },
    });
  }
}
