import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="app-header glass">
      <div class="header-left">
        <!-- Optional space for breadcrumbs or page title -->
      </div>
      
      <div class="header-actions">
        <ng-container *ngIf="!authService.isAuthenticated()">
          <a routerLink="/login" class="btn btn-secondary btn-sm">Sign In</a>
          <a routerLink="/register" class="btn btn-primary btn-sm">Get Started</a>
        </ng-container>
        
        <ng-container *ngIf="authService.isAuthenticated()">
          <div class="user-chip" routerLink="/dashboard/profile" title="View Profile">
            <div class="chip-avatar">{{ getUserInitial() }}</div>
            <div class="chip-info">
              <span class="chip-name">{{ authService.currentUser()?.name || authService.currentUser()?.username }}</span>
              <span class="chip-role" [class.admin]="authService.isAdmin()">{{ authService.currentUser()?.role }}</span>
            </div>
          </div>
          
          <div class="header-divider"></div>
          
          <button (click)="authService.logout()" class="btn-logout" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </ng-container>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      height: 72px;
      margin: 1.5rem 2rem 2rem;
      padding: 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 16px;
      z-index: 900;
      background: rgba(15, 21, 32, 0.6);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* User Chip */
    .user-chip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.4rem 0.5rem;
      border-radius: 30px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid transparent;
      cursor: pointer;
      transition: var(--transition);
    }

    .user-chip:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .chip-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-teal), var(--accent-blue));
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
    }

    .chip-info {
      display: flex;
      flex-direction: column;
      padding-right: 0.5rem;
    }

    .chip-name {
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .chip-role {
      font-size: 0.65rem;
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .chip-role.admin { color: var(--accent-violet); }

    .header-divider {
      width: 1px;
      height: 24px;
      background: var(--glass-border);
    }

    .btn-logout {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(255, 68, 68, 0.05);
      border: 1px solid transparent;
      color: var(--accent-red);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition);
      font-size: 1.1rem;
    }

    .btn-logout:hover {
      background: rgba(255, 68, 68, 0.15);
      border-color: rgba(255, 68, 68, 0.3);
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .app-header { margin: 1rem; }
      .chip-name, .chip-role { display: none; }
      .user-chip { padding: 0; background: none; border: none; }
    }
  `]
})
export class HeaderComponent {
  constructor(public authService: AuthService) {}

  getUserInitial(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return (user.name || user.username || '?').charAt(0).toUpperCase();
  }
}
