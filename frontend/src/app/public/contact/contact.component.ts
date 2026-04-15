import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="background: var(--bg-primary); color: var(--text-primary); min-height: 100vh">
      <div class="py-5 px-6 flex items-center justify-between border-b" style="border-color: var(--border-color); background: var(--bg-secondary)">
        <a routerLink="/" class="flex items-center gap-2 no-underline">
          <span class="text-2xl">💰</span><span class="font-extrabold text-xl" style="color: var(--text-primary)">ExpensePro</span>
        </a>
        <a routerLink="/signup" class="ep-btn-primary ep-btn-sm">Get Started</a>
      </div>

      <div class="max-w-4xl mx-auto px-6 py-16">
        <div class="text-center mb-12">
          <h1 class="text-5xl font-extrabold mb-4" style="color: var(--text-primary)">📬 Contact Us</h1>
          <p class="text-xl" style="color: var(--text-muted)">Have questions or feedback? We'd love to hear from you.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Contact Info -->
          <div class="space-y-5">
            @for (item of contactInfo; track item.title) {
              <div class="ep-card flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">{{ item.icon }}</div>
                <div>
                  <p class="font-bold" style="color: var(--text-primary)">{{ item.title }}</p>
                  <p class="text-sm mt-1" style="color: var(--text-muted)">{{ item.value }}</p>
                </div>
              </div>
            }
          </div>

          <!-- Contact Form -->
          <div class="ep-card">
            <h2 class="font-bold text-xl mb-5" style="color: var(--text-primary)">Send a Message</h2>
            @if (!submitted) {
              <div class="space-y-4">
                <div class="ep-form-group"><label class="ep-label">Your Name</label><input type="text" class="ep-input" placeholder="John Doe" [(ngModel)]="form.name"></div>
                <div class="ep-form-group"><label class="ep-label">Email</label><input type="email" class="ep-input" placeholder="you@email.com" [(ngModel)]="form.email"></div>
                <div class="ep-form-group"><label class="ep-label">Subject</label><input type="text" class="ep-input" placeholder="How can we help?" [(ngModel)]="form.subject"></div>
                <div class="ep-form-group"><label class="ep-label">Message</label><textarea class="ep-textarea" placeholder="Tell us more..." [(ngModel)]="form.message" rows="4"></textarea></div>
                <button class="ep-btn-primary w-full" (click)="submit()">Send Message 📨</button>
              </div>
            }
            @if (submitted) {
              <div class="text-center py-8">
                <div class="text-5xl mb-4">✅</div>
                <h3 class="text-xl font-bold mb-2" style="color: var(--text-primary)">Message Sent!</h3>
                <p style="color: var(--text-muted)">We'll get back to you within 24 hours.</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`a { text-decoration: none; }`]
})
export class ContactComponent {
  submitted = false;
  form = { name: '', email: '', subject: '', message: '' };

  contactInfo = [
    { icon: '✉️', title: 'Email Support', value: 'support@expensepro.app' },
    { icon: '💬', title: 'Response Time', value: 'We typically respond within 24 hours' },
    { icon: '🌐', title: 'Documentation', value: 'Check our FAQ for quick answers' },
  ];

  submit(): void { this.submitted = true; }
}
