import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Enrollment } from '../models/enrollment.model';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {

  private baseUrl = `${environment.apiUrl}/enrollments`;

  constructor(private http: HttpClient) {}

  getAllEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.baseUrl);
  }

  getEnrollmentById(id: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.baseUrl}/${id}`);
  }

  getEnrollmentsByStudent(studentId: number): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/student/${studentId}`);
  }

  getEnrollmentsByCourse(courseId: number): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/course/${courseId}`);
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/me`);
  }

  enrollStudent(studentId: number, courseId: number): Observable<Enrollment> {
    const params = new HttpParams()
      .set('studentId', studentId)
      .set('courseId', courseId);

    return this.http.post<Enrollment>(this.baseUrl, null, { params });
  }

  updateStatus(id: number, status: string, reason?: string): Observable<Enrollment> {
    let params = new HttpParams().set('status', status);

    if (reason) {
      params = params.set('reason', reason);
    }

    return this.http.put<Enrollment>(`${this.baseUrl}/${id}/status`, null, { params });
  }

  deleteEnrollment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
