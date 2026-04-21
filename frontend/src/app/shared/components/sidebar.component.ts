import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar glass" [class.collapsed]="isCollapsed">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">S</div>
          <span class="logo-text" *ngIf="!isCollapsed">Smart<span class="gradient-text">Secure</span></span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <i class="fas fa-home"></i>
              <span *ngIf="!isCollapsed">Home</span>
            </a>
          </li>
          
          <ng-container *ngIf="authService.isAuthenticated()">
            <li class="nav-label" *ngIf="!isCollapsed">Dashboard</li>
            
            <li *ngIf="!authService.isAdmin()">
              <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="fas fa-th-large"></i>
                <span *ngIf="!isCollapsed">Overview</span>
              </a>
            </li>
            <li *ngIf="!authService.isAdmin()">
              <a routerLink="/dashboard/policies" routerLinkActive="active">
                <i class="fas fa-shield-alt"></i>
                <span *ngIf="!isCollapsed">My Policies</span>
              </a>
            </li>
            <li *ngIf="!authService.isAdmin()">
              <a routerLink="/dashboard/claims/new" routerLinkActive="active">
                <i class="fas fa-file-invoice"></i>
                <span *ngIf="!isCollapsed">File a Claim</span>
              </a>
            </li>

            <ng-container *ngIf="authService.isAdmin() && !isCollapsed">
              <li class="nav-label">Admin</li>
            </ng-container>
            <li *ngIf="authService.isAdmin()">
              <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="fas fa-user-shield"></i>
                <span *ngIf="!isCollapsed">System Stats</span>
              </a>
            </li>
          </ng-container>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button class="collapse-btn" (click)="toggleCollapse()">
          <i [class]="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      transition: var(--transition);
      z-index: 1000;
      border-radius: 0 24px 24px 0;
      border-left: none;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar-header {
      padding: 2rem 1.5rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--accent-teal), var(--accent-violet));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #000;
      font-size: 1.25rem;
    }

    .logo-text {
      font-family: var(--header-font);
      font-weight: 800;
      font-size: 1.25rem;
      white-space: nowrap;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem;
    }

    .sidebar-nav ul {
      list-style: none;
    }

    .nav-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--text-muted);
      margin: 1.5rem 0.75rem 0.5rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .sidebar-nav li a {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1rem;
      border-radius: 12px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: var(--transition);
      margin-bottom: 0.25rem;
    }

    .sidebar-nav li a:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }

    .sidebar-nav li a.active {
      background: rgba(0, 212, 170, 0.1);
      color: var(--accent-teal);
      border: 1px solid rgba(0, 212, 170, 0.2);
    }

    .sidebar-nav li a i {
      width: 20px;
      text-align: center;
      font-size: 1.1rem;
    }

    .sidebar-footer {
      padding: 1.5rem;
      display: flex;
      justify-content: center;
    }

    .collapse-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--glass-border);
      color: var(--text-secondary);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }

    .collapse-btn:hover {
      background: var(--accent-teal);
      color: #000;
    }
  `]
})
export class SidebarComponent {
  isCollapsed = false;
  constructor(public authService: AuthService) {}

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
}
