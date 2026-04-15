import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="background: var(--bg-primary); color: var(--text-primary)" class="min-h-screen">

      <!-- Navigation -->
      <nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between" style="background: rgba(15,23,42,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.08)">
        <div class="flex items-center gap-2">
          <span class="text-2xl">💰</span>
          <span class="text-white font-extrabold text-xl">ExpensePro</span>
        </div>
        <div class="hidden md:flex items-center gap-8">
          @for (link of navLinks; track link.label) {
            <a [href]="link.href" class="text-sm font-medium text-indigo-200 hover:text-white transition-colors">{{ link.label }}</a>
          }
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="/login" class="ep-btn text-indigo-200 hover:text-white text-sm">Sign In</a>
          <a routerLink="/signup" class="ep-btn-primary ep-btn-sm">Get Started Free →</a>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="min-h-screen flex items-center justify-center px-6 pt-24 pb-16 relative overflow-hidden"
        style="background: linear-gradient(to bottom, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)">
        <!-- Animated blobs -->
        <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse-subtle" style="background: radial-gradient(circle, #6366f1, transparent)"></div>
        <div class="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse-subtle" style="background: radial-gradient(circle, #8b5cf6, transparent); animation-delay: 1s"></div>

        <div class="text-center max-w-4xl mx-auto relative z-10">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold animate-fade-in"
            style="background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc">
            🚀 Free forever · No credit card required
          </div>
          <h1 class="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-slide-up">
            <span class="text-white">Track Every</span><br>
            <span class="ep-gradient-text">Rupee You Spend</span>
          </h1>
          <p class="text-xl text-indigo-200 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style="animation-delay: 0.1s">
            ExpensePro helps you manage expenses, income, and savings with powerful insights,
            beautiful charts, and smart financial tracking — all completely free.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style="animation-delay: 0.2s">
            <a routerLink="/signup" class="ep-btn-primary ep-btn-lg px-10">Start Tracking Free →</a>
            <a routerLink="/login" class="ep-btn-lg px-10 rounded-xl font-semibold" style="background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.2)">
              Sign In
            </a>
          </div>

          <!-- Stats row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-16 border-t border-white/10 animate-fade-in" style="animation-delay: 0.3s">
            @for (stat of heroStats; track stat.label) {
              <div class="text-center">
                <p class="text-3xl font-extrabold text-white">{{ stat.value }}</p>
                <p class="text-sm text-indigo-300 mt-1">{{ stat.label }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 px-6" style="background: var(--bg-primary)">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-14">
            <h2 class="text-4xl font-extrabold mb-4" style="color: var(--text-primary)">Everything you need to <span class="ep-gradient-text">master your money</span></h2>
            <p class="text-lg max-w-2xl mx-auto" style="color: var(--text-muted)">Powerful features designed to give you complete control over your personal finances.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (feature of features; track feature.icon) {
              <div class="ep-card group cursor-default">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4" [style.background]="feature.color + '20'">{{ feature.icon }}</div>
                <h3 class="font-bold text-lg mb-2" style="color: var(--text-primary)">{{ feature.title }}</h3>
                <p class="text-sm leading-relaxed" style="color: var(--text-muted)">{{ feature.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="py-20 px-6" style="background: var(--bg-secondary)">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-4xl font-extrabold mb-4" style="color: var(--text-primary)">Get started in <span class="ep-gradient-text">3 simple steps</span></h2>
          <p class="text-lg mb-14" style="color: var(--text-muted)">No complicated setup. No credit card. Just sign up and start tracking.</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @for (step of steps; track step.num) {
              <div class="text-center">
                <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-4"
                  style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white">{{ step.num }}</div>
                <h3 class="font-extrabold text-xl mb-2" style="color: var(--text-primary)">{{ step.title }}</h3>
                <p class="text-sm" style="color: var(--text-muted)">{{ step.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 px-6" style="background: linear-gradient(135deg, #1e1b4b, #4338ca)">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-4xl font-extrabold text-white mb-4">Ready to take control of your finances?</h2>
          <p class="text-indigo-200 text-lg mb-8">Join thousands of users who track their money smarter with ExpensePro.</p>
          <a routerLink="/signup" class="ep-btn-primary ep-btn-lg px-10">Create Free Account →</a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-10 px-6" style="background: #0f172a; border-top: 1px solid rgba(255,255,255,0.08)">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">💰</span>
            <span class="text-white font-extrabold">ExpensePro</span>
          </div>
          <div class="flex gap-6">
            @for (link of footerLinks; track link.label) {
              <a [routerLink]="link.href" class="text-sm text-indigo-300 hover:text-white transition-colors">{{ link.label }}</a>
            }
          </div>
          <p class="text-sm text-indigo-400">© 2024 ExpensePro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    a { text-decoration: none; }
  `]
})
export class LandingComponent implements OnInit {
  navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ];

  heroStats = [
    { value: '...', label: 'Active Users' },
    { value: '...', label: 'Tracked' },
    { value: 'Priceless 💎', label: 'Community Love' },
    { value: '100%', label: 'Free' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/stats`).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.heroStats[0].value = `${res.users}`;
          this.heroStats[1].value = `₹${res.expensesAmount.toLocaleString()}`;
        }
      },
      error: () => {
         this.heroStats[0].value = '0';
         this.heroStats[1].value = '₹0';
      }
    });
  }

  features = [
    { icon: '📊', title: 'Smart Dashboard', desc: 'Get real-time insights with beautiful charts showing your income, expenses, and savings at a glance.', color: '#6366f1' },
    { icon: '💸', title: 'Expense Tracking', desc: 'Log expenses with categories, payment methods, notes, and receipt photos. Smart filters to find any transaction.', color: '#ef4444' },
    { icon: '💵', title: 'Income Management', desc: 'Track salary, freelance, bonuses, and side income from multiple sources with recurring income support.', color: '#10b981' },
    { icon: '🏦', title: 'Multi-Account', desc: 'Manage bank accounts, wallets, credit cards, and UPI accounts. Transfer money between accounts seamlessly.', color: '#f59e0b' },
    { icon: '📈', title: 'Reports & Charts', desc: 'Monthly and yearly reports with pie charts, bar charts, and trend lines. Export as PDF or Excel.', color: '#3b82f6' },
    { icon: '🏷️', title: 'Custom Categories', desc: 'Create your own expense categories with custom icons and colors. Organize spending your way.', color: '#ec4899' },
    { icon: '📤', title: 'Money Sent', desc: 'Track money sent to family, friends, EMI payments, loans, and bank transfers with full history.', color: '#8b5cf6' },
    { icon: '🌙', title: 'Dark Mode', desc: 'Beautiful dark and light themes that follow your system preference. Easy on your eyes, day and night.', color: '#14b8a6' },
    { icon: '📱', title: 'Mobile Friendly', desc: 'Fully responsive design that works perfectly on mobile, tablet, and desktop browsers.', color: '#f97316' },
  ];

  steps = [
    { num: '1', title: 'Create Account', desc: 'Sign up for free with your email. No credit card required.' },
    { num: '2', title: 'Add Transactions', desc: 'Log your daily expenses, income, and transfers in seconds.' },
    { num: '3', title: 'Get Insights', desc: 'View beautiful reports and make smarter financial decisions.' },
  ];

  footerLinks = [
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Login', href: '/login' },
  ];
}
