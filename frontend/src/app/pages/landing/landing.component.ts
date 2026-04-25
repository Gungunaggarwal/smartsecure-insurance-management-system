import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-page">
      <!-- Ambient Background Elements -->
      <div class="ambient-orb orb-1"></div>
      <div class="ambient-orb orb-2"></div>
      
      <header class="app-top-nav animate-fade">
        <div class="nav-brand">
          <div class="brand-icon"><i class="fas fa-shield-alt"></i></div>
          <span class="brand-text">Smart<span class="gradient-text">Secure</span></span>
        </div>
        <div class="nav-links">
          <ng-container *ngIf="!authService.isAuthenticated()">
            <a routerLink="/login" class="nav-link">Sign In</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Get Started</a>
          </ng-container>
          <ng-container *ngIf="authService.isAuthenticated()">
            <a [routerLink]="authService.isAdmin() ? '/admin' : '/dashboard'" class="btn btn-primary btn-sm">Go to Dashboard</a>
          </ng-container>
        </div>
      </header>

      <section class="hero animate-slide-up">
        <div class="hero-badge">New: Premium Features Available ✨</div>
        <h1 class="hero-title">Protect What Matters <br> <span class="gradient-text">Most to You.</span></h1>
        <p class="hero-subtitle">SmartSecure Insurance Management System – Seamless policy management, lightning-fast claims, and total peace of mind in one premium dashboard.</p>
        
        <div class="hero-actions">
          <ng-container *ngIf="!authService.isAuthenticated()">
            <a routerLink="/register" class="btn btn-primary btn-lg">
              Get Protected Now <i class="fas fa-arrow-right"></i>
            </a>
            <a routerLink="/login" class="btn btn-secondary btn-lg">
              Access Dashboard
            </a>
          </ng-container>
          <ng-container *ngIf="authService.isAuthenticated()">
            <a [routerLink]="authService.isAdmin() ? '/admin' : '/dashboard'" class="btn btn-primary btn-lg">
              Enter Command Center <i class="fas fa-arrow-right"></i>
            </a>
          </ng-container>
        </div>
        
        <div class="trust-indicators">
          <div class="trust-item"><i class="fas fa-check-circle"></i> 24/7 Support</div>
          <div class="trust-item"><i class="fas fa-check-circle"></i> Instant Claims</div>
          <div class="trust-item"><i class="fas fa-check-circle"></i> Secure platform</div>
        </div>
      </section>

      <section class="features animate-slide-up" style="animation-delay: 0.2s">
        <div class="glass-card feature-card">
          <div class="icon-wrap teal"><i class="fas fa-shield-alt"></i></div>
          <h3>Smart Policies</h3>
          <p>Browse and purchase tailored insurance policies with a single click. Smart recommendations for your unique needs.</p>
        </div>
        
        <div class="glass-card feature-card">
          <div class="icon-wrap violet"><i class="fas fa-bolt"></i></div>
          <h3>Fast Claims</h3>
          <p>Initiate claims with simple document uploads and track status in real-time with our automated processing.</p>
        </div>
        
        <div class="glass-card feature-card">
          <div class="icon-wrap blue"><i class="fas fa-lock"></i></div>
          <h3>Secure & Reliable</h3>
          <p>Enterprise-grade security protecting your data, your finances, and your future with end-to-end encryption.</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    /* Ambient Background Effects */
    .ambient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      z-index: -1;
      animation: float 20s infinite ease-in-out alternate;
    }
    .orb-1 {
      top: -10%; left: -10%;
      width: 50vw; height: 50vw;
      background: radial-gradient(circle, rgba(0,212,170,0.15), transparent 70%);
      animation-delay: -5s;
    }
    .orb-2 {
      bottom: -10%; right: -10%;
      width: 60vw; height: 60vw;
      background: radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%);
    }

    @keyframes float {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(5%, 5%) scale(1.1); }
    }

    /* Navigation */
    .app-top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 3rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-icon {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent-teal), var(--accent-violet));
      color: white;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 15px rgba(0,212,170,0.3);
    }

    .brand-text {
      font-family: var(--header-font);
      font-weight: 800;
      font-size: 1.25rem;
      letter-spacing: -0.02em;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-link {
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.95rem;
      transition: var(--transition);
    }
    .nav-link:hover { color: var(--text-primary); }

    /* Hero Section */
    .hero {
      text-align: center;
      padding: 6rem 2rem 4rem;
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero-badge {
      background: rgba(124,58,237,0.1);
      border: 1px solid rgba(124,58,237,0.2);
      color: var(--accent-violet);
      padding: 0.5rem 1rem;
      border-radius: 30px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 2rem;
      backdrop-filter: blur(4px);
    }

    .hero-title {
      font-size: 4.5rem;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      text-wrap: balance;
    }

    .hero-subtitle {
      font-size: 1.15rem;
      color: var(--text-secondary);
      margin-bottom: 3rem;
      text-wrap: balance;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .btn-lg {
      padding: 1.1rem 2.5rem;
      font-size: 1.05rem;
      border-radius: 12px;
    }

    .trust-indicators {
      display: flex;
      gap: 2rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .trust-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 600;
    }
    .trust-item i { color: var(--accent-teal); opacity: 0.8; }

    /* Features Grid */
    .features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 2rem 6rem;
    }

    .feature-card {
      padding: 2.5rem 2rem;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .feature-card:hover { transform: translateY(-10px); }

    .icon-wrap {
      width: 54px; height: 54px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .icon-wrap.teal { background: rgba(0,212,170,0.1); color: var(--accent-teal); }
    .icon-wrap.violet { background: rgba(124,58,237,0.1); color: var(--accent-violet); }
    .icon-wrap.blue { background: rgba(88,166,255,0.1); color: var(--accent-blue); }

    .feature-card h3 { font-size: 1.4rem; margin: 0; }
    .feature-card p { color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem; }

    /* Responsive */
    @media (max-width: 900px) {
      .features { grid-template-columns: 1fr; }
      .hero-title { font-size: 3.5rem; }
    }
    @media (max-width: 600px) {
      .app-top-nav { padding: 1.5rem 1.5rem; }
      .hero-title { font-size: 2.75rem; }
      .hero { padding-top: 4rem; }
      .hero-actions { flex-direction: column; width: 100%; }
      .btn-lg { width: 100%; }
    }
  `]
})
export class LandingComponent {
  constructor(public authService: AuthService) {}
}
