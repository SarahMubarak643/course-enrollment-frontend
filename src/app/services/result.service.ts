import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Result, ResultRequest } from '../models/result.model';

@Injectable({ providedIn: 'root' })
export class ResultService {

  private baseUrl = `${environment.apiUrl}/results`;

  constructor(private http: HttpClient) {}

  getAllResults(): Observable<Result[]> {
    return this.http.get<Result[]>(this.baseUrl);
  }

  getResultById(id: number): Observable<Result> {
    return this.http.get<Result>(`${this.baseUrl}/${id}`);
  }

  // The logged-in STUDENT's own results only.
  getMyResults(): Observable<Result[]> {
    return this.http.get<Result[]>(`${this.baseUrl}/me`);
  }

  // Used by the workflow screen to check whether a result has already
  // been recorded for a given (completed) enrollment. The backend
  // returns 404 when none exists yet -- that's a normal, expected case.
  getResultByEnrollment(enrollmentId: number): Observable<Result> {
    return this.http.get<Result>(`${this.baseUrl}/enrollment/${enrollmentId}`);
  }

  // Records an assessment result for a completed enrollment.
  createResult(request: ResultRequest): Observable<Result> {
    const params = new HttpParams()
      .set('enrollmentId', request.enrollmentId)
      .set('score', request.score)
      .set('completionStatus', request.completionStatus);

    return this.http.post<Result>(this.baseUrl, null, { params });
  }
}
