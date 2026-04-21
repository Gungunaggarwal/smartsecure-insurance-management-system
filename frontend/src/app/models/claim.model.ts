export interface ClaimResponse {
  id: number;
  policyId: number;
  username: string;
  description: string;
  status: string;
  documentPath: string;
  idempotencyKey: string;
}

export interface AdminReviewRequest {
  status: string;
  comments: string;
}

export interface PolicyUpdateRequest {
  name: string;
  description: string;
  basePremium: number;
  type: string;
}
