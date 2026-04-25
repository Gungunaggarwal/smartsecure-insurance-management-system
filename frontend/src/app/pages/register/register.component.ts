import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
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
            <h2 class="auth-title">Secure <span class="gradient-text">Account</span></h2>
            <p class="auth-subtitle">Join SmartSecure today and get premium protection.</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">Full Name</label>
                <div class="input-wrapper">
                  <i class="fas fa-user input-icon"></i>
                  <input type="text" formControlName="name" class="form-control with-icon" placeholder="John Doe">
                </div>
              </div>
              <div class="form-group half">
                <label class="form-label">Username</label>
                <div class="input-wrapper">
                  <i class="fas fa-at input-icon"></i>
                  <input type="text" formControlName="username" class="form-control with-icon" placeholder="johndoe">
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-group">
                <div class="input-wrapper" style="flex: 1">
                  <i class="fas fa-envelope input-icon"></i>
                  <input type="email" formControlName="email" class="form-control with-icon" placeholder="john@example.com">
                </div>
                <button type="button" class="btn btn-secondary btn-otp" (click)="sendOtp()" [disabled]="registerForm.get('email')?.invalid || isSendingOtp || isOtpSent">
                   <span *ngIf="!isSendingOtp">{{ isOtpSent ? 'Sent' : 'Get OTP' }}</span>
                   <span *ngIf="isSendingOtp"><i class="fas fa-spinner fa-spin"></i></span>
                </button>
              </div>
            </div>

            <div class="form-group animate-fade" *ngIf="isOtpSent">
              <label class="form-label">Verification Code (OTP)</label>
              <div class="input-wrapper">
                <i class="fas fa-key input-icon"></i>
                <input type="text" formControlName="otp" class="form-control with-icon" placeholder="Enter 6-digit code">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input type="password" formControlName="password" class="form-control with-icon" placeholder="••••••••">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">Phone</label>
                <div class="input-wrapper">
                  <i class="fas fa-phone-alt input-icon"></i>
                  <input type="text" formControlName="phone" class="form-control with-icon" placeholder="+1...">
                </div>
              </div>
              <div class="form-group half">
                <label class="form-label">Role</label>
                <div class="input-wrapper">
                  <select formControlName="role" class="form-control">
                    <option value="USER">Customer</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Address</label>
              <div class="input-wrapper">
                <i class="fas fa-map-marker-alt input-icon" style="top: 1.25rem; transform: none"></i>
                <textarea formControlName="address" class="form-control with-icon" rows="2" placeholder="123 Smart St..."></textarea>
              </div>
            </div>

            <div class="form-group animate-fade" *ngIf="registerForm.get('role')?.value === 'ADMIN'">
              <label class="form-label">Admin Security Key</label>
              <div class="input-wrapper">
                <i class="fas fa-shield-check input-icon"></i>
                <input type="password" formControlName="adminKey" class="form-control with-icon" placeholder="Enter ADMIN key">
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-submit" [disabled]="registerForm.invalid || isLoading || (isOtpSent && !registerForm.get('otp')?.value) || (registerForm.get('role')?.value === 'ADMIN' && !registerForm.get('adminKey')?.value)">
              <span *ngIf="!isLoading">Register Account <i class="fas fa-arrow-right"></i></span>
              <span *ngIf="isLoading"><i class="fas fa-spinner fa-spin"></i> Processing...</span>
            </button>
          </form>

          <p class="auth-footer">
            Already have an account? <a routerLink="/login">Sign In</a>
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

    .input-group {
      display: flex;
      gap: 0.5rem;
    }

    .btn-otp {
      padding: 0 1rem;
      white-space: nowrap;
      font-size: 0.8rem;
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
      padding: 2.5rem 2rem;
    }

    .auth-card {
      width: 100%;
      max-width: 600px;
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

    .auth-header { text-align: center; margin-bottom: 2rem; }
    
    .auth-title { font-size: 2.2rem; margin-bottom: 0.5rem; }
    .auth-subtitle { color: var(--text-secondary); font-size: 0.95rem; }

    .auth-form { display: flex; flex-direction: column; gap: 0.25rem; }

    .form-row { display: flex; gap: 1rem; }
    .half { flex: 1; }

    .input-wrapper { position: relative; }
    .input-icon {
      position: absolute;
      left: 1.1rem;
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
      margin-top: 2rem;
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

    @media (max-width: 640px) {
      .auth-card { padding: 2.5rem 1.5rem; }
      .form-row { flex-direction: column; gap: 0; }
    }
    @media (max-width: 480px) {
      .auth-brand { top: 1.5rem; left: 1.5rem; }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  isOtpSent = false;
  isSendingOtp = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      otp: [''], // Initially not required, made required when isOtpSent is true
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      role: ['USER', Validators.required],
      adminKey: ['']
    });
  }

  sendOtp() {
    const email = this.registerForm.get('email')?.value;
    if (email && this.registerForm.get('email')?.valid) {
      this.isSendingOtp = true;
      this.authService.sendOtp(email).subscribe({
        next: () => {
          this.isOtpSent = true;
          this.isSendingOtp = false;
          this.registerForm.get('otp')?.setValidators([Validators.required, Validators.minLength(6)]);
          this.registerForm.get('otp')?.updateValueAndValidity();
          this.toastService.show('Verification code sent to ' + email, 'success');
        },
        error: (err) => {
          this.isSendingOtp = false;
          this.toastService.show('Failed to send OTP code.', 'error');
        }
      });
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      if (!this.isOtpSent) {
        this.toastService.show('Please verify your email with OTP first.', 'info');
        return;
      }

      this.isLoading = true;
      const registerData = { ...this.registerForm.value };
      
      // Validate Admin Key if role is ADMIN
      if (registerData.role === 'ADMIN' && registerData.adminKey !== 'ADMIN') {
        this.isLoading = false;
        this.toastService.show('Invalid Admin Security Key!', 'error');
        return;
      }

      // Remove adminKey from payload before sending to backend
      delete registerData.adminKey;

      // Register directly (backend will verify the OTP)
      this.authService.register(registerData).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.show('Account created successfully!', 'success');
          const role = this.authService.currentUser()?.role;
          const target = role === 'ADMIN' ? '/admin' : '/dashboard';
          this.router.navigate([target]);
        },
        error: (err) => {
          this.isLoading = false;
          this.handleError(err);
        }
      });
    }
  }

  private handleError(err: any) {
    console.error('Operation error:', err);
    let errorMsg = 'Operation failed.';
    if (typeof err.error === 'string') {
      errorMsg = err.error;
    } else if (err.error && typeof err.error === 'object') {
      errorMsg = err.error.message || Object.values(err.error)[0] as string || errorMsg;
    }
    this.toastService.show(errorMsg, 'error');
  }
}
