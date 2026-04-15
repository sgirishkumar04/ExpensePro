import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../shared/layout/layout.component';
import { UserService } from '../services/user.service';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { User, Account } from '../models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent, DatePipe],
  template: `
    <app-layout pageTitle="Profile">
      <div class="max-w-4xl mx-auto">
        <h1 class="ep-page-title mb-6">👤 Profile</h1>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Profile Card -->
          <div class="ep-card text-center">
            <!-- Avatar -->
            <div class="relative inline-block mb-4">
              @if (user?.profilePicture) {
                <img [src]="user?.profilePicture" alt="Profile" class="w-24 h-24 rounded-full object-cover mx-auto border-4 border-primary-200">
              } @else {
                <div class="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto border-4 border-primary-200"
                  style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white">
                  {{ getInitials() }}
                </div>
              }
              <label class="absolute bottom-0 right-0 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center"
                style="background: var(--primary); color: white" for="avatar-input">📷</label>
              <input id="avatar-input" type="file" class="hidden" accept="image/*" (change)="onAvatarChange($event)">
            </div>
            <h2 class="text-xl font-bold" style="color: var(--text-primary)">{{ user?.name }}</h2>
            <p class="text-sm" style="color: var(--text-muted)">{{ user?.email }}</p>
            @if (user?.mobile) {
              <p class="text-sm mt-1" style="color: var(--text-muted)">📱 {{ user?.mobile }}</p>
            }
            <div class="mt-4 p-3 rounded-xl text-sm" style="background: var(--bg-secondary); border: 1px solid var(--border-color)">
              <p style="color: var(--text-muted)">Member since</p>
              <p class="font-semibold" style="color: var(--text-primary)">{{ user?.createdAt | date:'mediumDate' }}</p>
            </div>
          </div>

          <!-- Edit Profile Form -->
          <div class="lg:col-span-2 space-y-5">
            <div class="ep-card">
              <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">✏️ Edit Profile</h3>
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="ep-form-group">
                    <label class="ep-label">Full Name</label>
                    <input type="text" class="ep-input" [(ngModel)]="profileForm.name">
                  </div>
                  <div class="ep-form-group">
                    <label class="ep-label">Mobile Number</label>
                    <input type="tel" class="ep-input" [(ngModel)]="profileForm.mobile" placeholder="+91 98765 43210">
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="ep-form-group">
                    <label class="ep-label">Monthly Salary ({{ user?.currency }})</label>
                    <input type="number" class="ep-input" [(ngModel)]="profileForm.monthlySalary" min="0">
                  </div>
                  <div class="ep-form-group">
                    <label class="ep-label">Monthly Budget ({{ user?.currency }})</label>
                    <input type="number" class="ep-input" [(ngModel)]="profileForm.monthlyBudget" min="0">
                  </div>
                </div>
                <div class="ep-form-group">
                  <label class="ep-label">Preferred Currency</label>
                  <select class="ep-select" [(ngModel)]="profileForm.currency">
                    @for (c of currencies; track c.code) {
                      <option [value]="c.code">{{ c.flag }} {{ c.name }} ({{ c.code }})</option>
                    }
                  </select>
                </div>
              </div>
              <button class="ep-btn-primary mt-5" (click)="saveProfile()" [disabled]="savingProfile">
                @if (savingProfile) { <span class="animate-spin">⟳</span> } Save Changes
              </button>
            </div>

            <!-- Change Password -->
            <div class="ep-card">
              <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">🔒 Change Password</h3>
              <div class="space-y-4">
                <div class="ep-form-group">
                  <label class="ep-label">Current Password</label>
                  <input type="password" class="ep-input" [(ngModel)]="passwordForm.currentPassword">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="ep-form-group">
                    <label class="ep-label">New Password</label>
                    <input type="password" class="ep-input" [(ngModel)]="passwordForm.newPassword">
                  </div>
                  <div class="ep-form-group">
                    <label class="ep-label">Confirm New Password</label>
                    <input type="password" class="ep-input" [(ngModel)]="passwordForm.confirmPassword">
                  </div>
                </div>
              </div>
              @if (passwordError) {
                <div class="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">⚠️ {{ passwordError }}</div>
              }
              <button class="ep-btn-primary mt-5" (click)="changePassword()" [disabled]="savingPassword">
                @if (savingPassword) { <span class="animate-spin">⟳</span> } Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  savingProfile = false;
  savingPassword = false;
  passwordError = '';

  profileForm = { name: '', mobile: '', monthlySalary: 0, monthlyBudget: 0, currency: 'INR' };
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  currencies = [
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe(res => {
      this.user = res.user;
      this.profileForm = {
        name: res.user.name,
        mobile: res.user.mobile || '',
        monthlySalary: res.user.monthlySalary,
        monthlyBudget: res.user.monthlyBudget || 0,
        currency: res.user.currency,
      };
    });
  }

  getInitials(): string {
    return (this.user?.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.userService.uploadProfilePicture(file).subscribe({
      next: (res) => {
        if (this.user) this.user.profilePicture = res.profilePicture;
        this.toast.success('Profile picture updated!');
      },
      error: (err) => this.toast.error(err.error?.message || 'Upload failed.'),
    });
  }

  saveProfile(): void {
    this.savingProfile = true;
    this.userService.updateProfile(this.profileForm).subscribe({
      next: (res) => {
        this.user = res.user;
        this.toast.success('Profile updated!');
        this.savingProfile = false;
      },
      error: (err) => { this.savingProfile = false; this.toast.error(err.error?.message || 'Failed.'); },
    });
  }

  changePassword(): void {
    this.passwordError = '';
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) {
      this.passwordError = 'Please fill in all password fields.'; return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'Passwords do not match.'; return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters.'; return;
    }
    this.savingPassword = true;
    this.userService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword,
    }).subscribe({
      next: () => {
        this.toast.success('Password changed!');
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.savingPassword = false;
      },
      error: (err) => { this.savingPassword = false; this.passwordError = err.error?.message || 'Failed.'; },
    });
  }
}
