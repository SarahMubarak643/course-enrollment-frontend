import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Student, StudentRequest } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {

  private baseUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.baseUrl);
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${id}`);
  }

  getMyProfile(): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/me`);
  }

  createStudent(student: StudentRequest): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, student);
  }

  updateStudent(id: number, student: StudentRequest): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/${id}`, student);
  }
}
