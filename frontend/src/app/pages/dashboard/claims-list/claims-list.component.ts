import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClaimsService } from '../../../core/services/claims.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClaimResponse } from '../../../models/claim.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="claims-page animate-fade">
      <header class="page-header">
        <div class="title-area">
          <h1>Track My <span class="gradient-text">Claims</span></h1>
          <p>Real-time updates on your submitted insurance requests.</p>
        </div>
        <button routerLink="/dashboard/claims/new" class="btn btn-primary">
          <i class="fas fa-plus-circle"></i> File New Claim
        </button>
      </header>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="claims-grid skeleton-grid">
        <div *ngFor="let i of [1,2,3,4]" class="skeleton-card">
          <div class="skel-header"></div>
          <div class="skel-line"></div>
          <div class="skel-line short"></div>
          <div class="skel-btn"></div>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="!isLoading()" class="claims-content">
        <!-- Empty State -->
        <div *ngIf="claims().length === 0" class="empty-state glass-card">
          <div class="empty-icon"><i class="fas fa-file-invoice"></i></div>
          <h3>No Active Claims</h3>
          <p>You haven't submitted any insurance claims yet. Protection is just a few clicks away.</p>
          <button routerLink="/dashboard/claims/new" class="btn btn-secondary">
            Get Started with a Claim
          </button>
        </div>

        <!-- Claims Grid -->
        <div class="claims-grid" *ngIf="claims().length > 0">
          <div *ngFor="let claim of claims(); let i = index" 
               class="glass-card claim-card"
               [style.animation-delay]="i * 100 + 'ms'">
            
            <div class="card-status-bar" [class]="claim.status.toLowerCase()"></div>
            
            <div class="card-header">
              <div class="claim-ref">
                <span class="ref-label">Reference</span>
                <span class="ref-value">#{{ claim.id }}</span>
              </div>
              <div class="status-badge" [class]="claim.status.toLowerCase()">
                <i class="fas" [class.fa-clock]="claim.status === 'PENDING'" 
                             [class.fa-check-circle]="claim.status === 'APPROVED'" 
                             [class.fa-times-circle]="claim.status === 'REJECTED'"></i>
                {{ claim.status }}
              </div>
            </div>
            
            <div class="card-body">
              <div class="policy-link-info">
                <div class="info-icon"><i class="fas fa-shield-alt"></i></div>
                <div class="info-text">
                  <span class="label">Associated Policy</span>
                  <span class="value">Policy ID: {{ claim.policyId }}</span>
                </div>
              </div>
              
              <div class="claim-desc">
                <span class="label">Claim Description</span>
                <p>{{ claim.description || 'No description provided.' }}</p>
              </div>
            </div>

            <div class="card-footer">
              <div class="attachment-info" *ngIf="claim.documentPath">
                <i class="fas fa-paperclip"></i>
                <span>Receipt Attached</span>
              </div>
              <div class="attachment-info no-docs" *ngIf="!claim.documentPath">
                <i class="fas fa-info-circle"></i>
                <span>No Documents</span>
              </div>
              
              <button [routerLink]="['/dashboard/claims', claim.id]" class="btn-detail">
                View Timeline <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .claims-page {
      padding: 1rem 0 3rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 3rem;
    }

    .title-area h1 { font-size: 2.8rem; margin-bottom: 0.5rem; }
    .title-area p { color: var(--text-secondary); font-size: 1rem; }

    /* Claims Grid */
    .claims-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2rem;
    }

    /* Claim Card */
    .claim-card {
      position: relative;
      padding: 2.25rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      border: 1px solid rgba(255,255,255,0.04);
      background: linear-gradient(145deg, rgba(15, 21, 32, 0.8) 0%, rgba(8, 12, 20, 0.5) 100%);
      overflow: hidden;
      transition: var(--transition-bounce);
      animation: slideUp 0.6s ease-out both;
    }

    .claim-card:hover {
      transform: translateY(-8px);
      border-color: rgba(0, 212, 170, 0.15);
      background: linear-gradient(145deg, rgba(15, 21, 32, 0.95) 0%, rgba(8, 12, 20, 0.8) 100%);
    }

    .card-status-bar {
      position: absolute;
      top: 0; left: 0; bottom: 0;
      width: 4px;
      opacity: 0.8;
    }
    .card-status-bar.pending { background: var(--accent-orange); }
    .card-status-bar.approved { background: var(--accent-green); }
    .card-status-bar.rejected { background: var(--accent-red); }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .claim-ref { display: flex; flex-direction: column; gap: 0.2rem; }
    .ref-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
    .ref-value { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); font-family: var(--header-font); }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.4rem 0.8rem;
      border-radius: 30px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-badge.pending { background: var(--accent-orange-dim); color: var(--accent-orange); border: 1px solid rgba(255,171,0,0.2); }
    .status-badge.approved { background: var(--accent-green-dim); color: var(--accent-green); border: 1px solid rgba(34,197,94,0.2); }
    .status-badge.rejected { background: rgba(255,68,68,0.1); color: var(--accent-red); border: 1px solid rgba(255,68,68,0.2); }

    /* Card Body */
    .card-body { display: flex; flex-direction: column; gap: 1.5rem; }

    .policy-link-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
    }
    .info-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,212,170,0.1); color: var(--accent-teal);
      font-size: 1rem;
    }
    .info-text { display: flex; flex-direction: column; gap: 0.1rem; }
    .label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
    .value { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }

    .claim-desc p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-top: 0.4rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Card Footer */
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.25rem;
      margin-top: auto;
      border-top: 1px solid rgba(255,255,255,0.04);
    }

    .attachment-info {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.8rem; font-weight: 600; color: var(--accent-blue);
    }
    .attachment-info.no-docs { color: var(--text-muted); font-weight: 500; }

    .btn-detail {
      background: none; border: none;
      color: var(--accent-teal);
      font-weight: 800; font-size: 0.85rem;
      cursor: pointer;
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 0;
      transition: var(--transition);
    }
    .btn-detail:hover { color: var(--text-primary); transform: translateX(4px); }

    /* States */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 6rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }
    .empty-icon { font-size: 4rem; color: var(--accent-teal); opacity: 0.2; margin-bottom: 0.5rem; }
    .empty-state h3 { font-size: 1.6rem; color: var(--text-primary); }
    .empty-state p { color: var(--text-secondary); max-width: 400px; margin: 0 auto; line-height: 1.6; }

    /* Skeletons */
    .skeleton-card {
      height: 320px; padding: 2rem;
      background: rgba(255,255,255,0.02);
      border-radius: 16px;
      display: flex; flex-direction: column; gap: 1.5rem;
    }
    .skel-header { height: 40px; width: 60%; border-radius: 8px; }
    .skel-line { height: 16px; width: 100%; border-radius: 4px; }
    .skel-line.short { width: 40%; }
    .skel-btn { height: 44px; width: 100%; border-radius: 10px; margin-top: auto; }
    .skel-header, .skel-line, .skel-btn {
      background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .claims-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ClaimsListComponent implements OnInit {
  claims = signal<ClaimResponse[]>([]);
  isLoading = signal<boolean>(true);
  private dataLoaded = false;

  constructor(
    private claimsService: ClaimsService,
    private authService: AuthService
  ) {
    effect(() => {
      const user = this.authService.currentUser();
      if (user && user.username && !this.dataLoaded) {
        this.dataLoaded = true;
        this.fetchClaims(user.username);
      }
    });
  }

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user && user.username) {
      this.dataLoaded = true;
      this.fetchClaims(user.username);
    }
  }

  private fetchClaims(username: string) {
    this.claimsService.getUserClaims(username).subscribe({
      next: (data) => {
        this.claims.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // Keep for template compat
  loadClaims() { this.dataLoaded = false; const u = this.authService.currentUser(); if (u?.username) { this.dataLoaded = true; this.fetchClaims(u.username); } }
}
