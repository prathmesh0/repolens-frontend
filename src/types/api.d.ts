export interface Interceptor<T> {
  use(handler: (input: T) => T): void;
  handler: (input: T) => T;
}

export interface RequestInterceptor {
  input: RequestInfo;
  init?: RequestInit;
}

export interface ResponseInterceptor {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
}

export interface FetchInterceptor {
  request: Interceptor<RequestInterceptor>;
  response: Interceptor<ResponseInterceptor>;
}

export type ApiResponse<T = unknown> = ApiBaseResponse<T>;

export interface ApiPaginatedData<K> {
  data: K[];
  pageInfo: {
    totalRecords: number;
    totalPages: number;
    pageSize: number;
    currentPage: number;
  };
}
