import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar glass" [class.collapsed]="isCollapsed()">

      <!-- Logo -->
      <div class="sidebar-header">
        <div class="logo-wrap" routerLink="/">
          <div class="logo-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="logo-text" *ngIf="!isCollapsed()">
            <span class="logo-brand">Smart<span class="gradient-text">Secure</span></span>
            <span class="logo-sub">Insurance Portal</span>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">

        <!-- User routes -->
        <ng-container *ngIf="!authService.isAdmin()">
          <div class="nav-section">
            <span class="nav-label" *ngIf="!isCollapsed()">Main</span>
            <ul>
              <li>
                <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" [title]="isCollapsed() ? 'Overview' : ''">
                  <div class="nav-icon-wrap"><i class="fas fa-th-large"></i></div>
                  <span class="nav-text" *ngIf="!isCollapsed()">Overview</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <span class="nav-label" *ngIf="!isCollapsed()">Insurance</span>
            <ul>
              <li>
                <a routerLink="/dashboard/policies" routerLinkActive="active" [title]="isCollapsed() ? 'Policies' : ''">
                  <div class="nav-icon-wrap"><i class="fas fa-shield-alt"></i></div>
                  <span class="nav-text" *ngIf="!isCollapsed()">Browse Policies</span>
                </a>
              </li>
              <li>
                <a routerLink="/dashboard/my-policies" routerLinkActive="active" [title]="isCollapsed() ? 'My Policies' : ''">
                  <div class="nav-icon-wrap"><i class="fas fa-id-card"></i></div>
                  <span class="nav-text" *ngIf="!isCollapsed()">My Policies</span>
                </a>
              </li>
              <li>
                <a routerLink="/dashboard/claims" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" [title]="isCollapsed() ? 'My Claims' : ''">
                  <div class="nav-icon-wrap"><i class="fas fa-file-invoice"></i></div>
                  <span class="nav-text" *ngIf="!isCollapsed()">My Claims</span>
                </a>
              </li>
              <li>
                <a routerLink="/dashboard/claims/new" routerLinkActive="active" [title]="isCollapsed() ? 'File a Claim' : ''">
                  <div class="nav-icon-wrap"><i class="fas fa-plus-circle"></i></div>
                  <span class="nav-text" *ngIf="!isCollapsed()">File a Claim</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <span class="nav-label" *ngIf="!isCollapsed()">Account</span>
            <ul>
              <li>
                <a routerLink="/dashboard/profile" routerLinkActive="active" [title]="isCollapsed() ? 'Profile' : ''">
                  <div class="nav-icon-wrap"><i class="fas fa-user-circle"></i></div>
                  <span class="nav-text" *ngIf="!isCollapsed()">My Profile</span>
                </a>
              </li>
            </ul>
          </div>
        </ng-container>

        <!-- Admin routes -->
        <ng-container *ngIf="authService.isAdmin()">
          <div class="nav-section">
            <span class="nav-label" *ngIf="!isCollapsed()">Administration</span>
            <ul>
              <li>
                <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" [title]="isCollapsed() ? 'Control Panel' : ''">
                  <div class="nav-icon-wrap"><i class="fas fa-user-shield"></i></div>
                  <span class="nav-text" *ngIf="!isCollapsed()">Control Panel</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <span class="nav-label" *ngIf="!isCollapsed()">Quick Links</span>
            <ul>
              <li>
                <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" [title]="isCollapsed() ? 'Home' : ''">
                  <div class="nav-icon-wrap"><i class="fas fa-home"></i></div>
                  <span class="nav-text" *ngIf="!isCollapsed()">Home</span>
                </a>
              </li>
            </ul>
          </div>
        </ng-container>
      </nav>

      <!-- User Profile at Bottom -->
      <div class="sidebar-user" *ngIf="!isCollapsed() && authService.currentUser()">
        <div class="user-avatar">
          {{ getUserInitial() }}
        </div>
        <div class="user-meta">
          <span class="user-name-text">{{ authService.currentUser()?.name || authService.currentUser()?.username }}</span>
          <span class="user-role-tag" [class.admin]="authService.isAdmin()">
            {{ authService.currentUser()?.role }}
          </span>
        </div>
      </div>

      <!-- Collapse Toggle -->
      <div class="sidebar-footer">
        <button class="collapse-btn" (click)="toggleCollapse()" [title]="isCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'">
          <i class="fas" [class.fa-chevron-left]="!isCollapsed()" [class.fa-chevron-right]="isCollapsed()"></i>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      border-radius: 0 24px 24px 0;
      border-left: none;
      border-top: none;
      border-bottom: none;
      background: rgba(9, 14, 22, 0.95);
      overflow: hidden;
    }

    .sidebar.collapsed { width: 72px; }

    /* Header */
    .sidebar-header {
      padding: 1.5rem 1rem;
      border-bottom: 1px solid var(--glass-border);
    }

    .logo-wrap {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      cursor: pointer;
      text-decoration: none;
    }

    .logo-icon {
      width: 42px;
      height: 42px;
      min-width: 42px;
      background: linear-gradient(135deg, var(--accent-teal), var(--accent-violet));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      color: white;
      box-shadow: 0 4px 14px rgba(0, 212, 170, 0.3);
    }

    .logo-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .logo-brand {
      font-family: var(--header-font);
      font-weight: 800;
      font-size: 1.1rem;
      white-space: nowrap;
    }

    .logo-sub {
      font-size: 0.65rem;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }

    /* Nav */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-section { margin-bottom: 0.5rem; }

    .nav-label {
      display: block;
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      font-weight: 700;
      padding: 0.75rem 0.75rem 0.4rem;
    }

    .sidebar-nav ul { list-style: none; }

    .sidebar-nav li a {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.75rem 0.875rem;
      border-radius: 12px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: var(--transition);
      margin-bottom: 0.15rem;
      white-space: nowrap;
      overflow: hidden;
      position: relative;
    }

    .sidebar-nav li a:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }

    .sidebar-nav li a.active {
      background: linear-gradient(90deg, rgba(0,212,170,0.12), rgba(0,212,170,0.04));
      color: var(--accent-teal);
      border: 1px solid rgba(0, 212, 170, 0.15);
    }

    .sidebar-nav li a.active .nav-icon-wrap {
      color: var(--accent-teal);
    }

    .nav-icon-wrap {
      width: 20px;
      min-width: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
    }

    .nav-text { flex: 1; }

    .nav-badge {
      background: linear-gradient(135deg, var(--accent-teal), var(--accent-blue));
      color: #000;
      font-size: 0.6rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* User info */
    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--glass-border);
      margin: 0 0.5rem;
      border-radius: 12px;
      background: rgba(255,255,255,0.02);
      overflow: hidden;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent-teal), var(--accent-violet));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
      color: white;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }

    .user-name-text {
      font-size: 0.85rem;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-role-tag {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-blue);
      background: rgba(88, 166, 255, 0.1);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }
    .user-role-tag.admin {
      color: var(--accent-violet);
      background: rgba(124, 58, 237, 0.12);
    }

    /* Footer */
    .sidebar-footer {
      padding: 1rem;
      display: flex;
      justify-content: center;
    }

    .collapse-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--glass-border);
      color: var(--text-secondary);
      width: 36px;
      height: 36px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      transition: var(--transition);
    }

    .collapse-btn:hover {
      background: rgba(0, 212, 170, 0.1);
      border-color: rgba(0, 212, 170, 0.3);
      color: var(--accent-teal);
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
    }
  `]
})
export class SidebarComponent {
  isCollapsed = signal<boolean>(false);

  constructor(public authService: AuthService) {}

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  getUserInitial(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return (user.name || user.username || '?').charAt(0).toUpperCase();
  }
}
