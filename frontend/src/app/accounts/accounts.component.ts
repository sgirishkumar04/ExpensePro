import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../shared/layout/layout.component';
import { AccountService } from '../services/account.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { Account } from '../models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent, CurrencyPipe],
  template: `
    <app-layout pageTitle="Accounts">
      <div class="ep-page-header">
        <div>
          <h1 class="ep-page-title">🏦 Accounts</h1>
          <p class="ep-page-subtitle">Manage all your bank accounts and wallets</p>
        </div>
        <div class="flex gap-2">
          <button class="ep-btn-secondary" (click)="showTransferModal = true">🔄 Transfer</button>
          <button class="ep-btn-primary" (click)="openModal()">+ Add Account</button>
        </div>
      </div>

      <!-- Total Balance -->
      <div class="rounded-2xl p-6 mb-6" style="background: linear-gradient(135deg, #1e1b4b, #4338ca)">
        <p class="text-indigo-200 text-sm font-medium mb-1">Total Balance Across All Accounts</p>
        <p class="text-white text-4xl font-extrabold">{{ totalBalance | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</p>
        @if (highestAccount) {
          <p class="text-indigo-300 text-sm mt-2">Best: {{ highestAccount.name }} · {{ highestAccount.balance | currency:(user?.currency||'INR'):'symbol':'1.0-0' }}</p>
        }
      </div>

      <!-- Accounts Grid -->
      @if (loading) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) { <div class="ep-card"><div class="ep-skeleton h-32"></div></div> }
        </div>
      } @else if (accounts.length === 0) {
        <div class="ep-card ep-empty py-16">
          <span class="text-6xl mb-4">🏦</span>
          <p class="text-xl font-semibold" style="color: var(--text-primary)">No accounts yet</p>
          <p class="text-sm">Add your first account to start tracking balances</p>
          <button class="ep-btn-primary mt-5" (click)="openModal()">+ Add Account</button>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (acc of accounts; track acc._id) {
            <div class="ep-card relative overflow-hidden group">
              <!-- Background accent -->
              <div class="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-6 translate-x-6 opacity-10"
                [style.background]="acc.color"></div>

              <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" [style.background]="acc.color + '25'">
                  {{ getAccountIcon(acc.type) }}
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="ep-btn-icon ep-btn-sm" (click)="openModal(acc)">✏️</button>
                  <button class="ep-btn-icon ep-btn-sm" (click)="deleteAccount(acc._id)">🗑️</button>
                </div>
              </div>

              <p class="font-bold text-lg" style="color: var(--text-primary)">{{ acc.name }}</p>
              <p class="text-sm mb-3" style="color: var(--text-muted)">{{ acc.type }}</p>
              @if (acc.bankName) {
                <p class="text-xs mb-3" style="color: var(--text-muted)">{{ acc.bankName }}</p>
              }

              <div class="flex items-end justify-between">
                <div>
                  <p class="text-xs font-medium mb-0.5" style="color: var(--text-muted)">Balance</p>
                  <p class="text-2xl font-extrabold" [style.color]="acc.color">
                    {{ acc.balance | currency:(user?.currency||'INR'):'symbol':'1.2-2' }}
                  </p>
                </div>
                @if (acc.isDefault) {
                  <span class="ep-badge-primary text-xs">Default</span>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Add/Edit Account Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5)">
          <div class="w-full max-w-md ep-card animate-slide-up">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-xl font-bold" style="color: var(--text-primary)">{{ editingAccount ? 'Edit Account' : 'Add Account' }}</h2>
              <button class="ep-btn-icon" (click)="closeModal()">✕</button>
            </div>
            <div class="space-y-4">
              <div class="ep-form-group">
                <label class="ep-label">Account Name *</label>
                <input type="text" class="ep-input" placeholder="e.g. SBI Savings, HDFC Credit" [(ngModel)]="form.name">
              </div>
              <div class="ep-form-group">
                <label class="ep-label">Account Type *</label>
                <select class="ep-select" [(ngModel)]="form.type">
                  @for (t of accountTypes; track t) { <option [value]="t">{{ t }}</option> }
                </select>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="ep-form-group">
                  <label class="ep-label">Current Balance</label>
                  <input type="number" class="ep-input" [(ngModel)]="form.balance" min="0">
                </div>
                <div class="ep-form-group">
                  <label class="ep-label">Bank / Provider</label>
                  <input type="text" class="ep-input" placeholder="e.g. SBI, HDFC" [(ngModel)]="form.bankName">
                </div>
              </div>
              <div class="ep-form-group">
                <label class="ep-label">Color</label>
                <div class="flex items-center gap-3">
                  <input type="color" class="w-12 h-10 rounded-lg cursor-pointer border-0 p-1" [(ngModel)]="form.color">
                  <div class="flex flex-wrap gap-2">
                    @for (color of quickColors; track color) {
                      <button class="w-7 h-7 rounded-lg" [style.background]="color" (click)="form.color = color"></button>
                    }
                  </div>
                </div>
              </div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="w-4 h-4 rounded" [(ngModel)]="form.isDefault">
                <span class="text-sm font-medium" style="color: var(--text-primary)">Set as default account</span>
              </label>
            </div>
            @if (formError) { <div class="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">⚠️ {{ formError }}</div> }
            <div class="flex gap-3 mt-6">
              <button class="ep-btn-secondary flex-1" (click)="closeModal()">Cancel</button>
              <button class="ep-btn-primary flex-1" (click)="saveAccount()" [disabled]="saving">
                @if (saving) { <span class="animate-spin">⟳</span> } {{ editingAccount ? 'Update' : 'Add Account' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Transfer Modal -->
      @if (showTransferModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5)">
          <div class="w-full max-w-md ep-card animate-slide-up">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-xl font-bold" style="color: var(--text-primary)">🔄 Transfer Between Accounts</h2>
              <button class="ep-btn-icon" (click)="showTransferModal = false">✕</button>
            </div>
            <div class="space-y-4">
              <div class="ep-form-group">
                <label class="ep-label">From Account</label>
                <select class="ep-select" [(ngModel)]="transferForm.fromAccountId">
                  <option value="">Select account</option>
                  @for (acc of accounts; track acc._id) { <option [value]="acc._id">{{ acc.name }} ({{ acc.balance | currency:(user?.currency||'INR'):'symbol':'1.0-0' }})</option> }
                </select>
              </div>
              <div class="ep-form-group">
                <label class="ep-label">To Account</label>
                <select class="ep-select" [(ngModel)]="transferForm.toAccountId">
                  <option value="">Select account</option>
                  @for (acc of accounts; track acc._id) {
                    @if (acc._id !== transferForm.fromAccountId) {
                      <option [value]="acc._id">{{ acc.name }}</option>
                    }
                  }
                </select>
              </div>
              <div class="ep-form-group">
                <label class="ep-label">Amount</label>
                <input type="number" class="ep-input" placeholder="0.00" [(ngModel)]="transferForm.amount" min="0.01">
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button class="ep-btn-secondary flex-1" (click)="showTransferModal = false">Cancel</button>
              <button class="ep-btn-primary flex-1" (click)="doTransfer()" [disabled]="transferring">
                @if (transferring) { <span class="animate-spin">⟳</span> } Transfer
              </button>
            </div>
          </div>
        </div>
      }
    </app-layout>
  `,
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  loading = true;
  saving = false;
  transferring = false;
  showModal = false;
  showTransferModal = false;
  editingAccount: Account | null = null;
  formError = '';
  totalBalance = 0;
  highestAccount: Account | null = null;

  form = { name: '', type: 'Bank Account', balance: 0, bankName: '', color: '#6366f1', isDefault: false };
  transferForm = { fromAccountId: '', toAccountId: '', amount: 0 };

  accountTypes = ['Bank Account', 'Cash Wallet', 'Credit Card', 'Debit Card', 'UPI Wallet', 'Savings Account', 'Investment Account'];
  quickColors = ['#6366f1','#10b981','#ef4444','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#14b8a6'];

  get user() { return this.authService.user(); }

  constructor(private accountService: AccountService, private toast: ToastService, public authService: AuthService) {}

  ngOnInit(): void { this.loadAccounts(); }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (res) => {
        this.accounts = res.accounts;
        this.totalBalance = res.totalBalance;
        this.highestAccount = this.accounts.sort((a, b) => b.balance - a.balance)[0] || null;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  openModal(acc?: Account): void {
    this.editingAccount = acc || null;
    this.formError = '';
    this.form = acc ? { name: acc.name, type: acc.type, balance: acc.balance, bankName: acc.bankName || '', color: acc.color, isDefault: acc.isDefault }
      : { name: '', type: 'Bank Account', balance: 0, bankName: '', color: '#6366f1', isDefault: false };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editingAccount = null; }

  saveAccount(): void {
    if (!this.form.name) { this.formError = 'Account name is required.'; return; }
    this.saving = true;
    const obs = this.editingAccount
      ? this.accountService.updateAccount(this.editingAccount._id, this.form as any)
      : this.accountService.createAccount(this.form as any);
    obs.subscribe({
      next: () => { this.toast.success(this.editingAccount ? 'Account updated!' : 'Account added!'); this.closeModal(); this.loadAccounts(); this.saving = false; },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed.'; },
    });
  }

  deleteAccount(id: string): void {
    if (!confirm('Delete this account? This will not delete associated transactions.')) return;
    this.accountService.deleteAccount(id).subscribe({
      next: () => { this.toast.success('Account deleted.'); this.loadAccounts(); },
      error: (err) => this.toast.error(err.error?.message || 'Failed.'),
    });
  }

  doTransfer(): void {
    if (!this.transferForm.fromAccountId || !this.transferForm.toAccountId) { this.toast.error('Select both accounts.'); return; }
    if (!this.transferForm.amount || this.transferForm.amount <= 0) { this.toast.error('Enter a valid amount.'); return; }
    this.transferring = true;
    this.accountService.transferBetweenAccounts(this.transferForm).subscribe({
      next: () => { this.toast.success('Transfer successful!'); this.showTransferModal = false; this.loadAccounts(); this.transferring = false; },
      error: (err) => { this.transferring = false; this.toast.error(err.error?.message || 'Transfer failed.'); },
    });
  }

  getAccountIcon(type: string): string {
    const m: Record<string, string> = { 'Bank Account': '🏦', 'Cash Wallet': '💵', 'Credit Card': '💳', 'Debit Card': '💳', 'UPI Wallet': '📱', 'Savings Account': '🐷', 'Investment Account': '📈' };
    return m[type] || '💰';
  }
}
