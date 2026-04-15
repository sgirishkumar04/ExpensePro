import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LayoutComponent } from '../shared/layout/layout.component';
import { DashboardService } from '../services/dashboard.service';
import { AuthService } from '../services/auth.service';
import { DashboardData } from '../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgApexchartsModule, LayoutComponent, CurrencyPipe, DatePipe],
  template: `
    <app-layout pageTitle="Dashboard">
      @if (loading) {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          @for (i of [1,2,3,4]; track i) {
            <div class="ep-card"><div class="ep-skeleton h-20 w-full"></div></div>
          }
        </div>
      } @else if (data) {
        <!-- Greeting -->
        <div class="mb-6">
          <h2 class="text-2xl font-extrabold" style="color: var(--text-primary)">
            Good {{ greeting }}, {{ getFirstName() }} 👋
          </h2>
          <p class="text-sm mt-1" style="color: var(--text-muted)">Here's your financial overview for {{ currentMonthLabel }}</p>
        </div>

        <!-- Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <div class="ep-stat-card animate-slide-up">
            <div class="ep-stat-icon" style="background: linear-gradient(135deg, #10b981, #059669)">💵</div>
            <div>
              <p class="ep-stat-label">Total Income</p>
              <p class="ep-stat-value">{{ data.totalIncome | currency:(user?.currency || 'INR'):'symbol':'1.0-0' }}</p>
              <p class="ep-stat-change text-emerald-500">↑ This month</p>
            </div>
          </div>
          <div class="ep-stat-card animate-slide-up" style="animation-delay: 0.05s">
            <div class="ep-stat-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626)">💸</div>
            <div>
              <p class="ep-stat-label">Total Expenses</p>
              <p class="ep-stat-value">{{ data.totalExpenses | currency:(user?.currency || 'INR'):'symbol':'1.0-0' }}</p>
              <p class="ep-stat-change text-red-500">↓ This month</p>
            </div>
          </div>
          <div class="ep-stat-card animate-slide-up" style="animation-delay: 0.1s">
            <div class="ep-stat-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">🏦</div>
            <div>
              <p class="ep-stat-label">Total Savings</p>
              <p class="ep-stat-value" [class.text-emerald-500]="data.savings >= 0" [class.text-red-500]="data.savings < 0">
                {{ data.savings | currency:(user?.currency || 'INR'):'symbol':'1.0-0' }}
              </p>
              <p class="ep-stat-change" style="color: var(--text-muted)">Income − Expenses</p>
            </div>
          </div>
          <div class="ep-stat-card animate-slide-up" style="animation-delay: 0.15s">
            <div class="ep-stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">📤</div>
            <div>
              <p class="ep-stat-label">Money Sent</p>
              <p class="ep-stat-value">{{ data.totalTransfers | currency:(user?.currency || 'INR'):'symbol':'1.0-0' }}</p>
              <p class="ep-stat-change" style="color: var(--text-muted)">Transfers</p>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
          <!-- Monthly Trend -->
          <div class="xl:col-span-2 ep-card">
            <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">📊 Monthly Trend</h3>
            <apx-chart
              [series]="trendSeries"
              [chart]="trendChart"
              [xaxis]="trendXaxis"
              [yaxis]="trendYaxis"
              [colors]="['#10b981', '#ef4444', '#f59e0b']"
              [stroke]="{ curve: 'smooth', width: 2.5 }"
              [fill]="{ type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05 } }"
              [legend]="{ position: 'top', horizontalAlign: 'right', fontSize: '12px' }"
              [grid]="{ borderColor: '#e2e8f0', strokeDashArray: 4, xaxis: { lines: { show: false } } }"
              [tooltip]="chartTooltip"
            ></apx-chart>
          </div>

          <!-- Category Pie -->
          <div class="ep-card">
            <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">🏷️ By Category</h3>
            @if (data.categoryBreakdown.length > 0) {
              <apx-chart
                [series]="catSeries"
                [chart]="{ type: 'donut', height: 220 }"
                [labels]="catLabels"
                [colors]="catColors"
                [legend]="{ position: 'bottom', fontSize: '11px' }"
                [plotOptions]="{ pie: { donut: { size: '60%' } } }"
                [tooltip]="chartTooltip"
                [dataLabels]="{ enabled: false }"
              ></apx-chart>
            } @else {
              <div class="ep-empty"><span class="text-4xl mb-2">📭</span><p>No data yet</p></div>
            }
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <!-- Recent Transactions -->
          <div class="xl:col-span-2 ep-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-lg" style="color: var(--text-primary)">🕐 Recent Transactions</h3>
              <a routerLink="/expenses" class="text-sm font-semibold" style="color: var(--primary)">View all →</a>
            </div>
            @if (data.recentTransactions.length > 0) {
              <div class="space-y-3">
                @for (tx of data.recentTransactions; track tx._id) {
                  <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      [style.background]="getTransactionColor(tx)">
                      {{ getTransactionIcon(tx) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-sm truncate" style="color: var(--text-primary)">
                        {{ getTxLabel(tx) }}
                      </p>
                      <p class="text-xs" style="color: var(--text-muted)">{{ tx.date | date:'dd MMM yyyy' }}</p>
                    </div>
                    <span class="font-bold text-sm" [class.text-emerald-500]="isIncome(tx)" [class.text-red-500]="!isIncome(tx)">
                      {{ isIncome(tx) ? '+' : '−' }}{{ tx.amount | currency:(user?.currency || 'INR'):'symbol':'1.0-0' }}
                    </span>
                  </div>
                }
              </div>
            } @else {
              <div class="ep-empty"><span class="text-4xl mb-2">📭</span><p>No transactions yet</p></div>
            }
          </div>

          <!-- Account Summary -->
          <div class="ep-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-lg" style="color: var(--text-primary)">🏦 Accounts</h3>
              <a routerLink="/accounts" class="text-sm font-semibold" style="color: var(--primary)">Manage →</a>
            </div>
            <!-- Total Balance -->
            <div class="rounded-2xl p-4 mb-4" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
              <p class="text-indigo-200 text-xs font-medium">Total Balance</p>
              <p class="text-white text-2xl font-extrabold mt-1">
                {{ data.totalBalance | currency:(user?.currency || 'INR'):'symbol':'1.0-0' }}
              </p>
              @if (data.highestAccount) {
                <p class="text-indigo-200 text-xs mt-2">Highest: {{ data.highestAccount.name }}</p>
              }
            </div>
            @if (data.accounts.length > 0) {
              <div class="space-y-3">
                @for (acc of data.accounts.slice(0, 4); track acc._id) {
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      [style.background]="acc.color + '20'" [style.color]="acc.color">
                      {{ getAccountIcon(acc.type) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-sm truncate" style="color: var(--text-primary)">{{ acc.name }}</p>
                      <p class="text-xs" style="color: var(--text-muted)">{{ acc.type }}</p>
                    </div>
                    <span class="font-bold text-sm" style="color: var(--text-primary)">
                      {{ acc.balance | currency:(user?.currency || 'INR'):'symbol':'1.0-0' }}
                    </span>
                  </div>
                }
              </div>
            } @else {
              <div class="ep-empty py-8"><span class="text-3xl mb-2">🏦</span><p class="text-sm">Add an account to get started</p></div>
            }
          </div>
        </div>
      }
    </app-layout>
  `,
})
export class DashboardComponent implements OnInit {
  data: DashboardData | null = null;
  loading = true;

  get user() { return this.authService.user(); }
  getFirstName() { return this.user?.name?.split(' ')[0] || ''; }
  get greeting() {
    const hour = new Date().getHours();
    return hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  }
  get currentMonthLabel() {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  trendSeries: any[] = [];
  trendLabels: string[] = [];
  catSeries: number[] = [];
  catLabels: string[] = [];
  catColors: string[] = [];

  // Arrow functions must be in class, not template
  readonly chartTooltip = { y: { formatter: (v: number) => '₹' + v.toLocaleString('en-IN') } };
  readonly trendChart: any = { type: 'area', height: 260, toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: true } };
  readonly trendYaxis = { labels: { style: { colors: '#94a3b8', fontSize: '11px' }, formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v) } };
  trendXaxis: any = { categories: [], labels: { style: { colors: '#94a3b8', fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } };

  constructor(private dashboardService: DashboardService, public authService: AuthService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.data = res.dashboard;
        this.buildCharts();
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  buildCharts(): void {
    if (!this.data) return;
    this.trendLabels = this.data.monthlyTrend.map(m => m.label);
    this.trendXaxis = { categories: this.trendLabels, labels: { style: { colors: '#94a3b8', fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } };
    this.trendSeries = [
      { name: 'Income', data: this.data.monthlyTrend.map(m => m.income) },
      { name: 'Expenses', data: this.data.monthlyTrend.map(m => m.expenses) },
      { name: 'Transfers', data: this.data.monthlyTrend.map(m => m.transfers) },
    ];
    this.catLabels = this.data.categoryBreakdown.map(c => c.name);
    this.catSeries = this.data.categoryBreakdown.map(c => c.total);
    this.catColors = this.data.categoryBreakdown.map(c => c.color);
  }

  isIncome(tx: any): boolean { return 'source' in tx; }
  getTxLabel(tx: any): string { return tx.title || tx.source || 'Transaction'; }
  getTransactionIcon(tx: any): string { return this.isIncome(tx) ? '💵' : tx.category?.icon || '💸'; }
  getTransactionColor(tx: any): string { return this.isIncome(tx) ? '#d1fae5' : '#fee2e2'; }
  getAccountIcon(type: string): string {
    const icons: Record<string, string> = { 'Bank Account': '🏦', 'Cash Wallet': '💵', 'Credit Card': '💳', 'Debit Card': '💳', 'UPI Wallet': '📱', 'Savings Account': '🐷', 'Investment Account': '📈' };
    return icons[type] || '💰';
  }
}
