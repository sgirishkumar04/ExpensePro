import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl animate-slide-in"
          [ngClass]="{
            'bg-emerald-500 text-white': toast.type === 'success',
            'bg-red-500 text-white': toast.type === 'error',
            'bg-amber-500 text-white': toast.type === 'warning',
            'bg-primary-500 text-white': toast.type === 'info'
          }"
        >
          <span class="text-xl flex-shrink-0">
            {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️' }}
          </span>
          <p class="text-sm font-medium flex-1 pt-0.5">{{ toast.message }}</p>
          <button
            class="opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
            (click)="toastService.dismiss(toast.id)"
          >×</button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}
