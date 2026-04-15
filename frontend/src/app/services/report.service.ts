import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MonthlyReport, YearlyReport } from '../models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;
  constructor(private http: HttpClient) {}

  getMonthlyReport(year: number, month: number): Observable<{ success: boolean; report: MonthlyReport }> {
    return this.http.get<any>(`${this.apiUrl}/monthly`, { params: new HttpParams().set('year', year).set('month', month) });
  }

  getYearlyReport(year: number): Observable<{ success: boolean; report: YearlyReport }> {
    return this.http.get<any>(`${this.apiUrl}/yearly`, { params: new HttpParams().set('year', year) });
  }

  getTopCategories(year: number, month?: number): Observable<any> {
    let params = new HttpParams().set('year', year);
    if (month) params = params.set('month', month);
    return this.http.get<any>(`${this.apiUrl}/top-categories`, { params });
  }
}
