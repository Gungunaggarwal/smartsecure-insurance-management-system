import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ClaimsService } from '../../core/services/claims.service';
import { PolicyService } from '../../core/services/policy.service';
import { ClaimResponse } from '../../models/claim.model';
import { PolicyResponse } from '../../models/policy.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page animate-fade">
      <!-- Welcome Banner -->
      <section class="welcome-section glass-card">
        <div class="welcome-content">
          <div class="badge-row">
            <span class="status-indicator"><i class="fas fa-circle"></i> System Active</span>
            <span class="greeting-badge">{{ getGreeting() }}</span>
          </div>
          <h1 class="welcome-title">
            {{ authService.currentUser()?.name || authService.currentUser()?.username }}<span class="wave-emoji">👋</span>
          </h1>
          <p class="welcome-subtitle">Welcome back to SmartSecure. Your coverage is up to date and your assets are protected.</p>
        </div>
        <div class="welcome-visual">
          <div class="shield-ambient"><i class="fas fa-shield-alt"></i></div>
        </div>
      </section>

      <!-- Stats Grid -->
      <div class="stats-row">
        <div class="stat-pill-premium" [class.loading]="isLoading()">
          <div class="pill-icon teal"><i class="fas fa-layer-group"></i></div>
          <div class="pill-data">
            <span class="p-value">{{ isLoading() ? '—' : activePoliciesCount() }}</span>
            <span class="p-label">Active Policies</span>
          </div>
        </div>

        <div class="stat-pill-premium" [class.loading]="isLoading()">
          <div class="pill-icon violet"><i class="fas fa-file-signature"></i></div>
          <div class="pill-data">
            <span class="p-value">{{ isLoading() ? '—' : myClaimsCount() }}</span>
            <span class="p-label">Total Claims</span>
          </div>
        </div>

        <div class="stat-pill-premium" [class.loading]="isLoading()">
          <div class="pill-icon orange" [class.pulse]="pendingClaimsCount() > 0"><i class="fas fa-hourglass-half"></i></div>
          <div class="pill-data">
            <span class="p-value">{{ isLoading() ? '—' : pendingClaimsCount() }}</span>
            <span class="p-label">Pending Review</span>
          </div>
        </div>

        <div class="stat-pill-premium verified">
          <div class="pill-icon green"><i class="fas fa-user-shield"></i></div>
          <div class="pill-data">
            <span class="p-value highlight">Verified</span>
            <span class="p-label">Account Status</span>
          </div>
        </div>
      </div>

      <div class="dashboard-layout">
        <!-- Left Column -->
        <main class="main-column">
          <!-- Recent Claims -->
          <div class="glass-card feed-card">
            <div class="card-header">
              <div class="title-wrap">
                <i class="fas fa-stream accent"></i>
                <h3>Timeline of Claims</h3>
              </div>
              <a routerLink="/dashboard/claims" class="link-btn">History <i class="fas fa-arrow-right"></i></a>
            </div>

            <!-- Loading State -->
            <div *ngIf="isLoading()" class="skeleton-list">
              <div class="skel-item" *ngFor="let i of [1,2,3]"></div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!isLoading() && recentClaims().length === 0" class="empty-state">
              <div class="empty-box"><i class="fas fa-inbox"></i></div>
              <h4>No Activity Found</h4>
              <p>Your claims history is empty. You can initiate a claim for any active policy.</p>
              <button routerLink="/dashboard/claims/new" class="btn btn-primary btn-sm">Start New Claim</button>
            </div>

            <!-- List -->
            <div *ngIf="!isLoading() && recentClaims().length > 0" class="list-feed">
              <div *ngFor="let claim of recentClaims(); let i = index" 
                   class="claim-item-premium"
                   [style.animation-delay]="i * 100 + 'ms'">
                <div class="claim-meta">
                  <span class="c-id">#{{ claim.id }}</span>
                  <div class="c-info">
                    <span class="c-desc">{{ claim.description }}</span>
                    <span class="c-policy">Policy Reference: {{ claim.policyId }}</span>
                  </div>
                </div>
                <div class="c-status" [class]="claim.status.toLowerCase()">
                  <i class="fas" [class.fa-clock]="claim.status === 'PENDING'"
                                [class.fa-check-circle]="claim.status === 'APPROVED'"
                                [class.fa-times-circle]="claim.status === 'REJECTED'"></i>
                  {{ claim.status }}
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Right Column -->
        <aside class="side-column">
          <!-- Quick Actions -->
          <div class="glass-card actions-card">
            <div class="card-header">
              <div class="title-wrap"><i class="fas fa-bolt accent"></i> <h3>Operations</h3></div>
            </div>
            <div class="action-tiles">
              <a routerLink="/dashboard/policies" class="tile-premium">
                <div class="tile-icon t-teal"><i class="fas fa-search-plus"></i></div>
                <span>Policy List</span>
              </a>
              <a routerLink="/dashboard/claims/new" class="tile-premium">
                <div class="tile-icon t-violet"><i class="fas fa-plus"></i></div>
                <span>New Claim</span>
              </a>
              <a routerLink="/dashboard/claims" class="tile-premium">
                <div class="tile-icon t-orange"><i class="fas fa-history"></i></div>
                <span>Archives</span>
              </a>
              <a routerLink="/dashboard/profile" class="tile-premium">
                <div class="tile-icon t-blue"><i class="fas fa-user-cog"></i></div>
                <span>Account</span>
              </a>
            </div>
          </div>

          <!-- Mini Policy Discovery -->
          <div class="glass-card discovery-card">
            <div class="card-header">
              <div class="title-wrap"><i class="fas fa-sparkles accent"></i> <h3>Policy Discovery</h3></div>
              <a routerLink="/dashboard/policies" class="link-btn">All <i class="fas fa-arrow-right"></i></a>
            </div>
            
            <div class="mini-discovery-list">
              <div *ngFor="let p of recentPolicies()" class="mini-item-premium" [class]="'border-' + p.type.toLowerCase()">
                <div class="mi-icon">
                  <span class="p-id-tag">#{{ p.id }}</span>
                </div>
                <div class="mi-data">
                  <span class="mi-name">{{ p.name }}</span>
                  <span class="mi-tag">{{ p.type }}</span>
                </div>
                <span class="mi-price">₹{{ p.basePremium }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 1.5rem 0 3rem;
      max-width: 1300px;
      margin: 0 auto;
    }

    /* Welcome Banner */
    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3rem;
      margin-bottom: 2.5rem;
      background: linear-gradient(135deg, rgba(0, 212, 170, 0.08), rgba(124, 58, 237, 0.08));
      border: 1px solid rgba(255, 255, 255, 0.06);
      position: relative;
      overflow: hidden;
    }
    .welcome-section::after {
      content: ''; position: absolute; top: -50%; right: -10%; width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(0, 212, 170, 0.05), transparent 70%);
      pointer-events: none;
    }

    .badge-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .status-indicator { 
      font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
      display: flex; align-items: center; gap: 0.5rem; color: var(--accent-teal);
    }
    .status-indicator i { font-size: 0.5rem; animation: pulse 2s infinite; }
    .greeting-badge { 
      font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
      background: rgba(255, 255, 255, 0.05); padding: 0.25rem 0.75rem; border-radius: 20px;
      color: var(--text-muted);
    }

    .welcome-title { font-size: 3.5rem; margin-bottom: 0.75rem; font-weight: 800; }
    .wave-emoji { display: inline-block; animation: wave 2.5s infinite; transform-origin: 70% 70%; }
    @keyframes wave {
      0%, 100% { transform: rotate(0deg); }
      20% { transform: rotate(14deg); }
      40% { transform: rotate(-8deg); }
      60% { transform: rotate(14deg); }
    }
    .welcome-subtitle { font-size: 1.1rem; color: var(--text-secondary); max-width: 600px; line-height: 1.6; }

    .shield-ambient {
      width: 100px; height: 100px; background: rgba(255, 255, 255, 0.03);
      border-radius: 30px; display: flex; align-items: center; justify-content: center;
      font-size: 3rem; color: var(--accent-teal); opacity: 0.8;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    /* Stats Grid */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .stat-pill-premium {
      display: flex; align-items: center; gap: 1.25rem;
      padding: 1.5rem; background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 20px;
      transition: var(--transition-bounce);
    }
    .stat-pill-premium:hover { transform: translateY(-5px); border-color: rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.04); }

    .pill-icon {
      width: 48px; height: 48px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; font-size: 1.25rem;
    }
    .pill-icon.teal { background: rgba(0, 212, 170, 0.1); color: var(--accent-teal); }
    .pill-icon.violet { background: rgba(124, 58, 237, 0.1); color: var(--accent-violet); }
    .pill-icon.orange { background: rgba(255, 171, 0, 0.1); color: var(--accent-orange); }
    .pill-icon.green { background: rgba(34, 197, 94, 0.1); color: var(--accent-green); }

    .pill-data { display: flex; flex-direction: column; }
    .p-value { font-size: 1.8rem; font-weight: 800; font-family: var(--header-font); }
    .p-value.highlight { font-size: 1.1rem; color: var(--accent-green); text-transform: uppercase; margin-top: 0.25rem; }
    .p-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); opacity: 0.7; }

    /* Layout */
    .dashboard-layout { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: start; }

    .feed-card { padding: 2rem; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .title-wrap { display: flex; align-items: center; gap: 0.75rem; }
    .title-wrap h3 { font-size: 1.2rem; }
    .title-wrap .accent { color: var(--accent-teal); font-size: 1rem; }
    .link-btn { font-size: 0.85rem; font-weight: 800; color: var(--accent-teal); display: flex; align-items: center; gap: 0.5rem; }
    .link-btn:hover { gap: 0.75rem; }

    .list-feed { display: flex; flex-direction: column; gap: 1rem; }
    .claim-item-premium {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem; background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 16px;
      transition: var(--transition);
      animation: slideInUp 0.5s ease both;
    }
    .claim-item-premium:hover { background: rgba(255, 255, 255, 0.05); transform: translateX(5px); border-color: rgba(0, 212, 170, 0.2); }

    .claim-meta { display: flex; align-items: center; gap: 1.25rem; flex: 1; min-width: 0; }
    .c-id { 
      font-family: monospace; font-weight: 800; font-size: 0.75rem; color: var(--accent-teal);
      background: rgba(0, 212, 170, 0.08); padding: 0.35rem 0.6rem; border-radius: 6px;
    }
    .c-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
    .c-desc { font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .c-policy { font-size: 0.75rem; color: var(--text-muted); }

    .c-status { 
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 800; 
      text-transform: uppercase; padding: 0.4rem 0.8rem; border-radius: 30px;
    }
    .c-status.pending { background: rgba(255, 171, 0, 0.1); color: var(--accent-orange); }
    .c-status.approved { background: rgba(34, 197, 94, 0.1); color: var(--accent-green); }
    .c-status.rejected { background: rgba(255, 68, 68, 0.1); color: var(--accent-red); }

    /* Side Panel */
    .side-column { display: flex; flex-direction: column; gap: 2rem; }
    .actions-card { padding: 1.75rem; }
    .action-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .tile-premium {
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      padding: 1.5rem 1rem; background: rgba(255, 255, 255, 0.03);
      border-radius: 18px; border: 1px solid rgba(255, 255, 255, 0.05);
      transition: var(--transition-bounce); font-weight: 700; font-size: 0.8rem; color: var(--text-secondary);
    }
    .tile-premium:hover { transform: scale(1.05); background: rgba(255, 255, 255, 0.06); color: var(--text-primary); border-color: rgba(0, 212, 170, 0.2); }
    
    .tile-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
    .t-teal { background: rgba(0, 212, 170, 0.1); color: var(--accent-teal); }
    .t-violet { background: rgba(124, 58, 237, 0.1); color: var(--accent-violet); }
    .t-orange { background: rgba(255, 171, 0, 0.1); color: var(--accent-orange); }
    .t-blue { background: rgba(88, 166, 255, 0.1); color: var(--accent-blue); }

    .discovery-card { padding: 1.75rem; }
    .mini-discovery-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .mini-item-premium {
      display: flex; align-items: center; gap: 1rem; padding: 0.75rem;
      background: rgba(255, 255, 255, 0.03); border-radius: 14px;
      border-left: 3px solid transparent; transition: var(--transition);
    }
    .mini-item-premium:hover { background: rgba(255, 255, 255, 0.06); transform: translateX(5px); }
    
    .mi-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: var(--accent-teal); font-size: 0.9rem; }
    .p-id-tag { font-family: monospace; font-weight: 800; font-size: 0.7rem; color: var(--accent-teal); }
    .mi-data { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
    .mi-tag { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; }
    .mi-price { font-size: 0.85rem; font-weight: 800; color: var(--accent-teal); }

    .border-health { border-left-color: var(--accent-green); }
    .border-life { border-left-color: var(--accent-red); }
    .border-vehicle { border-left-color: var(--accent-blue); }
    .border-home { border-left-color: var(--accent-violet); }

    /* Utilities */
    .empty-state { text-align: center; padding: 3rem 1rem; }
    .empty-box { font-size: 3rem; opacity: 0.1; margin-bottom: 1rem; }
    .pulse { animation: pulse-shadow 2s infinite; }
    @keyframes pulse-shadow {
      0% { box-shadow: 0 0 0 0 rgba(255, 171, 0, 0.2); }
      70% { box-shadow: 0 0 0 10px rgba(255, 171, 0, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 171, 0, 0); }
    }

    @media (max-width: 1200px) {
      .stats-row { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 1000px) {
      .dashboard-layout { grid-template-columns: 1fr; }
      .side-column { flex-direction: row; flex-wrap: wrap; }
      .actions-card, .discovery-card { flex: 1; min-width: 300px; }
    }
    @media (max-width: 640px) {
      .welcome-section { padding: 2rem; }
      .welcome-title { font-size: 2.2rem; }
      .welcome-visual { display: none; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  activePoliciesCount = signal<number>(0);
  myClaimsCount = signal<number>(0);
  pendingClaimsCount = signal<number>(0);
  recentClaims = signal<ClaimResponse[]>([]);
  recentPolicies = signal<PolicyResponse[]>([]);
  isLoading = signal<boolean>(true);
  private dataLoaded = false;

  constructor(
    public authService: AuthService,
    private claimsService: ClaimsService,
    private policyService: PolicyService
  ) {
    // React to user signal changes to handle background-fetch race condition
    effect(() => {
      const user = this.authService.currentUser();
      if (user && user.username && !this.dataLoaded) {
        this.dataLoaded = true;
        this.fetchData(user.username);
      }
    });
  }

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user && user.username) {
      this.dataLoaded = true;
      this.fetchData(user.username);
    }
  }

  private fetchData(username: string) {
    this.isLoading.set(true);

    forkJoin({
      claims: this.claimsService.getUserClaims(username),
      policies: this.policyService.getPolicies()
    }).subscribe({
      next: ({ claims, policies }) => {
        this.recentClaims.set(claims.slice(0, 5));
        this.myClaimsCount.set(claims.length);
        this.pendingClaimsCount.set(claims.filter(c => c.status === 'PENDING').length);
        this.activePoliciesCount.set(policies.length);
        this.recentPolicies.set(policies.slice(0, 4));
        this.isLoading.set(false);
      },
      error: () => {
        // Try loading individually as fallback
        this.claimsService.getUserClaims(username).subscribe({
          next: (claims) => {
            this.recentClaims.set(claims.slice(0, 5));
            this.myClaimsCount.set(claims.length);
            this.pendingClaimsCount.set(claims.filter(c => c.status === 'PENDING').length);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });

        this.policyService.getPolicies().subscribe({
          next: (policies) => {
            this.activePoliciesCount.set(policies.length);
            this.recentPolicies.set(policies.slice(0, 4));
          },
          error: () => {}
        });
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'HEALTH': return 'fas fa-heartbeat';
      case 'LIFE': return 'fas fa-heart';
      case 'VEHICLE': return 'fas fa-car';
      case 'HOME': return 'fas fa-home';
      default: return 'fas fa-shield-alt';
    }
  }
}
