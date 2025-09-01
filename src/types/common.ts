export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  loading: boolean;
}

export interface AsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type AsyncAction<T = void, P = void> = (
  params: P
) => Promise<ApiResponse<T>>;

export interface Repository<T, CreateRequest, UpdateRequest> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(request: CreateRequest): Promise<T>;
  update(request: UpdateRequest): Promise<T>;
  delete(id: string): Promise<void>;
  batchDelete?(ids: string[]): Promise<void>;
}