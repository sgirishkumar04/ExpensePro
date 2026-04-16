import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../shared/layout/layout.component';
import { IncomeService } from '../services/income.service';
import { AccountService } from '../services/account.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { Income, Account, Pagination, IncomeFilters } from '../models';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent, CurrencyPipe, DatePipe],
  template: `
    <app-layout pageTitle="Income">
      <div class="ep-page-header">
        <div>
          <h1 class="ep-page-title">💵 Income</h1>
          <p class="ep-page-subtitle">Track all your income sources</p>
        </div>
        <button class="ep-btn-primary" (click)="openModal()">+ Add Income</button>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div class="ep-stat-card">
          <div class="ep-stat-icon" style="background: linear-gradient(135deg, #10b981, #059669)">💰</div>
          <div><p class="ep-stat-label">Total Income</p><p class="ep-stat-value">{{ totalIncome | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</p></div>
        </div>
        <div class="ep-stat-card">
          <div class="ep-stat-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">📋</div>
          <div><p class="ep-stat-label">Total Entries</p><p class="ep-stat-value">{{ pagination.total }}</p></div>
        </div>
        <div class="ep-stat-card">
          <div class="ep-stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">💼</div>
          <div><p class="ep-stat-label">Avg. Income</p><p class="ep-stat-value">{{ avgIncome | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</p></div>
        </div>
      </div>

      <!-- Filters -->
      <div class="ep-card mb-5">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" class="ep-input" placeholder="🔍 Search income..." [(ngModel)]="filters.search" (input)="onSearch()">
          <select class="ep-select" [(ngModel)]="filters.type" (change)="loadIncome()">
            <option value="">All Types</option>
            @for (t of incomeTypes; track t) { <option [value]="t">{{ t }}</option> }
          </select>
          <div class="flex gap-2">
            <input type="date" class="ep-input" [(ngModel)]="filters.startDate" (change)="loadIncome()">
            <input type="date" class="ep-input" [(ngModel)]="filters.endDate" (change)="loadIncome()">
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="ep-table-wrapper">
        @if (loading) {
          <div class="p-8 text-center" style="color: var(--text-muted)"><div class="animate-spin text-4xl mb-2">⟳</div></div>
        } @else if (incomes.length === 0) {
          <div class="ep-empty">
            <span class="text-5xl mb-3">💵</span>
            <p class="font-semibold text-lg" style="color: var(--text-primary)">No income records yet</p>
            <button class="ep-btn-primary mt-4" (click)="openModal()">+ Add Income</button>
          </div>
        } @else {
          <table class="ep-table">
            <thead><tr><th>Source</th><th>Type</th><th>Amount</th><th class="hide-mobile">Date</th><th class="hide-mobile">Account</th><th>Actions</th></tr></thead>
            <tbody>
              @for (inc of incomes; track inc._id) {
                <tr>
                  <td>
                    <div class="font-semibold" style="color: var(--text-primary)">{{ inc.source }}</div>
                    @if (inc.notes) { <div class="text-xs truncate max-w-xs" style="color: var(--text-muted)">{{ inc.notes }}</div> }
                  </td>
                  <td><span class="ep-badge-primary">{{ inc.type }}</span></td>
                  <td><span class="font-bold text-emerald-500">+{{ inc.amount | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</span></td>
                  <td class="text-sm hide-mobile" style="color: var(--text-muted)">{{ inc.date | date:'dd MMM yyyy' }}</td>
                  <td class="text-sm hide-mobile" style="color: var(--text-muted)">{{ inc.account?.name || '—' }}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="ep-btn-icon ep-btn-sm" (click)="openModal(inc)">✏️</button>
                      <button class="ep-btn-icon ep-btn-sm" (click)="deleteIncome(inc._id)">🗑️</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Pagination -->
      @if (pagination.pages > 1) {
        <div class="flex items-center justify-center gap-2 mt-5">
          <button class="ep-btn-secondary ep-btn-sm" [disabled]="pagination.page <= 1" (click)="changePage(pagination.page - 1)">← Prev</button>
          <span class="text-sm" style="color: var(--text-muted)">Page {{ pagination.page }} of {{ pagination.pages }}</span>
          <button class="ep-btn-secondary ep-btn-sm" [disabled]="pagination.page >= pagination.pages" (click)="changePage(pagination.page + 1)">Next →</button>
        </div>
      }

      <!-- Add/Edit Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5)">
          <div class="w-full max-w-lg ep-card animate-slide-up">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-xl font-bold" style="color: var(--text-primary)">{{ editingIncome ? 'Edit Income' : 'Add Income' }}</h2>
              <button class="ep-btn-icon" (click)="closeModal()">✕</button>
            </div>
            <div class="space-y-4">
              <div class="ep-form-group">
                <label class="ep-label">Source / Description *</label>
                <input type="text" class="ep-input" placeholder="e.g. Monthly Salary, Freelance Payment" [(ngModel)]="form.source">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="ep-form-group">
                  <label class="ep-label">Type</label>
                  <select class="ep-select" [(ngModel)]="form.type">
                    @for (t of incomeTypes; track t) { <option [value]="t">{{ t }}</option> }
                  </select>
                </div>
                <div class="ep-form-group">
                  <label class="ep-label">Amount *</label>
                  <input type="number" class="ep-input" placeholder="0.00" [(ngModel)]="form.amount" min="0.01">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="ep-form-group">
                  <label class="ep-label">Date *</label>
                  <input type="date" class="ep-input" [(ngModel)]="form.date">
                </div>
                <div class="ep-form-group">
                  <label class="ep-label">Account</label>
                  <select class="ep-select" [(ngModel)]="form.account">
                    <option value="">None</option>
                    @for (acc of accounts; track acc._id) { <option [value]="acc._id">{{ acc.name }}</option> }
                  </select>
                </div>
              </div>
              <div class="ep-form-group">
                <label class="ep-label">Notes</label>
                <textarea class="ep-textarea" placeholder="Additional notes..." [(ngModel)]="form.notes"></textarea>
              </div>
            </div>
            @if (formError) { <div class="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">⚠️ {{ formError }}</div> }
            <div class="flex gap-3 mt-6">
              <button class="ep-btn-secondary flex-1" (click)="closeModal()">Cancel</button>
              <button class="ep-btn-primary flex-1" (click)="saveIncome()" [disabled]="saving">
                @if (saving) { <span class="animate-spin">⟳</span> } {{ editingIncome ? 'Update' : 'Add Income' }}
              </button>
            </div>
          </div>
        </div>
      }
    </app-layout>
  `,
})
export class IncomeComponent implements OnInit {
  incomes: Income[] = [];
  accounts: Account[] = [];
  loading = true;
  saving = false;
  showModal = false;
  editingIncome: Income | null = null;
  formError = '';
  totalIncome = 0;
  avgIncome = 0;
  pagination: Pagination = { page: 1, limit: 10, total: 0, pages: 0 };
  filters: IncomeFilters = { page: 1, limit: 10 };
  form = { source: '', type: 'Salary', amount: 0, date: new Date().toISOString().split('T')[0], account: '', notes: '' };
  incomeTypes = ['Salary', 'Freelance', 'Business', 'Investment', 'Bonus', 'Gift', 'Rental', 'Side Income', 'Refund', 'Repayment', 'Other'];
  private searchTimer: any;

  get user() { return this.authService.user(); }

  constructor(private incomeService: IncomeService, private accountService: AccountService, private toast: ToastService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadIncome();
    this.accountService.getAccounts().subscribe(r => this.accounts = r.accounts);
  }

  loadIncome(): void {
    this.loading = true;
    this.incomeService.getIncomeEntries(this.filters).subscribe({
      next: (res) => {
        this.incomes = res.incomes;
        this.pagination = res.pagination;
        this.totalIncome = this.incomes.reduce((s, i) => s + i.amount, 0);
        this.avgIncome = this.incomes.length ? this.totalIncome / this.incomes.length : 0;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => this.loadIncome(), 400); }
  changePage(page: number): void { this.filters.page = page; this.loadIncome(); }

  openModal(income?: Income): void {
    this.editingIncome = income || null;
    this.formError = '';
    this.form = income ? {
      source: income.source, type: income.type, amount: income.amount,
      date: new Date(income.date).toISOString().split('T')[0],
      account: (income.account as any)?._id || '', notes: income.notes || '',
    } : { source: '', type: 'Salary', amount: 0, date: new Date().toISOString().split('T')[0], account: '', notes: '' };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editingIncome = null; }

  saveIncome(): void {
    if (!this.form.source) { this.formError = 'Source is required.'; return; }
    if (!this.form.amount || this.form.amount <= 0) { this.formError = 'Enter a valid amount.'; return; }
    this.saving = true;
    const payload: any = { ...this.form, account: this.form.account || undefined };
    const obs = this.editingIncome
      ? this.incomeService.updateIncome(this.editingIncome._id, payload)
      : this.incomeService.createIncome(payload);
    obs.subscribe({
      next: () => { this.toast.success(this.editingIncome ? 'Income updated!' : 'Income added!'); this.closeModal(); this.loadIncome(); this.saving = false; },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save.'; },
    });
  }

  deleteIncome(id: string): void {
    if (!confirm('Delete this income record?')) return;
    this.incomeService.deleteIncome(id).subscribe({
      next: () => { this.toast.success('Income deleted.'); this.loadIncome(); },
      error: (err) => this.toast.error(err.error?.message || 'Failed to delete.'),
    });
  }
}
