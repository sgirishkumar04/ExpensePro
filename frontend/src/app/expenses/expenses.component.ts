import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../shared/layout/layout.component';
import { ExpenseService } from '../services/expense.service';
import { CategoryService } from '../services/category.service';
import { AccountService } from '../services/account.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { Expense, Category, Account, Pagination, ExpenseFilters } from '../models';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LayoutComponent, CurrencyPipe, DatePipe],
  template: `
    <app-layout pageTitle="Expenses">
      <div class="ep-page-header">
        <div>
          <h1 class="ep-page-title">💸 Expenses</h1>
          <p class="ep-page-subtitle">Track and manage all your expenses</p>
        </div>
        <button class="ep-btn-primary" (click)="openModal()">+ Add Expense</button>
      </div>

      <!-- Filters -->
      <div class="ep-card mb-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input type="text" class="ep-input" placeholder="🔍 Search expenses..."
            [(ngModel)]="filters.search" (input)="onSearch()">
          <select class="ep-select" [(ngModel)]="filters.category" (change)="loadExpenses()">
            <option value="">All Categories</option>
            @for (cat of categories; track cat._id) {
              <option [value]="cat._id">{{ cat.icon }} {{ cat.name }}</option>
            }
          </select>
          <input type="date" class="ep-input" [(ngModel)]="filters.startDate" (change)="loadExpenses()">
          <input type="date" class="ep-input" [(ngModel)]="filters.endDate" (change)="loadExpenses()">
        </div>
        <div class="flex items-center justify-between mt-3 flex-wrap gap-2">
          <p class="text-sm" style="color: var(--text-muted)">
            Showing {{ expenses.length }} of {{ pagination.total }} expenses
          </p>
          <button class="ep-btn-secondary ep-btn-sm" (click)="clearFilters()">Clear Filters</button>
        </div>
      </div>

      <!-- Table -->
      <div class="ep-table-wrapper">
        @if (loading) {
          <div class="p-8 text-center" style="color: var(--text-muted)">
            <div class="animate-spin text-4xl mb-2">⟳</div> Loading expenses...
          </div>
        } @else if (expenses.length === 0) {
          <div class="ep-empty">
            <span class="text-5xl mb-3">💸</span>
            <p class="font-semibold text-lg" style="color: var(--text-primary)">No expenses found</p>
            <p class="text-sm mt-1">Add your first expense to get started</p>
            <button class="ep-btn-primary mt-4" (click)="openModal()">+ Add Expense</button>
          </div>
        } @else {
          <table class="ep-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th class="hide-mobile">Date</th>
                <th class="hide-mobile">Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (exp of expenses; track exp._id) {
                <tr>
                  <td>
                    <div class="font-semibold" style="color: var(--text-primary)">{{ exp.title }}</div>
                    @if (exp.notes) {
                      <div class="text-xs mt-0.5 truncate max-w-xs" style="color: var(--text-muted)">{{ exp.notes }}</div>
                    }
                  </td>
                  <td>
                    <span class="ep-badge-gray">{{ $any(exp.category).icon }} {{ $any(exp.category).name }}</span>
                  </td>
                  <td>
                    <span class="font-bold text-red-500">−{{ exp.amount | currency:(user?.currency || 'INR'):'symbol':'1.0-0' }}</span>
                  </td>
                  <td class="text-sm hide-mobile" style="color: var(--text-muted)">{{ exp.date | date:'dd MMM yyyy' }}</td>
                  <td class="hide-mobile"><span class="ep-badge-info">{{ exp.paymentMethod }}</span></td>
                  <td>
                    <div class="flex items-center gap-1">
                      <button class="ep-btn-icon ep-btn-sm" (click)="openModal(exp)" title="Edit">✏️</button>
                      <button class="ep-btn-icon ep-btn-sm" (click)="deleteExpense(exp._id)" title="Delete">🗑️</button>
                      @if (exp.receiptUrl) {
                        <a [href]="exp.receiptUrl" target="_blank" class="ep-btn-icon ep-btn-sm" title="View Receipt">🧾</a>
                      }
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
          @for (p of getPagesArray(); track p) {
            <button class="ep-btn-sm px-3 py-1.5 rounded-lg font-semibold"
              [class.ep-btn-primary]="p === pagination.page"
              [class.ep-btn-secondary]="p !== pagination.page"
              (click)="changePage(p)">{{ p }}</button>
          }
          <button class="ep-btn-secondary ep-btn-sm" [disabled]="pagination.page >= pagination.pages" (click)="changePage(pagination.page + 1)">Next →</button>
        </div>
      }

      <!-- Add/Edit Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5)">
          <div class="w-full max-w-lg ep-card animate-slide-up max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-xl font-bold" style="color: var(--text-primary)">
                {{ editingExpense ? 'Edit Expense' : 'Add Expense' }}
              </h2>
              <button class="ep-btn-icon" (click)="closeModal()">✕</button>
            </div>

            <div class="space-y-4">
              <div class="ep-form-group">
                <label class="ep-label">Title *</label>
                <input type="text" class="ep-input" placeholder="e.g. Coffee, Groceries" [(ngModel)]="form.title">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="ep-form-group">
                  <label class="ep-label">Amount *</label>
                  <input type="number" class="ep-input" placeholder="0.00" [(ngModel)]="form.amount" min="0.01" step="0.01">
                </div>
                <div class="ep-form-group">
                  <label class="ep-label">Date *</label>
                  <input type="date" class="ep-input" [(ngModel)]="form.date">
                </div>
              </div>
              <div class="ep-form-group">
                <label class="ep-label">Category *</label>
                <select class="ep-select" [(ngModel)]="form.category">
                  <option value="">Select category</option>
                  @for (cat of categories; track cat._id) {
                    <option [value]="cat._id">{{ cat.icon }} {{ cat.name }}</option>
                  }
                </select>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="ep-form-group">
                  <label class="ep-label">Payment Method</label>
                  <select class="ep-select" [(ngModel)]="form.paymentMethod">
                    @for (pm of paymentMethods; track pm) {
                      <option [value]="pm">{{ pm }}</option>
                    }
                  </select>
                </div>
                <div class="ep-form-group">
                  <label class="ep-label">Account</label>
                  <select class="ep-select" [(ngModel)]="form.account">
                    <option value="">None</option>
                    @for (acc of accounts; track acc._id) {
                      <option [value]="acc._id">{{ acc.name }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="ep-form-group">
                <label class="ep-label">Notes</label>
                <textarea class="ep-textarea" placeholder="Add notes..." [(ngModel)]="form.notes"></textarea>
              </div>
              <!-- Receipt Upload -->
              @if (editingExpense) {
                <div class="ep-form-group">
                  <label class="ep-label">Receipt Image</label>
                  <input type="file" accept="image/*,.pdf" (change)="onReceiptSelect($event)" class="ep-input py-2">
                  @if (editingExpense.receiptUrl) {
                    <a [href]="editingExpense.receiptUrl" target="_blank" class="text-xs mt-1 block" style="color: var(--primary)">View current receipt</a>
                  }
                </div>
              }
            </div>

            @if (formError) {
              <div class="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">⚠️ {{ formError }}</div>
            }

            <div class="flex gap-3 mt-6">
              <button class="ep-btn-secondary flex-1" (click)="closeModal()">Cancel</button>
              <button class="ep-btn-primary flex-1" (click)="saveExpense()" [disabled]="saving">
                @if (saving) { <span class="animate-spin">⟳</span> Saving... }
                @else { {{ editingExpense ? 'Update' : 'Add Expense' }} }
              </button>
            </div>
          </div>
        </div>
      }
    </app-layout>
  `,
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  categories: Category[] = [];
  accounts: Account[] = [];
  loading = true;
  saving = false;
  showModal = false;
  editingExpense: Expense | null = null;
  formError = '';

  pagination: Pagination = { page: 1, limit: 10, total: 0, pages: 0 };
  filters: ExpenseFilters = { page: 1, limit: 10 };

  form = {
    title: '', amount: 0, date: new Date().toISOString().split('T')[0],
    category: '', paymentMethod: 'Cash', account: '', notes: '',
  };

  paymentMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Bank Transfer', 'Other'];
  receiptFile: File | null = null;
  private searchTimer: any;

  get user() { return this.authService.user(); }

  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private toast: ToastService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
    this.categoryService.getCategories().subscribe(r => this.categories = r.categories);
    this.accountService.getAccounts().subscribe(r => this.accounts = r.accounts);
  }

  loadExpenses(): void {
    this.loading = true;
    this.expenseService.getExpenses(this.filters).subscribe({
      next: (res) => {
        this.expenses = res.expenses;
        this.pagination = res.pagination;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.filters.page = 1; this.loadExpenses(); }, 400);
  }

  clearFilters(): void {
    this.filters = { page: 1, limit: 10 };
    this.loadExpenses();
  }

  changePage(page: number): void {
    this.filters.page = page;
    this.loadExpenses();
  }

  getPagesArray(): number[] {
    return Array.from({ length: Math.min(this.pagination.pages, 7) }, (_, i) => {
      const start = Math.max(1, this.pagination.page - 3);
      return start + i;
    }).filter(p => p <= this.pagination.pages);
  }

  openModal(expense?: Expense): void {
    this.editingExpense = expense || null;
    this.formError = '';
    if (expense) {
      this.form = {
        title: expense.title,
        amount: expense.amount,
        date: new Date(expense.date).toISOString().split('T')[0],
        category: (expense.category as any)?._id || expense.category as any,
        paymentMethod: expense.paymentMethod,
        account: (expense.account as any)?._id || expense.account as any || '',
        notes: expense.notes || '',
      };
    } else {
      this.form = { title: '', amount: 0, date: new Date().toISOString().split('T')[0], category: '', paymentMethod: 'Cash', account: '', notes: '' };
    }
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editingExpense = null; }

  onReceiptSelect(event: any): void {
    this.receiptFile = event.target.files[0] || null;
  }

  saveExpense(): void {
    this.formError = '';
    if (!this.form.title) { this.formError = 'Title is required.'; return; }
    if (!this.form.amount || this.form.amount <= 0) { this.formError = 'Enter a valid amount.'; return; }
    if (!this.form.category) { this.formError = 'Please select a category.'; return; }

    this.saving = true;
    const payload: any = { ...this.form, account: this.form.account || undefined };

    const obs = this.editingExpense
      ? this.expenseService.updateExpense(this.editingExpense._id, payload)
      : this.expenseService.createExpense(payload);

    obs.subscribe({
      next: (res) => {
        if (this.receiptFile && res.expense) {
          this.expenseService.uploadReceipt(res.expense._id, this.receiptFile).subscribe();
        }
        this.toast.success(this.editingExpense ? 'Expense updated!' : 'Expense added!');
        this.closeModal();
        this.loadExpenses();
        this.saving = false;
      },
      error: (err) => {
        this.saving = false;
        this.formError = err.error?.message || 'Failed to save expense.';
      },
    });
  }

  deleteExpense(id: string): void {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    this.expenseService.deleteExpense(id).subscribe({
      next: () => { this.toast.success('Expense deleted.'); this.loadExpenses(); },
      error: (err) => this.toast.error(err.error?.message || 'Failed to delete.'),
    });
  }
}
