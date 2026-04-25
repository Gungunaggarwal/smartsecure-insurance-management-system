import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../../models/auth.model';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/v1/auth`;
  
  currentUser = signal<UserResponse | null>(null);
  isAuthenticated = signal<boolean>(!!localStorage.getItem('token'));

  constructor(private http: HttpClient, private router: Router) {
    this.bootstrapAuth();
  }

  bootstrapAuth() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const name = localStorage.getItem('name');
    const role = localStorage.getItem('role');

    if (token && username) {
      this.isAuthenticated.set(true);
      // Construct a partial user object from localStorage for immediate UI display
      this.currentUser.set({
        username,
        name: name || '',
        role: role || 'USER',
        email: '', // will be populated by fetch
        phone: '',
        address: '',
        id: 0
      } as UserResponse);
      
      // Fetch full details in the background to ensure sync
      this.getUserByUsername(username).subscribe();
    }
  }

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(res => {
        this.setSession(res);
      })
    );
  }

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(res => {
        this.setSession(res);
      })
    );
  }

  sendOtp(email: string) {
    return this.http.post<string>(`${this.apiUrl}/send-otp`, { email }, { responseType: 'text' as 'json' });
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post<boolean>(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('username', res.username);
    localStorage.setItem('name', res.name);
    localStorage.setItem('role', res.role);
    
    this.isAuthenticated.set(true);
    this.currentUser.set({
      username: res.username,
      name: res.name,
      role: res.role,
      email: '', 
      phone: '',
      address: '',
      id: 0
    } as UserResponse);
    
    // Fetch full details to populate the rest of the profile
    this.getUserByUsername(res.username).subscribe();
  }

  getUserByUsername(username: string) {
    return this.http.get<UserResponse>(`${this.apiUrl}/user/${username}`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  updateUser(username: string, request: RegisterRequest) {
    return this.http.put<UserResponse>(`${this.apiUrl}/user/${username}`, request).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  logout() {
    localStorage.clear();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }
}
