import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LayoutComponent } from '../shared/layout/layout.component';
import { ReportService } from '../services/report.service';
import { AuthService } from '../services/auth.service';
import { YearlyReport, MonthlyReport } from '../models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule, LayoutComponent, CurrencyPipe, DatePipe],
  template: `
    <app-layout pageTitle="Reports">
      <div class="ep-page-header">
        <div>
          <h1 class="ep-page-title">📈 Reports & Analytics</h1>
          <p class="ep-page-subtitle">Deep insights into your financial data</p>
        </div>
        <!-- Period Selector -->
        <div class="flex items-center gap-2">
          <select class="ep-select w-auto" [(ngModel)]="selectedYear" (change)="onYearChange()">
            @for (y of years; track y) { <option [value]="y">{{ y }}</option> }
          </select>
          <select class="ep-select w-auto" [(ngModel)]="selectedMonth" (change)="onMonthChange()">
            <option value="0">Full Year</option>
            @for (m of months; track m.value) { <option [value]="m.value">{{ m.label }}</option> }
          </select>
        </div>
      </div>

      @if (loading) {
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          @for (i of [1,2,3,4]; track i) { <div class="ep-card"><div class="ep-skeleton h-16"></div></div> }
        </div>
      }

      @if (yearlyReport && !loading) {
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6 animate-fade-in">
          <div class="ep-stat-card">
            <div class="ep-stat-icon" style="background: linear-gradient(135deg, #10b981, #059669)">💰</div>
            <div>
              <p class="ep-stat-label">Total Income</p>
              <p class="ep-stat-value">{{ yearlyReport.totals.income | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</p>
            </div>
          </div>
          <div class="ep-stat-card">
            <div class="ep-stat-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626)">💸</div>
            <div>
              <p class="ep-stat-label">Total Expenses</p>
              <p class="ep-stat-value">{{ yearlyReport.totals.expenses | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</p>
            </div>
          </div>
          <div class="ep-stat-card">
            <div class="ep-stat-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">🏦</div>
            <div>
              <p class="ep-stat-label">Net Savings</p>
              <p class="ep-stat-value" [class.text-emerald-500]="yearlyReport.totals.savings >= 0" [class.text-red-500]="yearlyReport.totals.savings < 0">
                {{ yearlyReport.totals.savings | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}
              </p>
            </div>
          </div>
          <div class="ep-stat-card">
            <div class="ep-stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">📅</div>
            <div>
              <p class="ep-stat-label">Avg. Monthly</p>
              <p class="ep-stat-value">{{ yearlyReport.avgMonthlyExpense | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</p>
            </div>
          </div>
        </div>

        <!-- Charts Row 1 -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
          <!-- Monthly Bar Chart -->
          <div class="ep-card">
            <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">📊 Monthly Breakdown</h3>
            <apx-chart
              [series]="barSeries"
              [chart]="barChart"
              [xaxis]="barXaxis"
              [yaxis]="barYaxis"
              [colors]="['#10b981', '#ef4444', '#f59e0b']"
              [legend]="{ position: 'top', fontSize: '12px' }"
              [plotOptions]="{ bar: { borderRadius: 4, columnWidth: '60%' } }"
              [grid]="{ borderColor: '#e2e8f0', strokeDashArray: 4 }"
              [dataLabels]="{ enabled: false }"
              [tooltip]="chartTooltip"
            ></apx-chart>
          </div>

          <!-- Line Chart -->
          <div class="ep-card">
            <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">📈 Income vs Expenses</h3>
            <apx-chart
              [series]="lineSeries"
              [chart]="lineChart"
              [xaxis]="lineXaxis"
              [yaxis]="barYaxis"
              [colors]="['#10b981', '#ef4444']"
              [stroke]="{ curve: 'smooth', width: 3 }"
              [markers]="{ size: 5 }"
              [legend]="{ position: 'top', fontSize: '12px' }"
              [grid]="{ borderColor: '#e2e8f0', strokeDashArray: 4 }"
              [tooltip]="chartTooltip"
            ></apx-chart>
          </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
          <!-- Category Donut -->
          <div class="ep-card xl:col-span-1">
            <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">🏷️ Category Split</h3>
            @if (yearlyReport.categoryBreakdown.length > 0) {
              <apx-chart
                [series]="catSeries"
                [chart]="{ type: 'donut', height: 260 }"
                [labels]="catLabels"
                [colors]="catColors"
                [legend]="{ position: 'bottom', fontSize: '11px' }"
                [dataLabels]="{ enabled: false }"
                [plotOptions]="{ pie: { donut: { size: '65%' } } }"
                [tooltip]="chartTooltip"
              ></apx-chart>
            } @else {
              <div class="ep-empty py-12">No data available</div>
            }
          </div>

          <!-- Top 5 categories table -->
          <div class="ep-card xl:col-span-2">
            <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">🏆 Top Spending Categories</h3>
            @if (yearlyReport.categoryBreakdown.length > 0) {
              <div class="space-y-3">
                @for (cat of yearlyReport.categoryBreakdown.slice(0,5); track cat._id; let i = $index) {
                  <div class="flex items-center gap-3">
                    <span class="text-lg flex-shrink-0 w-8 text-center">{{ cat.icon }}</span>
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-semibold" style="color: var(--text-primary)">{{ cat.name }}</span>
                        <span class="text-sm font-bold" style="color: var(--text-primary)">{{ cat.total | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</span>
                      </div>
                      <div class="w-full h-2 rounded-full" style="background: var(--border-color)">
                        <div class="h-2 rounded-full transition-all duration-700"
                          [style.width]="getPercent(cat.total) + '%'"
                          [style.background]="cat.color">
                        </div>
                      </div>
                    </div>
                    <span class="text-xs font-medium w-12 text-right" style="color: var(--text-muted)">{{ getPercent(cat.total) | number:'1.0-0' }}%</span>
                  </div>
                }
              </div>
            } @else {
              <div class="ep-empty py-8">No data available</div>
            }
          </div>
        </div>

        <!-- Insights -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="ep-card" style="border-left: 4px solid #ef4444">
            <p class="text-xs font-semibold uppercase tracking-wider mb-2" style="color: var(--text-muted)">Highest Spending Month</p>
            <p class="text-lg font-bold" style="color: var(--text-primary)">{{ yearlyReport.highestExpenseMonth.monthName }}</p>
            <p class="font-bold text-red-500">{{ yearlyReport.highestExpenseMonth.expenses | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</p>
          </div>
          <div class="ep-card" style="border-left: 4px solid #10b981">
            <p class="text-xs font-semibold uppercase tracking-wider mb-2" style="color: var(--text-muted)">Lowest Spending Month</p>
            <p class="text-lg font-bold" style="color: var(--text-primary)">{{ yearlyReport.lowestExpenseMonth.monthName }}</p>
            <p class="font-bold text-emerald-500">{{ yearlyReport.lowestExpenseMonth.expenses | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</p>
          </div>
          <div class="ep-card" style="border-left: 4px solid #6366f1">
            <p class="text-xs font-semibold uppercase tracking-wider mb-2" style="color: var(--text-muted)">Avg. Monthly Savings</p>
            <p class="text-lg font-bold" style="color: var(--text-primary)">Per Month</p>
            <p class="font-bold" [class.text-emerald-500]="yearlyReport.avgMonthlySavings >= 0" [class.text-red-500]="yearlyReport.avgMonthlySavings < 0">
              {{ yearlyReport.avgMonthlySavings | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}
            </p>
          </div>
        </div>
      }
    </app-layout>
  `,
})
export class ReportsComponent implements OnInit {
  yearlyReport: YearlyReport | null = null;
  loading = true;
  selectedYear = new Date().getFullYear();
  selectedMonth = 0;

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  barSeries: any[] = [];
  lineSeries: any[] = [];
  monthLabels: string[] = [];
  catSeries: number[] = [];
  catLabels: string[] = [];
  catColors: string[] = [];
  maxCatTotal = 0;

  // Chart config objects (arrow functions must be here, not in templates)
  readonly chartTooltip = { y: { formatter: (v: number) => '₹' + v.toLocaleString('en-IN') } };
  readonly barChart: any = { type: 'bar', height: 280, toolbar: { show: false }, zoom: { enabled: false } };
  readonly lineChart: any = { type: 'line', height: 280, toolbar: { show: false }, zoom: { enabled: false } };
  readonly barYaxis = { labels: { style: { colors: '#94a3b8', fontSize: '11px' }, formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v) } };
  barXaxis: any = { categories: [], labels: { style: { colors: '#94a3b8', fontSize: '11px' } } };
  lineXaxis: any = { categories: [], labels: { style: { colors: '#94a3b8', fontSize: '11px' } } };

  get user() { return this.authService.user(); }

  constructor(private reportService: ReportService, public authService: AuthService) {}

  ngOnInit(): void { this.loadYearlyReport(); }

  onYearChange(): void { this.loadYearlyReport(); }
  onMonthChange(): void { if (this.selectedMonth > 0) this.loadMonthlyReport(); else this.loadYearlyReport(); }

  loadYearlyReport(): void {
    this.loading = true;
    this.reportService.getYearlyReport(this.selectedYear).subscribe({
      next: (res) => {
        this.yearlyReport = res.report;
        this.buildCharts();
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  loadMonthlyReport(): void {
    this.loading = true;
    this.reportService.getMonthlyReport(this.selectedYear, this.selectedMonth).subscribe({
      next: (res) => {
        const m = res.report;
        this.yearlyReport = {
          year: m.year, avgMonthlySavings: m.savings, avgMonthlyExpense: m.totalExpenses,
          totals: { income: m.totalIncome, expenses: m.totalExpenses, transfers: m.totalTransfers, savings: m.savings },
          monthlyData: [], categoryBreakdown: m.categoryBreakdown,
          highestExpenseMonth: {} as any, lowestExpenseMonth: {} as any,
        };
        this.buildCategoryCharts();
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  buildCharts(): void {
    if (!this.yearlyReport) return;
    this.monthLabels = this.yearlyReport.monthlyData.map(m => m.monthName);
    this.barXaxis = { categories: this.monthLabels, labels: { style: { colors: '#94a3b8', fontSize: '11px' } } };
    this.lineXaxis = { categories: this.monthLabels, labels: { style: { colors: '#94a3b8', fontSize: '11px' } } };
    this.barSeries = [
      { name: 'Income', data: this.yearlyReport.monthlyData.map(m => m.income) },
      { name: 'Expenses', data: this.yearlyReport.monthlyData.map(m => m.expenses) },
      { name: 'Transfers', data: this.yearlyReport.monthlyData.map(m => m.transfers) },
    ];
    this.lineSeries = [
      { name: 'Income', data: this.yearlyReport.monthlyData.map(m => m.income) },
      { name: 'Expenses', data: this.yearlyReport.monthlyData.map(m => m.expenses) },
    ];
    this.buildCategoryCharts();
  }

  buildCategoryCharts(): void {
    if (!this.yearlyReport) return;
    this.catLabels = this.yearlyReport.categoryBreakdown.map(c => c.name);
    this.catSeries = this.yearlyReport.categoryBreakdown.map(c => c.total);
    this.catColors = this.yearlyReport.categoryBreakdown.map(c => c.color);
    this.maxCatTotal = Math.max(...this.catSeries, 1);
  }

  getPercent(total: number): number {
    return Math.round((total / this.maxCatTotal) * 100);
  }
}
