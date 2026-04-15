import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient, private authService: AuthService) {}

  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<User>): Observable<{ success: boolean; user: User }> {
    return this.http.put<any>(`${this.apiUrl}/profile`, data).pipe(
      tap((res: any) => {
        if (res.success) this.authService.updateStoredUser(res.user);
      })
    );
  }

  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return this.http.post<any>(`${this.apiUrl}/profile-picture`, formData);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, data);
  }
}
