import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Income, IncomeFilters, Pagination } from '../models';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  private apiUrl = `${environment.apiUrl}/income`;
  constructor(private http: HttpClient) {}

  getIncomeEntries(filters: IncomeFilters = {}): Observable<{ success: boolean; incomes: Income[]; pagination: Pagination }> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') params = params.set(key, String(val));
    });
    return this.http.get<any>(this.apiUrl, { params });
  }

  getIncome(id: string): Observable<{ success: boolean; income: Income }> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createIncome(data: Partial<Income>): Observable<{ success: boolean; income: Income }> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateIncome(id: string, data: Partial<Income>): Observable<{ success: boolean; income: Income }> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteIncome(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
