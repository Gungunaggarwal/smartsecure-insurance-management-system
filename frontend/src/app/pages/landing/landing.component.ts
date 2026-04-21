import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-page">
      <section class="hero animate-slide-up">
        <h1 class="hero-title">Protect What Matters <br> <span class="gradient-text">Most to You.</span></h1>
        <p class="hero-subtitle">SmartSecure Insurance Management System – Seamless policy management, lightning-fast claims, and total peace of mind in one premium dashboard.</p>
        
        <div class="hero-actions">
          <a routerLink="/register" class="btn btn-primary btn-lg">Get Started Now</a>
          <a routerLink="/login" class="btn btn-secondary btn-lg">User Login</a>
        </div>
      </section>

      <section class="features animate-fade">
        <div class="glass-card feature-card">
          <div class="icon">🛡️</div>
          <h3>Smart Policies</h3>
          <p>Browse and purchase tailored insurance policies with a single click.</p>
        </div>
        
        <div class="glass-card feature-card">
          <div class="icon">⚡</div>
          <h3>Fast Claims</h3>
          <p>Initiate claims with document upload and track status in real-time.</p>
        </div>
        
        <div class="glass-card feature-card">
          <div class="icon">🔒</div>
          <h3>Secure & Reliable</h3>
          <p>Enterprise-grade security protecting your data and your future.</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      padding: 4rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    .hero {
      margin-bottom: 6rem;
    }

    .hero-title {
      font-size: 4rem;
      line-height: 1.1;
      margin-bottom: 1.5rem;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--text-secondary);
      max-width: 800px;
      margin: 0 auto 2.5rem;
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
    }

    .btn-lg {
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      padding: 3rem 2rem;
      text-align: center;
    }

    .icon {
      font-size: 3rem;
      margin-bottom: 1.5rem;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--accent-teal);
    }

    .feature-card p {
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-actions {
        flex-direction: column;
      }
    }
  `]
})
export class LandingComponent {}
