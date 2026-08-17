// GlobalExceptionHandler returns { "error": "message" } for 400 (IllegalArgumentException),
// 401, 404 and 409. For 400 (MethodArgumentNotValidException / field validation) it
// instead returns a map of fieldName -> message, e.g. { "courseName": "Course name is required" }.
export interface ApiError {
  error?: string;
  [field: string]: string | undefined;
}
