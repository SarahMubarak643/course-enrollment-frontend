export interface ApiError {
  error?: string;
  [field: string]: string | undefined;
}
