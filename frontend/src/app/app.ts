import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar.component';
import { HeaderComponent } from './shared/components/header.component';
import { ToastService } from './core/services/toast.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout" [class.no-auth]="!authService.isAuthenticated()">
      <app-sidebar *ngIf="authService.isAuthenticated()"></app-sidebar>
      
      <div class="main-content">
        <app-header></app-header>
        
        <main class="router-main">
          <router-outlet></router-outlet>
        </main>

        <footer class="app-footer">
          <p>&copy; 2026 SmartSecure Insurance Management. Advanced Portal.</p>
        </footer>
      </div>

      <!-- Toast Container -->
      <div class="toast-container">
        <div *ngFor="let toast of toastService.toasts()" 
             class="toast animate-slide-up" 
             [class]="toast.type">
          <div class="toast-icon">
            <i [class]="getIcon(toast.type)"></i>
          </div>
          <div class="toast-msg">{{ toast.message }}</div>
          <button class="toast-close" (click)="toastService.remove(toast.id)">&times;</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-primary);
    }

    .app-layout.no-auth {
      display: block;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 280px; /* Sidebar width */
      transition: var(--transition);
      min-height: 100vh;
    }

    .no-auth .main-content {
      margin-left: 0;
    }

    .router-main {
      flex: 1;
      padding: 1rem 2rem;
    }

    .app-footer {
      padding: 2rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    /* Toast styles */
    .toast-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      z-index: 2000;
    }

    .toast {
      background: var(--bg-secondary);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(10px);
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 300px;
      box-shadow: var(--shadow-lg);
    }

    .toast.success { border-left: 4px solid var(--accent-teal); }
    .toast.error { border-left: 4px solid #ff4444; }
    .toast.info { border-left: 4px solid var(--accent-blue); }

    .toast-icon { font-size: 1.25rem; }
    .success .toast-icon { color: var(--accent-teal); }
    .error .toast-icon { color: #ff4444; }
    .info .toast-icon { color: var(--accent-blue); }

    .toast-msg { flex: 1; font-weight: 500; font-size: 0.9rem; }
    .toast-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.2rem; }

    @media (max-width: 768px) {
      .main-content { margin-left: 0; }
    }
  `]
})
export class AppComponent {
  constructor(
    public authService: AuthService,
    public toastService: ToastService
  ) {}

  getIcon(type: string): string {
    switch(type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      default: return 'fas fa-info-circle';
    }
  }
}
