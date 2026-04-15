import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--bg-primary)">
      <div class="w-full max-w-md animate-slide-up">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style="background: linear-gradient(135deg, #10b981, #059669)">🔒</div>
          <h1 class="text-3xl font-extrabold" style="color: var(--text-primary)">Reset password</h1>
          <p class="mt-2 text-sm" style="color: var(--text-muted)">Enter the OTP and your new password</p>
        </div>
        <div class="ep-card space-y-4">
          <div class="ep-form-group">
            <label class="ep-label">OTP Code</label>
            <div class="flex gap-2 justify-center">
              @for (i of [0,1,2,3,4,5]; track i) {
                <input [id]="'rotp-' + i" type="text" inputmode="numeric" maxlength="1"
                  class="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none"
                  style="background: var(--bg-secondary); border-color: var(--border-color); color: var(--text-primary)"
                  [(ngModel)]="otpDigits[i]"
                  (input)="onOtpInput($event, i)"
                  (keydown)="onOtpKeydown($event, i)">
              }
            </div>
          </div>
          <div class="ep-form-group">
            <label class="ep-label">New Password</label>
            <div class="relative">
              <input [type]="showPassword ? 'text' : 'password'" class="ep-input pr-12" placeholder="Min. 6 characters"
                [(ngModel)]="newPassword">
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          <div class="ep-form-group">
            <label class="ep-label">Confirm New Password</label>
            <input [type]="showPassword ? 'text' : 'password'" class="ep-input" placeholder="Confirm password"
              [(ngModel)]="confirmPassword">
          </div>

          @if (errorMsg) {
            <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">⚠️ {{ errorMsg }}</div>
          }

          <button class="ep-btn-primary ep-btn-lg w-full" (click)="onReset()" [disabled]="loading">
            @if (loading) { <span class="animate-spin">⟳</span> Resetting... }
            @else { Reset Password }
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  userId = '';
  otpDigits = ['', '', '', '', '', ''];
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  loading = false;
  errorMsg = '';

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private toast: ToastService) {}
  ngOnInit(): void { this.route.queryParams.subscribe(p => this.userId = p['userId'] || ''); }
  get otp(): string { return this.otpDigits.join(''); }

  onOtpInput(event: any, index: number): void {
    this.otpDigits[index] = event.target.value.replace(/\D/g, '').slice(-1);
    if (event.target.value && index < 5) document.getElementById(`rotp-${index + 1}`)?.focus();
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0)
      document.getElementById(`rotp-${index - 1}`)?.focus();
  }

  onReset(): void {
    this.errorMsg = '';
    if (this.otp.length !== 6) { this.errorMsg = 'Enter the 6-digit OTP.'; return; }
    if (!this.newPassword || this.newPassword.length < 6) { this.errorMsg = 'Password must be at least 6 characters.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.errorMsg = 'Passwords do not match.'; return; }

    this.loading = true;
    this.authService.resetPassword({ userId: this.userId, otp: this.otp, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.toast.success('Password reset! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => { this.loading = false; this.errorMsg = err.error?.message || 'Reset failed.'; },
    });
  }
}
