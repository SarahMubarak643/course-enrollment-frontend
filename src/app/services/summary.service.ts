import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Summary, MySummary, CourseEnrollmentCount } from '../models/summary.model';

@Injectable({ providedIn: 'root' })
export class SummaryService {

  private baseUrl = `${environment.apiUrl}/summary`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(this.baseUrl);
  }

  getEnrollmentsByCourse(): Observable<CourseEnrollmentCount[]> {
    return this.http.get<CourseEnrollmentCount[]>(`${this.baseUrl}/courses`);
  }

  getMySummary(): Observable<MySummary> {
    return this.http.get<MySummary>(`${this.baseUrl}/me`);
  }
}
