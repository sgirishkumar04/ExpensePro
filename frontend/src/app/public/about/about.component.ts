import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="background: var(--bg-primary); color: var(--text-primary); min-height: 100vh">
      <!-- Header -->
      <div class="py-5 px-6 flex items-center justify-between border-b" style="border-color: var(--border-color); background: var(--bg-secondary)">
        <a routerLink="/" class="flex items-center gap-2 no-underline">
          <span class="text-2xl">💰</span><span class="font-extrabold text-xl" style="color: var(--text-primary)">ExpensePro</span>
        </a>
        <a routerLink="/signup" class="ep-btn-primary ep-btn-sm">Get Started</a>
      </div>

      <div class="max-w-4xl mx-auto px-6 py-16">
        <div class="text-center mb-14">
          <div class="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">💰</div>
          <h1 class="text-5xl font-extrabold mb-4" style="color: var(--text-primary)">About ExpensePro</h1>
          <p class="text-xl leading-relaxed" style="color: var(--text-muted)">Your personal finance companion, built to make money management simple and insightful.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div class="ep-card">
            <h2 class="text-2xl font-bold mb-3" style="color: var(--text-primary)">🎯 Our Mission</h2>
            <p class="leading-relaxed" style="color: var(--text-secondary)">
              We believe everyone deserves access to powerful personal finance tools — completely free.
              ExpensePro was built to help individuals track their spending, understand their financial patterns,
              and make smarter decisions about their money.
            </p>
          </div>
          <div class="ep-card">
            <h2 class="text-2xl font-bold mb-3" style="color: var(--text-primary)">🔒 Privacy First</h2>
            <p class="leading-relaxed" style="color: var(--text-secondary)">
              Your financial data is your own. We use industry-standard encryption and JWT authentication
              to ensure your information is secure. We never sell your data to third parties.
            </p>
          </div>
        </div>

        <div class="ep-card mb-8">
          <h2 class="text-2xl font-bold mb-6" style="color: var(--text-primary)">🛠️ Built With</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            @for (tech of techStack; track tech.name) {
              <div class="text-center p-4 rounded-xl" style="background: var(--bg-secondary)">
                <span class="text-3xl block mb-2">{{ tech.icon }}</span>
                <p class="font-semibold text-sm" style="color: var(--text-primary)">{{ tech.name }}</p>
              </div>
            }
          </div>
        </div>

        <div class="text-center">
          <a routerLink="/signup" class="ep-btn-primary ep-btn-lg">Start for Free →</a>
        </div>
      </div>
    </div>
  `,
  styles: [` a { text-decoration: none; } `]
})
export class AboutComponent {
  techStack = [
    { icon: '🅰️', name: 'Angular 17' },
    { icon: '💨', name: 'Tailwind CSS' },
    { icon: '🟢', name: 'Node.js' },
    { icon: '🍃', name: 'MongoDB' },
  ];
}
