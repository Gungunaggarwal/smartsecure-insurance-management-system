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
    <div class="claim-page animate-fade">
      <header class="page-header">
        <div class="header-content">
          <h1>Initiate <span class="gradient-text">Claim</span></h1>
          <p>Tell us what happened, and we'll guide you through the recovery process.</p>
        </div>
      </header>

      <div class="claim-container">
        <div class="glass-card claim-card">
          <div class="claim-header">
            <div class="claim-icon-wrap"><i class="fas fa-file-medical"></i></div>
            <div class="claim-title-box">
              <h3>Claim Submission</h3>
              <p>Fill out the form below to initiate your insurance claim.</p>
            </div>
          </div>

          <form [formGroup]="claimForm" (ngSubmit)="onSubmit()" class="claim-form">
            <div class="form-group">
              <label class="form-label">Associated Policy ID</label>
              <div class="input-wrapper">
                <i class="fas fa-shield-alt input-icon"></i>
                <input type="number" formControlName="policyId" class="form-control with-icon" placeholder="Enter Policy Reference #">
              </div>
              <small class="form-hint">Find your Policy ID (e.g. #101) in the Browse Policies list.</small>
            </div>

            <div class="form-group">
              <label class="form-label">Incident Description</label>
              <div class="input-wrapper">
                <i class="fas fa-edit input-icon" style="top: 1.25rem; transform: none;"></i>
                <textarea formControlName="description" class="form-control with-icon" rows="4" placeholder="Briefly describe what happened..."></textarea>
              </div>
              <small *ngIf="claimForm.get('description')?.touched && claimForm.get('description')?.errors?.['minlength']" class="error-hint">
                Description must be at least 5 characters.
              </small>
            </div>

            <div class="form-group">
              <label class="form-label">Supporting Evidence (Documents/Receipts)</label>
              <div class="upload-area" [class.has-file]="selectedFile" (click)="fileInput.click()">
                <input type="file" #fileInput (change)="onFileSelected($event)" hidden accept=".pdf,image/*">
                
                <div class="upload-placeholder" *ngIf="!selectedFile">
                  <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
                  <div class="upload-text">
                    <span class="primary-text">Click to upload your document</span>
                    <span class="secondary-text">PDF or major image formats allowed</span>
                  </div>
                </div>

                <div class="file-preview" *ngIf="selectedFile">
                   <div class="file-icon"><i class="fas fa-file-pdf"></i></div>
                   <div class="file-info">
                     <span class="file-name">{{ selectedFile.name }}</span>
                     <span class="file-size">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</span>
                   </div>
                   <button type="button" class="remove-file" (click)="$event.stopPropagation(); selectedFile = null;">
                     <i class="fas fa-times"></i>
                   </button>
                </div>
              </div>
            </div>

            <div *ngIf="errorMessage" class="error-msg animate-fade">
              <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
            </div>

            <button type="submit" class="btn btn-primary submit-btn" [disabled]="claimForm.invalid || !selectedFile || isLoading">
              <span *ngIf="!isLoading">Submit Premium Claim <i class="fas fa-paper-plane"></i></span>
              <span *ngIf="isLoading"><i class="fas fa-spinner fa-spin"></i> Processing Request...</span>
            </button>
          </form>
        </div>

        <aside class="claim-sidebar animate-fade">
          <div class="glass-card info-box">
             <h4><i class="fas fa-info-circle"></i> Quick Guide</h4>
             <ul>
               <li>Ensure your description includes dates and locations.</li>
               <li>Upload high-quality images of any receipts.</li>
               <li>Approval typically takes 2-5 business days.</li>
             </ul>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .claim-page {
      padding: 1.5rem 0 3rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header { margin-bottom: 3.5rem; }
    .header-content h1 { font-size: 3rem; margin-bottom: 0.5rem; }
    .header-content p { color: var(--text-secondary); font-size: 1.1rem; }

    .claim-container {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2.5rem;
      align-items: flex-start;
    }

    /* Form Card */
    .claim-card { padding: 3rem; border: 1px solid rgba(255,255,255,0.04); }

    .claim-header {
      display: flex; align-items: center; gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .claim-icon-wrap {
      width: 56px; height: 56px; border-radius: 16px;
      background: rgba(0, 212, 170, 0.1); color: var(--accent-teal);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.75rem;
    }
    .claim-title-box h3 { font-size: 1.6rem; margin-bottom: 0.25rem; }
    .claim-title-box p { color: var(--text-secondary); font-size: 0.9rem; }

    .claim-form { display: flex; flex-direction: column; gap: 1.5rem; }

    .input-wrapper { position: relative; }
    .input-icon {
      position: absolute; left: 1.125rem; top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted); font-size: 0.9rem;
      transition: var(--transition); pointer-events: none;
    }
    .form-control.with-icon { padding-left: 3rem; }
    .form-control.with-icon:focus + .input-icon { color: var(--accent-teal); }

    .form-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem; display: block; font-weight: 500; }
    .error-hint { font-size: 0.75rem; color: var(--accent-red); margin-top: 0.4rem; display: block; font-weight: 600; }

    /* Upload Area */
    .upload-area {
      border: 2px dashed var(--glass-border);
      border-radius: 16px;
      padding: 2.5rem;
      text-align: center;
      transition: var(--transition);
      cursor: pointer;
      background: rgba(255, 255, 255, 0.02);
    }
    .upload-area:hover {
      border-color: var(--accent-teal);
      background: rgba(0, 212, 170, 0.05);
    }
    .upload-area.has-file {
      border-style: solid;
      border-color: rgba(0, 212, 170, 0.3);
      padding: 1.5rem;
      background: rgba(0, 212, 170, 0.03);
    }

    .upload-icon { font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem; opacity: 0.5; }
    .upload-text { display: flex; flex-direction: column; gap: 0.25rem; }
    .primary-text { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
    .secondary-text { font-size: 0.85rem; color: var(--text-muted); }

    .file-preview {
      display: flex; align-items: center; gap: 1.25rem;
      text-align: left;
    }
    .file-icon {
      width: 48px; height: 48px; border-radius: 10px;
      background: rgba(0, 212, 170, 0.1); color: var(--accent-teal);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
    }
    .file-info { flex: 1; display: flex; flex-direction: column; }
    .file-name { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
    .file-size { font-size: 0.8rem; color: var(--text-muted); }

    .remove-file {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(255, 255, 255, 0.05); border: none;
      color: var(--text-muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: var(--transition);
    }
    .remove-file:hover { background: rgba(255, 68, 68, 0.1); color: var(--accent-red); }

    .error-msg {
      background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.2);
      color: var(--accent-red); padding: 1rem; border-radius: 12px;
      font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.75rem;
    }

    .submit-btn { height: 3.5rem; font-size: 1rem; font-weight: 700; margin-top: 1rem; }

    /* Sidebar Boxes */
    .claim-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
    .info-box, .help-box { padding: 1.5rem; border: 1px solid rgba(255,255,255,0.04); }
    .info-box h4, .help-box h4 { font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem; }
    .info-box ul { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
    .info-box li { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; position: relative; padding-left: 1.25rem; }
    .info-box li::before { content: '→'; position: absolute; left: 0; color: var(--accent-teal); font-weight: 800; }
    .help-box p { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem; line-height: 1.5; }
    .w-full { width: 100%; }

    @media (max-width: 900px) {
      .claim-container { grid-template-columns: 1fr; }
      .claim-card { padding: 2.5rem 1.5rem; }
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
      description: ['', [Validators.required, Validators.minLength(5)]]
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
      this.errorMessage = '';
      // +policyId converts the string from the form control to a number
      const policyId = +this.claimForm.value.policyId;
      const description = this.claimForm.value.description;

      this.claimsService.initiateClaimWithDoc(this.selectedFile, policyId, description).subscribe({
        next: () => {
          alert('Claim submitted successfully!');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Claim submission error:', err);
          let msg = 'Failed to submit claim. Please check your data and try again.';
          if (err?.error && typeof err.error === 'string') msg = err.error;
          else if (err?.error?.message) msg = err.error.message;
          this.errorMessage = msg;
        }
      });
    }
  }
}
