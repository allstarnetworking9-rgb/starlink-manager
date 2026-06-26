export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  errors: string[];
  meta?: PaginationMeta;
}
