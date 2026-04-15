import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--bg-primary)">
      <div class="w-full max-w-md animate-slide-up text-center">
        <div class="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6"
          style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">📧</div>
        <h1 class="text-3xl font-extrabold mb-2" style="color: var(--text-primary)">Verify your email</h1>
        <p class="text-sm mb-8" style="color: var(--text-muted)">
          We sent a 6-digit code to your email address.<br>Enter it below to verify your account.
        </p>

        <div class="ep-card">
          <!-- OTP Inputs -->
          <div class="flex gap-3 justify-center mb-6">
            @for (i of [0,1,2,3,4,5]; track i) {
              <input
                [id]="'otp-' + i"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all"
                style="background: var(--bg-secondary); border-color: var(--border-color); color: var(--text-primary)"
                [(ngModel)]="otpDigits[i]"
                (input)="onOtpInput($event, i)"
                (keydown)="onOtpKeydown($event, i)"
                (paste)="onPaste($event)"
              >
            }
          </div>

          @if (errorMsg) {
            <div class="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
              ⚠️ {{ errorMsg }}
            </div>
          }

          <button class="ep-btn-primary ep-btn-lg w-full" (click)="onVerify()" [disabled]="loading">
            @if (loading) { <span class="animate-spin">⟳</span> Verifying... }
            @else { Verify Email ✓ }
          </button>

          <div class="mt-4 text-sm" style="color: var(--text-muted)">
            Didn't receive the code?
            <button class="font-semibold ml-1" style="color: var(--primary)"
              (click)="resendOTP()" [disabled]="resendCooldown > 0">
              {{ resendCooldown > 0 ? 'Resend in ' + resendCooldown + 's' : 'Resend OTP' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class VerifyEmailComponent implements OnInit {
  userId = '';
  otpDigits = ['', '', '', '', '', ''];
  loading = false;
  errorMsg = '';
  resendCooldown = 0;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] || '';
    });
  }

  get otp(): string { return this.otpDigits.join(''); }

  onOtpInput(event: any, index: number): void {
    const value = event.target.value.replace(/\D/g, '');
    this.otpDigits[index] = value.slice(-1);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (this.otp.length === 6) this.onVerify();
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || '';
    text.split('').forEach((char, i) => { if (i < 6) this.otpDigits[i] = char; });
    if (this.otp.length === 6) setTimeout(() => this.onVerify(), 100);
  }

  onVerify(): void {
    if (this.otp.length !== 6) { this.errorMsg = 'Please enter the complete 6-digit OTP.'; return; }
    this.loading = true;
    this.errorMsg = '';
    this.authService.verifyEmail({ userId: this.userId, otp: this.otp }).subscribe({
      next: () => {
        this.toast.success('Email verified! Welcome to ExpensePro 🎉');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Verification failed.';
      },
    });
  }

  resendOTP(): void {
    this.authService.resendOTP(this.userId).subscribe({
      next: () => {
        this.toast.success('OTP resent! Check your email.');
        this.resendCooldown = 60;
        const interval = setInterval(() => {
          this.resendCooldown--;
          if (this.resendCooldown <= 0) clearInterval(interval);
        }, 1000);
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to resend OTP.'),
    });
  }
}
