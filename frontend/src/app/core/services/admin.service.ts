import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminReviewRequest, ClaimResponse, PolicyUpdateRequest } from '../../models/claim.model';
import { PolicyResponse } from '../../models/policy.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/v1/admin`;

  constructor(private http: HttpClient) {}

  // Claims Management
  reviewClaim(id: number, request: AdminReviewRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/claims/${id}/review`, request, { responseType: 'text' as 'json' });
  }

  updateClaim(id: number, description?: string, status?: string): Observable<ClaimResponse> {
    let params = new HttpParams();
    if (description) params = params.set('description', description);
    if (status) params = params.set('status', status);
    
    return this.http.put<ClaimResponse>(`${this.apiUrl}/claims/${id}`, null, { params });
  }

  deleteClaim(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/claims/${id}`, { responseType: 'text' as 'json' });
  }

  getClaimsStats(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/claims/stats`);
  }

  getClaims(): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(`${this.apiUrl}/claims`);
  }

  getPolicies(): Observable<PolicyResponse[]> {
    return this.http.get<PolicyResponse[]>(`${this.apiUrl}/policies`);
  }

  // Policy Management
  createPolicy(request: PolicyUpdateRequest): Observable<PolicyResponse> {
    return this.http.post<PolicyResponse>(`${this.apiUrl}/policies`, request);
  }

  updatePolicy(id: number, request: PolicyUpdateRequest): Observable<PolicyResponse> {
    return this.http.put<PolicyResponse>(`${this.apiUrl}/policies/${id}`, request);
  }

  deletePolicy(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/policies/${id}`, { responseType: 'text' as 'json' });
  }
}
