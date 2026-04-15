import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../shared/layout/layout.component';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout pageTitle="Settings">
      <div class="max-w-2xl mx-auto">
        <h1 class="ep-page-title mb-6">⚙️ Settings</h1>

        <div class="space-y-5">
          <!-- Appearance -->
          <div class="ep-card">
            <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">🎨 Appearance</h3>
            <div class="flex items-center justify-between py-3 border-b" style="border-color: var(--border-color)">
              <div>
                <p class="font-semibold" style="color: var(--text-primary)">Dark Mode</p>
                <p class="text-sm" style="color: var(--text-muted)">Switch between light and dark themes</p>
              </div>
              <button
                class="relative w-12 h-6 rounded-full transition-all duration-300 outline-none"
                [style.background]="themeService.isDark() ? '#6366f1' : '#e2e8f0'"
                (click)="themeService.toggleTheme()"
              >
                <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                  [class.left-0.5]="!themeService.isDark()"
                  [class.left-6]="themeService.isDark()"></span>
              </button>
            </div>
          </div>

          <!-- Notifications -->
          <div class="ep-card">
            <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">🔔 Notifications</h3>
            @for (setting of notifSettings; track setting.key) {
              <div class="flex items-center justify-between py-3 border-b last:border-0" style="border-color: var(--border-color)">
                <div>
                  <p class="font-semibold" style="color: var(--text-primary)">{{ setting.label }}</p>
                  <p class="text-sm" style="color: var(--text-muted)">{{ setting.desc }}</p>
                </div>
                <button
                  class="relative w-12 h-6 rounded-full transition-all duration-300 outline-none"
                  [style.background]="setting.enabled ? '#6366f1' : '#e2e8f0'"
                  (click)="setting.enabled = !setting.enabled"
                >
                  <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                    [class.left-0.5]="!setting.enabled"
                    [class.left-6]="setting.enabled"></span>
                </button>
              </div>
            }
          </div>

          <!-- Data & Privacy -->
          <div class="ep-card">
            <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">🔒 Data & Privacy</h3>
            <div class="space-y-3">
              <button class="ep-btn-secondary w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl" (click)="exportData()">
                <span class="text-xl">📥</span>
                <div>
                  <p class="font-semibold" style="color: var(--text-primary)">Export My Data</p>
                  <p class="text-sm" style="color: var(--text-muted)">Download all your financial data as JSON</p>
                </div>
              </button>
              <button class="ep-btn-danger w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl" (click)="confirmDeleteAccount()">
                <span class="text-xl">⚠️</span>
                <div>
                  <p class="font-semibold">Delete Account</p>
                  <p class="text-sm opacity-80">Permanently delete your account and all data</p>
                </div>
              </button>
            </div>
          </div>

          <!-- About -->
          <div class="ep-card">
            <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">ℹ️ About ExpensePro</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><p style="color: var(--text-muted)">Version</p><p class="font-semibold" style="color: var(--text-primary)">1.0.0</p></div>
              <div><p style="color: var(--text-muted)">Build</p><p class="font-semibold" style="color: var(--text-primary)">2024.04</p></div>
              <div><p style="color: var(--text-muted)">Framework</p><p class="font-semibold" style="color: var(--text-primary)">Angular 17</p></div>
              <div><p style="color: var(--text-muted)">Database</p><p class="font-semibold" style="color: var(--text-primary)">MongoDB Atlas</p></div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
})
export class SettingsComponent {
  constructor(
    public themeService: ThemeService,
    private authService: AuthService,
    private userService: UserService,
    private toast: ToastService,
  ) {}

  notifSettings = [
    { key: 'monthly', label: 'Monthly Summary', desc: 'Receive monthly expense summary emails', enabled: true },
    { key: 'budget', label: 'Budget Alerts', desc: 'Notify when you exceed your monthly budget', enabled: true },
    { key: 'recurring', label: 'Recurring Reminders', desc: 'Remind about upcoming recurring expenses', enabled: false },
  ];

  exportData(): void {
    this.toast.info('Export feature coming soon!');
  }

  confirmDeleteAccount(): void {
    if (confirm('Are you sure? This action cannot be undone. All your data will be permanently deleted.')) {
      this.toast.info('Please contact support to delete your account.');
    }
  }
}
