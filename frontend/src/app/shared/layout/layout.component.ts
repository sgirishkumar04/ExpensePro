import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  template: `
    <div class="ep-main-layout">
      <!-- Sidebar Overlay (mobile) -->
      @if (sidebarOpen && isMobile) {
        <div class="ep-sidebar-overlay" (click)="closeSidebar()"></div>
      }

      <!-- Sidebar -->
      <div
        class="flex-shrink-0 h-full transition-all duration-300 z-40"
        [class.fixed]="isMobile"
        [class.-translate-x-full]="isMobile && !sidebarOpen"
        [class.translate-x-0]="!isMobile || sidebarOpen"
      >
        <app-sidebar
          [collapsed]="sidebarCollapsed && !isMobile"
          (logout)="onLogout()"
        ></app-sidebar>
      </div>

      <!-- Main Content -->
      <div class="ep-content-area">
        <!-- Top Header -->
        <header class="sticky top-0 z-20 px-6 py-4 flex items-center justify-between border-b"
          style="background: var(--bg-secondary); border-color: var(--border-color);">
          <div class="flex items-center gap-3">
            <!-- Mobile menu toggle -->
            <button
              class="ep-btn-icon lg:hidden"
              (click)="toggleSidebar()"
            >☰</button>
            <!-- Desktop sidebar collapse -->
            <button
              class="ep-btn-icon hidden lg:flex"
              (click)="sidebarCollapsed = !sidebarCollapsed"
            >{{ sidebarCollapsed ? '→' : '←' }}</button>
            @if (pageTitle) {
              <h1 class="text-lg font-bold" style="color: var(--text-primary)">{{ pageTitle }}</h1>
            }
          </div>

          <div class="flex items-center gap-3">
            <!-- Dark mode toggle -->
            <button
              class="ep-btn-icon"
              (click)="themeService.toggleTheme()"
              [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
              {{ themeService.isDark() ? '☀️' : '🌙' }}
            </button>

            <!-- User avatar -->
            <div class="relative group">
              <button class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-card transition-colors">
                @if (user?.profilePicture) {
                  <img [src]="user?.profilePicture" alt="Profile" class="ep-avatar w-8 h-8">
                } @else {
                  <div class="ep-avatar w-8 h-8 text-sm">{{ getInitials() }}</div>
                }
                <span class="text-sm font-medium hidden sm:block" style="color: var(--text-primary)">{{ user?.name }}</span>
              </button>
              <!-- Dropdown -->
              <div class="absolute right-0 mt-2 w-48 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                style="background: var(--bg-card); border: 1px solid var(--border-color);">
                <a routerLink="/profile" class="flex items-center gap-2 px-4 py-3 text-sm rounded-t-xl hover:bg-gray-50 dark:hover:bg-dark-border" style="color: var(--text-primary)">
                  👤 My Profile
                </a>
                <a routerLink="/settings" class="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-dark-border" style="color: var(--text-primary)">
                  ⚙️ Settings
                </a>
                <div style="border-top: 1px solid var(--border-color)">
                  <button (click)="onLogout()" class="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full rounded-b-xl">
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="ep-page-container">
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .ep-avatar { display: flex; align-items: center; justify-content: center; }
  `]
})
export class LayoutComponent implements OnInit {
  @Input() pageTitle = '';

  sidebarCollapsed = false;
  sidebarOpen = false;
  isMobile = false;

  get user() { return this.authService.user(); }

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth < 1024;
    if (!this.isMobile) this.sidebarOpen = false;
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }

  getInitials(): string {
    const name = this.user?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
