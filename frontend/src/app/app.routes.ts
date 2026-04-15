import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Public routes
  { path: '', loadComponent: () => import('./public/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'about', loadComponent: () => import('./public/about/about.component').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./public/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'faq', loadComponent: () => import('./public/faq/faq.component').then(m => m.FaqComponent) },

  // Auth routes (guest only)
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', canActivate: [guestGuard], loadComponent: () => import('./auth/signup/signup.component').then(m => m.SignupComponent) },
  { path: 'verify-email', loadComponent: () => import('./auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent) },
  { path: 'forgot-password', canActivate: [guestGuard], loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },

  // Protected app routes
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'expenses',
    canActivate: [authGuard],
    loadComponent: () => import('./expenses/expenses.component').then(m => m.ExpensesComponent),
  },
  {
    path: 'income',
    canActivate: [authGuard],
    loadComponent: () => import('./income/income.component').then(m => m.IncomeComponent),
  },
  {
    path: 'money-sent',
    canActivate: [authGuard],
    loadComponent: () => import('./money-sent/money-sent.component').then(m => m.MoneySentComponent),
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent),
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () => import('./categories/categories.component').then(m => m.CategoriesComponent),
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadComponent: () => import('./accounts/accounts.component').then(m => m.AccountsComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
  },

  // Catch all
  { path: '**', redirectTo: '' },
];
