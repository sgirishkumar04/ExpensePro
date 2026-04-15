import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--bg-primary)">
      <div class="w-full max-w-lg animate-slide-up">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">💰</div>
          <h1 class="text-3xl font-extrabold" style="color: var(--text-primary)">Create your account</h1>
          <p class="mt-2 text-sm" style="color: var(--text-muted)">Start managing your finances for free</p>
        </div>

        <div class="ep-card">
          <form (ngSubmit)="onSignup()" #signupForm="ngForm">
            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="ep-form-group">
                  <label class="ep-label" for="name">Full Name</label>
                  <input id="name" type="text" class="ep-input" placeholder="Your Name" [(ngModel)]="form.name" name="name" required>
                </div>
                <div class="ep-form-group">
                  <label class="ep-label" for="mobile">Mobile (optional)</label>
                  <input id="mobile" type="tel" class="ep-input" placeholder="+91 98765 43210" [(ngModel)]="form.mobile" name="mobile">
                </div>
              </div>

              <div class="ep-form-group">
                <label class="ep-label" for="email">Email Address</label>
                <input id="email" type="email" class="ep-input" placeholder="you@example.com" [(ngModel)]="form.email" name="email" required email>
              </div>

              <div class="ep-form-group">
                <label class="ep-label" for="password">Password</label>
                <div class="relative">
                  <input id="password" [type]="showPassword ? 'text' : 'password'" class="ep-input pr-12"
                    placeholder="Min. 6 characters" [(ngModel)]="form.password" name="password" required minlength="6">
                  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-lg opacity-50 hover:opacity-100" (click)="showPassword = !showPassword">
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <div class="ep-form-group">
                <label class="ep-label" for="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" [type]="showPassword ? 'text' : 'password'" class="ep-input"
                  placeholder="Confirm your password" [(ngModel)]="form.confirmPassword" name="confirmPassword" required>
                @if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
                  <p class="ep-error">Passwords do not match</p>
                }
              </div>
            </div>

            @if (errorMsg) {
              <div class="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm flex items-center gap-2">
                <span>⚠️</span> {{ errorMsg }}
              </div>
            }

            <button type="submit" class="ep-btn-primary ep-btn-lg w-full mt-6" [disabled]="loading">
              @if (loading) {
                <span class="animate-spin">⟳</span> Creating account...
              } @else {
                Create Account
              }
            </button>
          </form>

          <p class="text-center mt-4 text-sm" style="color: var(--text-muted)">
            Already have an account?
            <a routerLink="/login" class="font-semibold ml-1" style="color: var(--primary)">Sign in →</a>
          </p>
        </div>

        <p class="text-center text-xs mt-4" style="color: var(--text-muted)">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  `,
})
export class SignupComponent {
  form = { name: '', email: '', password: '', confirmPassword: '', mobile: '' };
  loading = false;
  showPassword = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router, private toast: ToastService) {}

  onSignup(): void {
    this.errorMsg = '';
    if (!this.form.name || !this.form.email || !this.form.password) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.errorMsg = 'Passwords do not match.';
      return;
    }
    if (this.form.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters.';
      return;
    }

    this.loading = true;
    this.authService.register({
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      mobile: this.form.mobile || undefined,
    }).subscribe({
      next: (res: any) => {
        this.toast.success('Account created! Please verify your email.');
        this.router.navigate(['/verify-email'], { queryParams: { userId: res.userId } });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Signup failed. Please try again.';
      },
    });
  }
}
