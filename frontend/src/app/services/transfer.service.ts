import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Transfer, TransferFilters, Pagination } from '../models';

@Injectable({ providedIn: 'root' })
export class TransferService {
  private apiUrl = `${environment.apiUrl}/transfers`;
  constructor(private http: HttpClient) {}

  getTransfers(filters: TransferFilters = {}): Observable<{ success: boolean; transfers: Transfer[]; pagination: Pagination }> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') params = params.set(key, String(val));
    });
    return this.http.get<any>(this.apiUrl, { params });
  }

  getTransfer(id: string): Observable<{ success: boolean; transfer: Transfer }> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTransfer(data: Partial<Transfer>): Observable<{ success: boolean; transfer: Transfer }> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateTransfer(id: string, data: Partial<Transfer>): Observable<{ success: boolean; transfer: Transfer }> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteTransfer(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
