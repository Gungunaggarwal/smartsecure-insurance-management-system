import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="glass navbar animate-fade">
      <div class="nav-container">
        <a routerLink="/" class="logo">
          <span class="gradient-text">Smart</span>Secure
        </a>
        
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          
          <ng-container *ngIf="!authService.isAuthenticated()">
            <a routerLink="/login" class="nav-btn">Login</a>
            <a routerLink="/register" class="nav-btn btn-primary">Sign Up</a>
          </ng-container>

          <ng-container *ngIf="authService.isAuthenticated()">
            <a *ngIf="!authService.isAdmin()" routerLink="/dashboard">Dashboard</a>
            <a *ngIf="authService.isAdmin()" routerLink="/admin">Admin Control</a>
            <button (click)="authService.logout()" class="logout-btn">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      margin: 1rem;
      padding: 0.75rem 2rem;
      position: sticky;
      top: 1rem;
      z-index: 1000;
      border-radius: 20px;
    }

    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .logo {
      font-family: var(--header-font);
      font-size: 1.5rem;
      font-weight: 800;
      text-decoration: none;
      color: var(--text-primary);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .nav-links a {
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.95rem;
      transition: var(--transition);
    }

    .nav-links a:hover, .nav-links a.active {
      color: var(--accent-teal);
    }

    .nav-btn {
      padding: 0.6rem 1.2rem !important;
      border-radius: 10px !important;
    }

    .logout-btn {
      background: none;
      border: 1px solid var(--glass-border);
      color: var(--text-secondary);
      padding: 0.5rem 1rem;
      border-radius: 10px;
      cursor: pointer;
      transition: var(--transition);
      font-weight: 500;
    }

    .logout-btn:hover {
      background: rgba(255, 68, 68, 0.1);
      color: #ff4444;
      border-color: #ff4444;
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
}
