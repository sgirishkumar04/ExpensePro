import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Account } from '../models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apiUrl = `${environment.apiUrl}/accounts`;
  constructor(private http: HttpClient) {}

  getAccounts(): Observable<{ success: boolean; accounts: Account[]; totalBalance: number }> {
    return this.http.get<any>(this.apiUrl);
  }

  createAccount(data: Partial<Account>): Observable<{ success: boolean; account: Account }> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateAccount(id: string, data: Partial<Account>): Observable<{ success: boolean; account: Account }> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteAccount(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  transferBetweenAccounts(data: { fromAccountId: string; toAccountId: string; amount: number; notes?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/transfer`, data);
  }
}
