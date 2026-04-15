import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--bg-primary)">
      <div class="w-full max-w-md animate-slide-up">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style="background: linear-gradient(135deg, #ef4444, #dc2626)">🔑</div>
          <h1 class="text-3xl font-extrabold" style="color: var(--text-primary)">Forgot password?</h1>
          <p class="mt-2 text-sm" style="color: var(--text-muted)">Enter your email and we'll send you a reset code</p>
        </div>

        <div class="ep-card">
          <div class="ep-form-group mb-4">
            <label class="ep-label" for="email">Email Address</label>
            <input id="email" type="email" class="ep-input" placeholder="you@example.com"
              [(ngModel)]="email" name="email">
          </div>

          @if (errorMsg) {
            <div class="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">⚠️ {{ errorMsg }}</div>
          }

          <button class="ep-btn-primary ep-btn-lg w-full" (click)="onSubmit()" [disabled]="loading">
            @if (loading) { <span class="animate-spin">⟳</span> Sending... }
            @else { Send Reset Code }
          </button>

          <p class="text-center mt-4 text-sm" style="color: var(--text-muted)">
            Remember your password? <a routerLink="/login" class="font-semibold" style="color: var(--primary)"> Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router, private toast: ToastService) {}

  onSubmit(): void {
    if (!this.email) { this.errorMsg = 'Please enter your email.'; return; }
    this.loading = true;
    this.errorMsg = '';
    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.toast.success('Reset code sent! Check your email.');
        this.router.navigate(['/reset-password'], { queryParams: { userId: res.userId } });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Failed to send reset code.';
      },
    });
  }
}
