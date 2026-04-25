import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PolicyRequest, PolicyResponse } from '../../models/policy.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private apiUrl = `${environment.apiUrl}/api/v1/policies`;

  constructor(private http: HttpClient) {}

  getPolicies(): Observable<PolicyResponse[]> {
    return this.http.get<PolicyResponse[]>(this.apiUrl);
  }

  createPolicy(request: PolicyRequest): Observable<PolicyResponse> {
    return this.http.post<PolicyResponse>(this.apiUrl, request);
  }

  updatePolicy(id: number, request: PolicyRequest): Observable<PolicyResponse> {
    return this.http.put<PolicyResponse>(`${this.apiUrl}/${id}`, request);
  }

  deletePolicy(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  purchasePolicy(id: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}/purchase`, {}, { responseType: 'text' as 'json' });
  }

  countPolicies(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  countPoliciesByType(type: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/type/${type}`);
  }

  getPurchasedPolicies(username: string): Observable<PolicyResponse[]> {
    return this.http.get<PolicyResponse[]>(`${this.apiUrl}/user/${username}`);
  }
}
