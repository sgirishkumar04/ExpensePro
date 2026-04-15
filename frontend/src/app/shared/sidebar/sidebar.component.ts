import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="ep-sidebar h-full flex flex-col" [class.w-64]="!collapsed" [class.w-16]="collapsed">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div class="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">💰</div>
        @if (!collapsed) {
          <span class="text-white font-bold text-lg tracking-tight animate-fade-in">ExpensePro</span>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4 space-y-1">
        @for (item of navItems; track item.route) {
          <a
            [href]="item.route"
            (click)="navigate($event, item.route)"
            class="ep-sidebar-link"
            [class.active]="isActive(item.route)"
          >
            <span class="text-xl flex-shrink-0" [title]="item.label">{{ item.icon }}</span>
            @if (!collapsed) {
              <span class="animate-fade-in">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- Bottom actions -->
      <div class="py-4 border-t border-white/10 space-y-1">
        <a
          href="/profile"
          (click)="navigate($event, '/profile')"
          class="ep-sidebar-link"
          [class.active]="isActive('/profile')"
        >
          <span class="text-xl flex-shrink-0">👤</span>
          @if (!collapsed) { <span>Profile</span> }
        </a>
        <a
          href="/settings"
          (click)="navigate($event, '/settings')"
          class="ep-sidebar-link"
          [class.active]="isActive('/settings')"
        >
          <span class="text-xl flex-shrink-0">⚙️</span>
          @if (!collapsed) { <span>Settings</span> }
        </a>
        <button class="ep-sidebar-link w-full text-left" (click)="logout.emit()">
          <span class="text-xl flex-shrink-0">🚪</span>
          @if (!collapsed) { <span>Logout</span> }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .ep-sidebar { transition: width 0.3s ease; overflow: hidden; }
    a { text-decoration: none; }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() logout = new EventEmitter<void>();

  navItems = [
    { icon: '📊', label: 'Dashboard', route: '/dashboard' },
    { icon: '💸', label: 'Expenses', route: '/expenses' },
    { icon: '💵', label: 'Income', route: '/income' },
    { icon: '📤', label: 'Money Sent', route: '/money-sent' },
    { icon: '📈', label: 'Reports', route: '/reports' },
    { icon: '🏦', label: 'Accounts', route: '/accounts' },
    { icon: '🏷️', label: 'Categories', route: '/categories' },
  ];

  isActive(route: string): boolean {
    return window.location.pathname === route;
  }

  navigate(event: Event, route: string): void {
    event.preventDefault();
    window.history.pushState({}, '', route);
    window.dispatchEvent(new PopStateEvent('popstate'));
    // Use Angular Router via event
    const routerEvent = new CustomEvent('ep-navigate', { detail: { route } });
    document.dispatchEvent(routerEvent);
  }
}
