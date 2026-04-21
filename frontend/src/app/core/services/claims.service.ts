import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ClaimResponse } from '../../models/claim.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClaimsService {
  private apiUrl = `${environment.apiUrl}/api/v1/claims`;

  constructor(private http: HttpClient) {}

  initiateClaimWithDoc(file: File, policyId: number, description: string): Observable<ClaimResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('policyId', policyId.toString());
    formData.append('description', description);
    
    // Note: X-Username is handled by the interceptor
    return this.http.post<ClaimResponse>(`${this.apiUrl}/initiate-claim-with-doc`, formData);
  }

  getUserClaims(username: string): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(`${this.apiUrl}/user/${username}`);
  }

  trackClaim(id: number): Observable<ClaimResponse> {
    return this.http.get<ClaimResponse>(`${this.apiUrl}/${id}/track`);
  }

  updateClaim(id: number, description?: string, status?: string): Observable<ClaimResponse> {
    let params = new HttpParams();
    if (description) params = params.set('description', description);
    if (status) params = params.set('status', status);
    
    return this.http.put<ClaimResponse>(`${this.apiUrl}/${id}`, null, { params });
  }

  deleteClaim(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  countClaims(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  countClaimsByStatus(status: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/status/${status}`);
  }
}
