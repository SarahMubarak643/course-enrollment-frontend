import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Course, CourseRequest } from '../models/course.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class CourseService {

  private baseUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  getCoursesPage(options: {
    page: number;
    size: number;
    sort?: string;       
    keyword?: string;
    category?: string;
    active?: boolean;
  }): Observable<Page<Course>> {

    let params = new HttpParams()
      .set('page', options.page)
      .set('size', options.size);

    if (options.sort) {
      params = params.set('sort', options.sort);
    }
    if (options.keyword) {
      params = params.set('keyword', options.keyword);
    }
    if (options.category) {
      params = params.set('category', options.category);
    }
    if (options.active !== undefined && options.active !== null) {
      params = params.set('active', options.active);
    }

    return this.http.get<Page<Course>>(`${this.baseUrl}/page`, { params });
  }

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.baseUrl);
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.baseUrl}/${id}`);
  }

  createCourse(course: CourseRequest): Observable<Course> {
    return this.http.post<Course>(this.baseUrl, course);
  }

  updateCourse(id: number, course: CourseRequest): Observable<Course> {
    return this.http.put<Course>(`${this.baseUrl}/${id}`, course);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
