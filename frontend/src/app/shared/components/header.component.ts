import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header glass">
      <div class="user-info" *ngIf="authService.isAuthenticated()">
        <span class="welcome">Welcome, <span class="user-name">{{ authService.currentUser()?.name }}</span></span>
        <div class="user-badge">{{ authService.currentUser()?.role }}</div>
      </div>
      
      <div class="header-actions">
        <ng-container *ngIf="!authService.isAuthenticated()">
          <a routerLink="/login" class="btn btn-secondary btn-sm">Login</a>
          <a routerLink="/register" class="btn btn-primary btn-sm">Register</a>
        </ng-container>
        
        <ng-container *ngIf="authService.isAuthenticated()">
          <button (click)="authService.logout()" class="btn-logout">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </ng-container>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 70px;
      margin: 1rem;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 16px;
      z-index: 900;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .welcome {
      font-size: 0.95rem;
      color: var(--text-secondary);
    }

    .user-name {
      color: var(--text-primary);
      font-weight: 700;
    }

    .user-badge {
      background: rgba(124, 58, 237, 0.1);
      color: var(--accent-violet);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      border: 1px solid rgba(124, 58, 237, 0.2);
    }

    .btn-sm {
      padding: 0.5rem 1rem !important;
      font-size: 0.875rem !important;
    }

    .btn-logout {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: var(--transition);
    }

    .btn-logout:hover {
      color: #ff4444;
    }
  `]
})
export class HeaderComponent {
  constructor(public authService: AuthService) {}
}
