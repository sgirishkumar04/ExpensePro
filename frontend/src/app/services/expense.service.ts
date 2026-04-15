import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Expense, ExpenseFilters, Pagination } from '../models';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`;
  constructor(private http: HttpClient) {}

  getExpenses(filters: ExpenseFilters = {}): Observable<{ success: boolean; expenses: Expense[]; pagination: Pagination }> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') params = params.set(key, String(val));
    });
    return this.http.get<any>(this.apiUrl, { params });
  }

  getExpense(id: string): Observable<{ success: boolean; expense: Expense }> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createExpense(data: Partial<Expense>): Observable<{ success: boolean; expense: Expense }> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateExpense(id: string, data: Partial<Expense>): Observable<{ success: boolean; expense: Expense }> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteExpense(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  uploadReceipt(expenseId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('receipt', file);
    return this.http.post<any>(`${this.apiUrl}/${expenseId}/receipt`, formData);
  }
}
