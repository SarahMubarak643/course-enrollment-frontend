// Matches the JSON shape Spring Data's Page<T> serializes to.
// Only the fields the frontend actually uses are declared.
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // current page (0-based)
  size: number;      // page size
  first: boolean;
  last: boolean;
  empty: boolean;
}
