import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-brand" routerLink="/">
        <div class="brand-icon"><i class="fas fa-shield-alt"></i></div>
      </div>
      
      <div class="auth-container animate-fade">
        <div class="glass-card auth-card">
          <div class="auth-header">
            <h2 class="auth-title">Welcome <span class="gradient-text">Back</span></h2>
            <p class="auth-subtitle">Sign in to access your premium insurance portal.</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input type="email" formControlName="email" class="form-control with-icon" placeholder="john@example.com">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input type="password" formControlName="password" class="form-control with-icon" placeholder="••••••••">
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-submit" [disabled]="loginForm.invalid || isLoading">
              <span *ngIf="!isLoading">Secure Login <i class="fas fa-arrow-right"></i></span>
              <span *ngIf="isLoading"><i class="fas fa-spinner fa-spin"></i> Authenticating...</span>
            </button>
          </form>

          <p class="auth-footer">
            Don't have an account? <a routerLink="/register">Create Account</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .auth-brand {
      position: absolute;
      top: 2rem;
      left: 2rem;
      cursor: pointer;
    }

    .brand-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--accent-teal), var(--accent-violet));
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem;
      box-shadow: 0 4px 15px rgba(0,212,170,0.3);
      transition: var(--transition);
    }
    .brand-icon:hover { transform: scale(1.05); }

    .auth-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 3rem 2.5rem;
      position: relative;
    }

    .auth-card::before {
      content: '';
      position: absolute;
      top: -2px; left: -2px; right: -2px; bottom: -2px;
      background: linear-gradient(135deg, rgba(0,212,170,0.3), rgba(124,58,237,0.3));
      z-index: -1;
      border-radius: 18px;
      filter: blur(10px);
      opacity: 0.5;
    }

    .auth-header { text-align: center; margin-bottom: 2.5rem; }
    
    .auth-title { font-size: 2.2rem; margin-bottom: 0.5rem; }
    .auth-subtitle { color: var(--text-secondary); font-size: 0.95rem; }

    .auth-form { display: flex; flex-direction: column; gap: 0.5rem; }

    .input-wrapper { position: relative; }
    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 0.9rem;
      transition: var(--transition);
      pointer-events: none;
    }
    
    .form-control.with-icon { padding-left: 2.75rem; }
    .form-control.with-icon:focus + .input-icon { color: var(--accent-teal); }

    .btn-submit {
      width: 100%;
      height: 3.2rem;
      margin-top: 1rem;
      font-size: 1rem;
    }

    .auth-footer {
      margin-top: 2.5rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .auth-footer a {
      color: var(--accent-teal);
      text-decoration: none;
      font-weight: 700;
      transition: var(--transition);
    }
    .auth-footer a:hover { color: var(--accent-blue); }

    @media (max-width: 480px) {
      .auth-card { padding: 2rem 1.5rem; }
      .auth-brand { top: 1.5rem; left: 1.5rem; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.show('Logged in successfully!', 'success');
          // Route ADMIN users to the admin panel, others to dashboard
          const role = this.authService.currentUser()?.role;
          const target = role === 'ADMIN' ? '/admin' : '/dashboard';
          this.router.navigate([target]);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Login error:', err);
          
          let errorMsg = 'Login failed. Check your email and password.';
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error && typeof err.error === 'object') {
            errorMsg = err.error.message || Object.values(err.error)[0] as string || errorMsg;
          }
          
          this.toastService.show(errorMsg, 'error');
        }
      });
    }
  }
}
