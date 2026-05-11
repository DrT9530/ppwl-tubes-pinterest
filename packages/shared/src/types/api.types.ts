// api.types.ts — Standard API response types
export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}
