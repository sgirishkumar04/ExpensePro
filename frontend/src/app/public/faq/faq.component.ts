import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="background: var(--bg-primary); color: var(--text-primary); min-height: 100vh">
      <div class="py-5 px-6 flex items-center justify-between border-b" style="border-color: var(--border-color); background: var(--bg-secondary)">
        <a routerLink="/" class="flex items-center gap-2 no-underline">
          <span class="text-2xl">💰</span><span class="font-extrabold text-xl" style="color: var(--text-primary)">ExpensePro</span>
        </a>
        <a routerLink="/signup" class="ep-btn-primary ep-btn-sm">Get Started</a>
      </div>

      <div class="max-w-3xl mx-auto px-6 py-16">
        <div class="text-center mb-12">
          <h1 class="text-5xl font-extrabold mb-4" style="color: var(--text-primary)">❓ Frequently Asked Questions</h1>
          <p class="text-xl" style="color: var(--text-muted)">Everything you need to know about ExpensePro</p>
        </div>

        <div class="space-y-3">
          @for (faq of faqs; track faq.q) {
            <div class="ep-card cursor-pointer" (click)="faq.open = !faq.open">
              <div class="flex items-center justify-between gap-4">
                <h3 class="font-semibold" style="color: var(--text-primary)">{{ faq.q }}</h3>
                <span class="text-xl flex-shrink-0 transition-transform" [class.rotate-180]="faq.open" style="color: var(--text-muted)">⌄</span>
              </div>
              @if (faq.open) {
                <p class="mt-3 text-sm leading-relaxed animate-fade-in" style="color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 12px">{{ faq.a }}</p>
              }
            </div>
          }
        </div>

        <div class="text-center mt-12">
          <p class="mb-4" style="color: var(--text-muted)">Still have questions?</p>
          <a routerLink="/contact" class="ep-btn-primary ep-btn-lg">Contact Support</a>
        </div>
      </div>
    </div>
  `,
  styles: [` a { text-decoration: none; } .rotate-180 { transform: rotate(180deg); } `]
})
export class FaqComponent {
  faqs = [
    { q: 'Is ExpensePro free?', a: 'Yes! ExpensePro is completely free to use. No hidden fees, no credit card required. We use free-tier services to keep it free for everyone.', open: false },
    { q: 'How is my data secured?', a: 'Your data is protected with JWT authentication, bcrypt password hashing, and HTTPS encryption. We store data on MongoDB Atlas with enterprise-grade security. We never share your data with third parties.', open: false },
    { q: 'Can I track multiple bank accounts?', a: 'Absolutely! You can add unlimited accounts including Bank Accounts, Cash Wallets, Credit Cards, Debit Cards, UPI Wallets, Savings Accounts, and Investment Accounts.', open: false },
    { q: 'How do I upload receipts?', a: 'When adding or editing an expense, you can upload a receipt image (JPEG, PNG, or PDF up to 5MB). Receipts are stored securely on Cloudinary.', open: false },
    { q: 'Can I create custom expense categories?', a: 'Yes! Go to Categories in the sidebar to create unlimited custom categories with your own name, emoji icon, and color. Default categories are always available too.', open: false },
    { q: 'What reports are available?', a: 'ExpensePro provides monthly reports, yearly reports, category-wise breakdowns, income vs expense trends, savings trends, and top spending categories — all with beautiful charts.', open: false },
    { q: 'Can I transfer money between my own accounts?', a: 'Yes! In the Accounts section, use the Transfer button to move money between any of your own accounts. Balances are updated instantly.', open: false },
    { q: 'Is the app mobile-friendly?', a: 'ExpensePro is fully responsive and works great on mobile, tablet, and desktop. The sidebar collapses on mobile for a clean experience.', open: false },
    { q: 'What currencies are supported?', a: 'You can set your preferred currency in Profile settings. Supported currencies include INR, USD, EUR, GBP, AED, SGD, AUD, and more.', open: false },
    { q: 'Can I export my data?', a: 'Data export and PDF/Excel download features are coming soon. You can currently view all data in the Reports section.', open: false },
  ];
}
