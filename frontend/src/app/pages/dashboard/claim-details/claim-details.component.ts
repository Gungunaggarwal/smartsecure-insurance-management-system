import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClaimsService } from '../../../core/services/claims.service';
import { ClaimResponse } from '../../../models/claim.model';

@Component({
  selector: 'app-claim-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="details-page animate-fade">
      <header class="page-header">
        <button routerLink="/dashboard/claims" class="back-link">
          <i class="fas fa-arrow-left"></i> Back to Claims
        </button>
        <h1>Claim <span class="gradient-text">Timeline</span></h1>
      </header>

      <div *ngIf="isLoading()" class="loader-wrap">
        <div class="spinner"></div>
        <p>Loading timeline details...</p>
      </div>

      <div *ngIf="!isLoading() && claim()" class="details-content">
        <!-- Status Card -->
        <div class="glass-card status-card" [class]="claim()?.status?.toLowerCase()">
          <div class="status-icon">
            <i class="fas" [class.fa-clock]="claim()?.status === 'PENDING'" 
                         [class.fa-check-circle]="claim()?.status === 'APPROVED'" 
                         [class.fa-times-circle]="claim()?.status === 'REJECTED'"></i>
          </div>
          <div class="status-info">
            <span class="label">Current Status</span>
            <h3>{{ claim()?.status }}</h3>
          </div>
          <div class="claim-meta">
            <span class="ref">REF #{{ claim()?.id }}</span>
            <span class="date">Submitted on Policy #{{ claim()?.policyId }}</span>
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline-container glass-card">
          <h3>Activity History</h3>
          
          <div class="timeline">
            <!-- Step 3 (Conditional) -->
            <div class="timeline-item" *ngIf="claim()?.status !== 'PENDING'" [class.active]="true">
              <div class="t-icon" [class.approved]="claim()?.status === 'APPROVED'" [class.rejected]="claim()?.status === 'REJECTED'">
                <i class="fas" [class.fa-check]="claim()?.status === 'APPROVED'" [class.fa-times]="claim()?.status === 'REJECTED'"></i>
              </div>
              <div class="t-content">
                <div class="t-header">
                  <h4>Claim {{ claim()?.status }}</h4>
                  <span class="t-time">Step 3 of 3</span>
                </div>
                <p>The insurance adjudicator has completed the review. {{ claim()?.status === 'APPROVED' ? 'Payout is being processed.' : 'Please check your email for rejection details.' }}</p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="timeline-item" [class.active]="true">
              <div class="t-icon processing">
                <i class="fas fa-search"></i>
              </div>
              <div class="t-content">
                <div class="t-header">
                  <h4>Under Review</h4>
                  <span class="t-time">Step 2 of 3</span>
                </div>
                <p>The claim documents and policy terms are being verified by our automated system and human agents.</p>
              </div>
            </div>

            <!-- Step 1 -->
            <div class="timeline-item completed">
              <div class="t-icon success">
                <i class="fas fa-paper-plane"></i>
              </div>
              <div class="t-content">
                <div class="t-header">
                  <h4>Claim Submitted</h4>
                  <span class="t-time">Step 1 of 3</span>
                </div>
                <p>Request received successfully. Idempotency Key: <code>{{ claim()?.idempotencyKey?.substring(0,8) }}...</code></p>
                <div class="doc-badge" *ngIf="claim()?.documentPath">
                  <i class="fas fa-file-pdf"></i> Evidence Attached
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .details-page { padding: 1.5rem 0 3rem; max-width: 800px; margin: 0 auto; }
    .page-header { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2.5rem; }
    .back-link { background: none; border: none; color: var(--accent-teal); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 700; width: fit-content; }
    .back-link:hover { color: var(--text-primary); }
    h1 { font-size: 2.5rem; }

    .loader-wrap { text-align: center; padding: 5rem; color: var(--text-muted); }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(0,212,170,0.1); border-top-color: var(--accent-teal); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .status-card { padding: 2rem; display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem; position: relative; }
    .status-icon { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
    
    .status-card.pending { border-left: 5px solid var(--accent-orange); }
    .status-card.pending .status-icon { background: rgba(255,171,0,0.1); color: var(--accent-orange); }
    .status-card.approved { border-left: 5px solid var(--accent-green); }
    .status-card.approved .status-icon { background: rgba(34,197,94,0.1); color: var(--accent-green); }
    .status-card.rejected { border-left: 5px solid var(--accent-red); }
    .status-card.rejected .status-icon { background: rgba(255,68,68,0.1); color: var(--accent-red); }

    .status-info { flex: 1; }
    .status-info .label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
    .status-info h3 { font-size: 1.8rem; font-weight: 800; margin-top: 0.2rem; }

    .claim-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
    .claim-meta .ref { font-family: monospace; font-weight: 800; color: var(--accent-teal); }
    .claim-meta .date { font-size: 0.85rem; color: var(--text-muted); }

    .timeline-container { padding: 2.5rem; }
    .timeline-container h3 { margin-bottom: 2rem; }

    .timeline { position: relative; display: flex; flex-direction: column; gap: 0; }
    .timeline::before { content: ''; position: absolute; left: 19px; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.05); }

    .timeline-item { position: relative; padding-left: 3.5rem; padding-bottom: 3rem; }
    .timeline-item:last-child { padding-bottom: 0; }

    .t-icon { 
      position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; 
      background: var(--bg-card); border: 2px solid rgba(255,255,255,0.05);
      display: flex; align-items: center; justify-content: center; z-index: 1; font-size: 0.9rem; color: var(--text-muted);
    }
    
    .timeline-item.active .t-icon { border-color: var(--accent-teal); color: var(--accent-teal); box-shadow: 0 0 15px rgba(0,212,170,0.2); }
    .timeline-item.completed .t-icon { background: var(--accent-teal); color: white; border-color: var(--accent-teal); }
    
    .t-icon.processing { border-color: var(--accent-orange); color: var(--accent-orange); }
    .t-icon.approved { background: var(--accent-green); color: white; border-color: var(--accent-green); }
    .t-icon.rejected { background: var(--accent-red); color: white; border-color: var(--accent-red); }

    .t-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .t-header h4 { font-size: 1.1rem; }
    .t-time { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }
    .t-content p { color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem; }

    .doc-badge { 
      display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 1rem;
      padding: 0.4rem 0.8rem; background: rgba(255,255,255,0.03); border-radius: 8px;
      font-size: 0.8rem; font-weight: 600; color: var(--accent-blue);
    }

    @media (max-width: 640px) {
      .status-card { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .claim-meta { align-items: flex-start; }
    }
  `]
})
export class ClaimDetailsComponent implements OnInit {
  claim = signal<ClaimResponse | null>(null);
  isLoading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private claimsService: ClaimsService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchDetails(+id);
    }
  }

  fetchDetails(id: number) {
    this.claimsService.trackClaim(id).subscribe({
      next: (data) => {
        this.claim.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
