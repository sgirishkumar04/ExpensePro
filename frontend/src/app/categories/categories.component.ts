import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../shared/layout/layout.component';
import { CategoryService } from '../services/category.service';
import { ToastService } from '../services/toast.service';
import { Category } from '../models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout pageTitle="Categories">
      <div class="ep-page-header">
        <div>
          <h1 class="ep-page-title">🏷️ Categories</h1>
          <p class="ep-page-subtitle">Manage your expense categories</p>
        </div>
        <button class="ep-btn-primary" (click)="openModal()">+ New Category</button>
      </div>

      @if (loading) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4,5,6]; track i) { <div class="ep-card"><div class="ep-skeleton h-16"></div></div> }
        </div>
      } @else {
        <!-- Default Categories -->
        <div class="mb-6">
          <h2 class="text-sm font-bold uppercase tracking-wider mb-3" style="color: var(--text-muted)">Default Categories</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            @for (cat of defaultCategories; track cat._id) {
              <div class="ep-card p-4 flex flex-col items-center text-center gap-2 cursor-default opacity-80">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" [style.background]="cat.color + '20'">
                  {{ cat.icon }}
                </div>
                <p class="text-sm font-semibold" style="color: var(--text-primary)">{{ cat.name }}</p>
                <span class="ep-badge-gray text-xs">Default</span>
              </div>
            }
          </div>
        </div>

        <!-- Custom Categories -->
        <div>
          <h2 class="text-sm font-bold uppercase tracking-wider mb-3" style="color: var(--text-muted)">Custom Categories</h2>
          @if (customCategories.length === 0) {
            <div class="ep-card ep-empty py-12">
              <span class="text-4xl mb-3">🏷️</span>
              <p class="font-semibold" style="color: var(--text-primary)">No custom categories yet</p>
              <p class="text-sm mt-1">Create categories tailored to your spending habits</p>
              <button class="ep-btn-primary mt-4" (click)="openModal()">+ Create Category</button>
            </div>
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              @for (cat of customCategories; track cat._id) {
                <div class="ep-card p-4 flex flex-col items-center text-center gap-2">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" [style.background]="cat.color + '20'">
                    {{ cat.icon }}
                  </div>
                  <p class="text-sm font-semibold" style="color: var(--text-primary)">{{ cat.name }}</p>
                  <div class="flex gap-1">
                    <button class="ep-btn-icon ep-btn-sm" style="width: 28px; height: 28px; font-size: 12px" (click)="openModal(cat)" title="Edit">✏️</button>
                    <button class="ep-btn-icon ep-btn-sm" style="width: 28px; height: 28px; font-size: 12px" (click)="deleteCategory(cat._id)" title="Delete">🗑️</button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5)">
          <div class="w-full max-w-md ep-card animate-slide-up">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-xl font-bold" style="color: var(--text-primary)">{{ editingCategory ? 'Edit Category' : 'New Category' }}</h2>
              <button class="ep-btn-icon" (click)="closeModal()">✕</button>
            </div>

            <!-- Preview -->
            <div class="flex items-center gap-4 p-4 rounded-xl mb-5" style="background: var(--bg-secondary); border: 1px solid var(--border-color)">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" [style.background]="form.color + '30'">
                {{ form.icon || '???' }}
              </div>
              <div>
                <p class="font-bold text-lg" style="color: var(--text-primary)">{{ form.name || 'Category Name' }}</p>
                <p class="text-sm" style="color: var(--text-muted)">Preview</p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="ep-form-group">
                <label class="ep-label">Category Name *</label>
                <input type="text" class="ep-input" placeholder="e.g. Gaming, Pet Care..." [(ngModel)]="form.name" maxlength="50">
              </div>
              <div class="ep-form-group">
                <label class="ep-label">Icon (Emoji) *</label>
                <input type="text" class="ep-input" placeholder="Pick an emoji e.g. 🎮" [(ngModel)]="form.icon" maxlength="4">
              </div>
              <!-- Quick emoji picker -->
              <div class="flex flex-wrap gap-2">
                @for (emoji of quickEmojis; track emoji) {
                  <button class="w-9 h-9 rounded-lg text-xl hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                    (click)="form.icon = emoji">{{ emoji }}</button>
                }
              </div>
              <div class="ep-form-group">
                <label class="ep-label">Color</label>
                <div class="flex items-center gap-3">
                  <input type="color" class="w-12 h-10 rounded-lg cursor-pointer border-0 p-1" [(ngModel)]="form.color">
                  <div class="flex flex-wrap gap-2">
                    @for (color of quickColors; track color) {
                      <button class="w-7 h-7 rounded-lg border-2 border-transparent hover:border-white transition-all"
                        [style.background]="color"
                        [class.scale-110]="form.color === color"
                        (click)="form.color = color">
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>

            @if (formError) { <div class="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">⚠️ {{ formError }}</div> }

            <div class="flex gap-3 mt-6">
              <button class="ep-btn-secondary flex-1" (click)="closeModal()">Cancel</button>
              <button class="ep-btn-primary flex-1" (click)="saveCategory()" [disabled]="saving">
                @if (saving) { <span class="animate-spin">⟳</span> } {{ editingCategory ? 'Update' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      }
    </app-layout>
  `,
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  saving = false;
  showModal = false;
  editingCategory: Category | null = null;
  formError = '';

  form = { name: '', icon: '📦', color: '#6366f1' };

  quickEmojis = ['🍕','🚗','🛍️','💡','🏠','🎬','🏥','📚','📈','🎮','✈️','⛽','🎁','🐾','💊','🍺','☕','🏋️','🎵','🎨'];
  quickColors = ['#6366f1','#ef4444','#10b981','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#14b8a6','#f97316','#06b6d4'];

  get defaultCategories() { return this.categories.filter(c => c.isDefault); }
  get customCategories() { return this.categories.filter(c => !c.isDefault); }

  constructor(private categoryService: CategoryService, private toast: ToastService) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: res => { this.categories = res.categories; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  openModal(cat?: Category): void {
    this.editingCategory = cat || null;
    this.formError = '';
    this.form = cat ? { name: cat.name, icon: cat.icon, color: cat.color } : { name: '', icon: '📦', color: '#6366f1' };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editingCategory = null; }

  saveCategory(): void {
    if (!this.form.name.trim()) { this.formError = 'Name is required.'; return; }
    this.saving = true;
    const obs = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory._id, this.form)
      : this.categoryService.createCategory(this.form);
    obs.subscribe({
      next: () => {
        this.toast.success(this.editingCategory ? 'Category updated!' : 'Category created!');
        this.closeModal();
        this.categoryService.getCategories().subscribe(r => this.categories = r.categories);
        this.saving = false;
      },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed.'; },
    });
  }

  deleteCategory(id: string): void {
    if (!confirm('Delete this category?')) return;
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.toast.success('Category deleted.');
        this.categories = this.categories.filter(c => c._id !== id);
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed.'),
    });
  }
}
