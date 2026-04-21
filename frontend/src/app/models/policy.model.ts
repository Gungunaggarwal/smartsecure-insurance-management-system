export interface PolicyRequest {
  name: string;
  description: string;
  basePremium: number;
  type: string;
}

export interface PolicyResponse {
  id: number;
  name: string;
  description: string;
  basePremium: number;
  type: string;
}
