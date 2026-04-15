import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../shared/layout/layout.component';
import { TransferService } from '../services/transfer.service';
import { AccountService } from '../services/account.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { Transfer, Account, Pagination, TransferFilters } from '../models';

@Component({
  selector: 'app-money-sent',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent, CurrencyPipe, DatePipe],
  template: `
    <app-layout pageTitle="Money Sent">
      <div class="ep-page-header">
        <div>
          <h1 class="ep-page-title">📤 Money Sent</h1>
          <p class="ep-page-subtitle">Track money sent to friends, family, and EMIs</p>
        </div>
        <button class="ep-btn-primary" (click)="openModal()">+ Log Transfer</button>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div class="ep-stat-card">
          <div class="ep-stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">📤</div>
          <div><p class="ep-stat-label">Total Sent</p><p class="ep-stat-value">{{ totalSent | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</p></div>
        </div>
        <div class="ep-stat-card">
          <div class="ep-stat-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">📋</div>
          <div><p class="ep-stat-label">Total Transfers</p><p class="ep-stat-value">{{ pagination.total }}</p></div>
        </div>
        <div class="ep-stat-card">
          <div class="ep-stat-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626)">📱</div>
          <div><p class="ep-stat-label">Avg Transfer</p><p class="ep-stat-value">{{ avgSent | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</p></div>
        </div>
      </div>

      <!-- Filters -->
      <div class="ep-card mb-5">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" class="ep-input" placeholder="🔍 Search by name, reason..." [(ngModel)]="filters.search" (input)="onSearch()">
          <select class="ep-select" [(ngModel)]="filters.paymentType" (change)="loadTransfers()">
            <option value="">All Types</option>
            @for (t of paymentTypes; track t) { <option [value]="t">{{ t }}</option> }
          </select>
          <div class="flex gap-2">
            <input type="date" class="ep-input" [(ngModel)]="filters.startDate" (change)="loadTransfers()">
            <input type="date" class="ep-input" [(ngModel)]="filters.endDate" (change)="loadTransfers()">
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="ep-table-wrapper">
        @if (loading) {
          <div class="p-8 text-center" style="color: var(--text-muted)"><div class="animate-spin text-4xl">⟳</div></div>
        } @else if (transfers.length === 0) {
          <div class="ep-empty">
            <span class="text-5xl mb-3">📤</span>
            <p class="font-semibold text-lg" style="color: var(--text-primary)">No transfers yet</p>
            <button class="ep-btn-primary mt-4" (click)="openModal()">+ Log Transfer</button>
          </div>
        } @else {
          <table class="ep-table">
            <thead><tr><th>Person</th><th>Reason</th><th>Amount</th><th>Type</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              @for (tr of transfers; track tr._id) {
                <tr>
                  <td><div class="font-semibold" style="color: var(--text-primary)">{{ tr.personName }}</div></td>
                  <td class="text-sm" style="color: var(--text-muted)">{{ tr.reason || '—' }}</td>
                  <td><span class="font-bold text-amber-500">−{{ tr.amount | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</span></td>
                  <td><span class="ep-badge-warning">{{ tr.paymentType }}</span></td>
                  <td class="text-sm" style="color: var(--text-muted)">{{ tr.date | date:'dd MMM yyyy' }}</td>
                  <td>
                    <span [class]="tr.status === 'Completed' ? 'ep-badge-success' : tr.status === 'Pending' ? 'ep-badge-warning' : 'ep-badge-danger'">
                      {{ tr.status }}
                    </span>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button class="ep-btn-icon ep-btn-sm" (click)="openModal(tr)">✏️</button>
                      <button class="ep-btn-icon ep-btn-sm" (click)="deleteTransfer(tr._id)">🗑️</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      @if (pagination.pages > 1) {
        <div class="flex items-center justify-center gap-2 mt-5">
          <button class="ep-btn-secondary ep-btn-sm" [disabled]="pagination.page <= 1" (click)="changePage(pagination.page - 1)">← Prev</button>
          <span class="text-sm" style="color: var(--text-muted)">Page {{ pagination.page }} of {{ pagination.pages }}</span>
          <button class="ep-btn-secondary ep-btn-sm" [disabled]="pagination.page >= pagination.pages" (click)="changePage(pagination.page + 1)">Next →</button>
        </div>
      }

      <!-- Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5)">
          <div class="w-full max-w-lg ep-card animate-slide-up">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-xl font-bold" style="color: var(--text-primary)">{{ editingTransfer ? 'Edit Transfer' : 'Log Transfer' }}</h2>
              <button class="ep-btn-icon" (click)="closeModal()">✕</button>
            </div>
            <div class="space-y-4">
              <div class="ep-form-group">
                <label class="ep-label">Person Name *</label>
                <input type="text" class="ep-input" placeholder="e.g. John Doe, Mom, Bank EMI" [(ngModel)]="form.personName">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="ep-form-group">
                  <label class="ep-label">Amount *</label>
                  <input type="number" class="ep-input" placeholder="0.00" [(ngModel)]="form.amount" min="0.01">
                </div>
                <div class="ep-form-group">
                  <label class="ep-label">Date *</label>
                  <input type="date" class="ep-input" [(ngModel)]="form.date">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="ep-form-group">
                  <label class="ep-label">Payment Type</label>
                  <select class="ep-select" [(ngModel)]="form.paymentType">
                    @for (t of paymentTypes; track t) { <option [value]="t">{{ t }}</option> }
                  </select>
                </div>
                <div class="ep-form-group">
                  <label class="ep-label">Status</label>
                  <select class="ep-select" [(ngModel)]="form.status">
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
              <div class="ep-form-group">
                <label class="ep-label">From Account</label>
                <select class="ep-select" [(ngModel)]="form.fromAccount">
                  <option value="">None</option>
                  @for (acc of accounts; track acc._id) { <option [value]="acc._id">{{ acc.name }}</option> }
                </select>
              </div>
              <div class="ep-form-group">
                <label class="ep-label">Reason</label>
                <textarea class="ep-textarea" placeholder="What was this transfer for?" [(ngModel)]="form.reason"></textarea>
              </div>
            </div>
            @if (formError) { <div class="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">⚠️ {{ formError }}</div> }
            <div class="flex gap-3 mt-6">
              <button class="ep-btn-secondary flex-1" (click)="closeModal()">Cancel</button>
              <button class="ep-btn-primary flex-1" (click)="saveTransfer()" [disabled]="saving">
                @if (saving) { <span class="animate-spin">⟳</span> } {{ editingTransfer ? 'Update' : 'Log Transfer' }}
              </button>
            </div>
          </div>
        </div>
      }
    </app-layout>
  `,
})
export class MoneySentComponent implements OnInit {
  transfers: Transfer[] = [];
  accounts: Account[] = [];
  loading = true;
  saving = false;
  showModal = false;
  editingTransfer: Transfer | null = null;
  formError = '';
  totalSent = 0;
  avgSent = 0;
  pagination: Pagination = { page: 1, limit: 10, total: 0, pages: 0 };
  filters: TransferFilters = { page: 1, limit: 10 };
  form = { personName: '', amount: 0, date: new Date().toISOString().split('T')[0], paymentType: 'UPI', status: 'Completed', fromAccount: '', reason: '' };
  paymentTypes = ['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'EMI', 'Loan', 'Other'];
  private searchTimer: any;

  get user() { return this.authService.user(); }

  constructor(private transferService: TransferService, private accountService: AccountService, private toast: ToastService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadTransfers();
    this.accountService.getAccounts().subscribe(r => this.accounts = r.accounts);
  }

  loadTransfers(): void {
    this.loading = true;
    this.transferService.getTransfers(this.filters).subscribe({
      next: (res) => {
        this.transfers = res.transfers;
        this.pagination = res.pagination;
        this.totalSent = this.transfers.reduce((s, t) => s + t.amount, 0);
        this.avgSent = this.transfers.length ? this.totalSent / this.transfers.length : 0;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => this.loadTransfers(), 400); }
  changePage(page: number): void { this.filters.page = page; this.loadTransfers(); }

  openModal(transfer?: Transfer): void {
    this.editingTransfer = transfer || null;
    this.formError = '';
    this.form = transfer ? {
      personName: transfer.personName, amount: transfer.amount,
      date: new Date(transfer.date).toISOString().split('T')[0],
      paymentType: transfer.paymentType, status: transfer.status,
      fromAccount: (transfer.fromAccount as any)?._id || '', reason: transfer.reason || '',
    } : { personName: '', amount: 0, date: new Date().toISOString().split('T')[0], paymentType: 'UPI', status: 'Completed', fromAccount: '', reason: '' };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editingTransfer = null; }

  saveTransfer(): void {
    if (!this.form.personName) { this.formError = 'Person name is required.'; return; }
    if (!this.form.amount || this.form.amount <= 0) { this.formError = 'Enter a valid amount.'; return; }
    this.saving = true;
    const payload: any = { ...this.form, fromAccount: this.form.fromAccount || undefined };
    const obs = this.editingTransfer
      ? this.transferService.updateTransfer(this.editingTransfer._id, payload)
      : this.transferService.createTransfer(payload);
    obs.subscribe({
      next: () => { this.toast.success(this.editingTransfer ? 'Transfer updated!' : 'Transfer logged!'); this.closeModal(); this.loadTransfers(); this.saving = false; },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save.'; },
    });
  }

  deleteTransfer(id: string): void {
    if (!confirm('Delete this transfer?')) return;
    this.transferService.deleteTransfer(id).subscribe({
      next: () => { this.toast.success('Transfer deleted.'); this.loadTransfers(); },
      error: (err) => this.toast.error(err.error?.message || 'Failed.'),
    });
  }
}
