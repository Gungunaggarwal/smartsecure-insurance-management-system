import { Component, OnInit, signal } from '@angular/core';
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
          <h1>My <span class="gradient-text">Claims</span></h1>
          <p>Track the status of your submitted insurance claims.</p>
        </div>
        <button routerLink="/dashboard/claims/new" class="btn btn-primary">
          <i class="fas fa-plus"></i> New Claim
        </button>
      </header>

      <div *ngIf="isLoading()" class="loader">
        <div class="spinner"></div>
        <p>Loading your claims...</p>
      </div>

      <div *ngIf="!isLoading()" class="claims-grid">
        <div *ngIf="claims().length === 0" class="empty-state glass-card">
          <i class="fas fa-folder-open"></i>
          <h3>No Claims Found</h3>
          <p>You haven't submitted any insurance claims yet.</p>
          <button routerLink="/dashboard/claims/new" class="btn btn-secondary">File Your First Claim</button>
        </div>

        <div *ngFor="let claim of claims()" class="glass-card claim-card">
          <div class="card-header">
            <span class="claim-id">#{{ claim.id }}</span>
            <div class="status-badge" [class]="claim.status.toLowerCase()">
              {{ claim.status }}
            </div>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <span class="label">Policy ID</span>
              <span class="value">{{ claim.policyId }}</span>
            </div>
            <div class="info-row">
              <span class="label">Description</span>
              <p class="description">{{ claim.description }}</p>
            </div>
          </div>

          <div class="card-footer">
            <div class="document-link" *ngIf="claim.documentPath">
              <i class="fas fa-file-pdf"></i>
              <span>View Document</span>
            </div>
            <button [routerLink]="['/dashboard/claims', claim.id]" class="btn btn-link">
              Track Details <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .claims-page { padding: 1rem 0; }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
    }

    .title-area h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .title-area p { color: var(--text-secondary); }

    .claims-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .claim-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .claim-id {
      font-family: var(--header-font);
      font-weight: 700;
      color: var(--accent-teal);
    }

    .status-badge {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-badge.pending { background: rgba(255, 171, 0, 0.1); color: #ffab00; border: 1px solid rgba(255,171,0,0.2); }
    .status-badge.approved { background: rgba(0, 212, 170, 0.1); color: var(--accent-teal); border: 1px solid rgba(0,212,170,0.2); }
    .status-badge.rejected { background: rgba(255, 68, 68, 0.1); color: #ff4444; border: 1px solid rgba(255,68,68,0.2); }

    .info-row { display: flex; flex-direction: column; gap: 0.25rem; }
    .label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
    .value { font-weight: 600; color: var(--text-primary); }
    .description { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.5; }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--glass-border);
    }

    .document-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--accent-blue);
      cursor: pointer;
    }

    .btn-link {
      background: none;
      border: none;
      color: var(--accent-teal);
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0;
    }

    .loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5rem;
      gap: 1.5rem;
      color: var(--text-secondary);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 212, 170, 0.1);
      border-top-color: var(--accent-teal);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 5rem 2rem;
    }
    .empty-state i { font-size: 4rem; opacity: 0.1; margin-bottom: 2rem; display: block; }
    .empty-state h3 { margin-bottom: 1rem; }
    .empty-state p { margin-bottom: 2rem; color: var(--text-secondary); }

    @media (max-width: 600px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
    }
  `]
})
export class ClaimsListComponent implements OnInit {
  claims = signal<ClaimResponse[]>([]);
  isLoading = signal<boolean>(true);

  constructor(
    private claimsService: ClaimsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadClaims();
  }

  loadClaims() {
    const user = this.authService.currentUser();
    if (user && user.username) {
      this.claimsService.getUserClaims(user.username).subscribe({
        next: (data) => {
          this.claims.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }
}
