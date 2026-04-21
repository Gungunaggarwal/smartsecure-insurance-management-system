import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClaimsService } from '../../../core/services/claims.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-claim-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="claim-container animate-fade">
      <div class="glass-card claim-card">
        <header class="card-header">
          <h2>File a <span class="gradient-text">Claim</span></h2>
          <p>Please provide details and upload supporting documents.</p>
        </header>

        <form [formGroup]="claimForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Policy ID</label>
            <input type="number" formControlName="policyId" class="form-control" placeholder="e.g. 101">
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea formControlName="description" class="form-control" rows="4" placeholder="Describe the incident..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Support Document (PDF/Image)</label>
            <div class="file-upload-box" [class.has-file]="selectedFile">
              <input type="file" (change)="onFileSelected($event)" id="fileInput" hidden>
              <label for="fileInput" class="file-label">
                <span *ngIf="!selectedFile">Click to upload document</span>
                <span *ngIf="selectedFile" class="file-name">📄 {{ selectedFile.name }}</span>
              </label>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-box">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="claimForm.invalid || !selectedFile || isLoading">
            {{ isLoading ? 'Submitting Claim...' : 'Submit Claim' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .claim-container {
      padding: 2rem;
      max-width: 700px;
      margin: 0 auto;
    }

    .claim-card {
      padding: 3rem;
    }

    .card-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .file-upload-box {
      border: 2px dashed var(--glass-border);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      transition: var(--transition);
      cursor: pointer;
    }

    .file-upload-box:hover, .file-upload-box.has-file {
      border-color: var(--accent-teal);
      background: rgba(0, 212, 170, 0.05);
    }

    .file-label {
      cursor: pointer;
      display: block;
      color: var(--text-secondary);
    }

    .file-name {
      color: var(--accent-teal);
      font-weight: 600;
    }

    .w-full { width: 100%; height: 3.5rem; margin-top: 1rem; }

    .error-box {
      background: rgba(255, 68, 68, 0.1);
      border: 1px solid #ff4444;
      color: #ff4444;
      padding: 0.75rem;
      border-radius: 10px;
      margin-bottom: 1rem;
    }
  `]
})
export class ClaimFormComponent {
  claimForm: FormGroup;
  selectedFile: File | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private claimsService: ClaimsService,
    private router: Router
  ) {
    this.claimForm = this.fb.group({
      policyId: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.claimForm.valid && this.selectedFile) {
      this.isLoading = true;
      const { policyId, description } = this.claimForm.value;
      
      this.claimsService.initiateClaimWithDoc(this.selectedFile, policyId, description).subscribe({
        next: () => {
          alert('Claim submitted successfully!');
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to submit claim. Please check your data and try again.';
        }
      });
    }
  }
}
