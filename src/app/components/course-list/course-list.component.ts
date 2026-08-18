import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { combineLatest } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/course.model';
import { Page } from '../../models/page.model';
import { ApiError } from '../../models/api-error.model';

type SortColumn = 'courseName' | 'durationHours';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-list.component.html'
})
export class CourseListComponent implements OnInit {

  page: Page<Course> | null = null;
  loading = true;
  errorMessage = '';

  // Filter / search / sort / pagination state, all sent to the backend.
  keyword = '';
  category = '';
  activeFilter: 'all' | 'true' | 'false' = 'all';
  sortColumn: SortColumn = 'courseName';
  sortDirection: 'asc' | 'desc' = 'asc';
  pageIndex = 0;
  pageSize = 10;

  constructor(
    private courseService: CourseService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Two ways to arrive at this component with an initial filter:
    //   /courses?keyword=..&category=..           (query params -- the
    //     existing mechanism, also how this component updates itself
    //     after every search/filter/sort/page change)
    //   /courses/search/:keyword or /courses/filter/:value (route path
    //     params -- required entry-point routes; :value seeds the
    //     category filter, the free-text filter this project uses)
    // Query params win if both happen to be present.
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      ([pathParams, queryParams]) => {
        this.keyword = queryParams.get('keyword') ?? pathParams.get('keyword') ?? '';
        this.category = queryParams.get('category') ?? pathParams.get('value') ?? '';
        this.activeFilter = (queryParams.get('active') as 'all' | 'true' | 'false') ?? 'all';
        this.pageIndex = Number(queryParams.get('page') ?? 0);
        this.pageSize = Number(queryParams.get('size') ?? 10);
        this.sortColumn = (queryParams.get('sort') as SortColumn) ?? 'courseName';
        this.sortDirection = (queryParams.get('dir') as 'asc' | 'desc') ?? 'asc';

        this.loadCourses();
      }
    );
  }

  private loadCourses(): void {
    this.loading = true;
    this.errorMessage = '';

    this.courseService
      .getCoursesPage({
        page: this.pageIndex,
        size: this.pageSize,
        sort: `${this.sortColumn},${this.sortDirection}`,
        keyword: this.keyword || undefined,
        category: this.category || undefined,
        active: this.activeFilter === 'all' ? undefined : this.activeFilter === 'true'
      })
      .subscribe({
        next: (data) => {
          this.page = data;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Could not load courses.';
          this.loading = false;
        }
      });
  }

  // Any new search/filter/page-size selection resets to page 0.
  applyFilters(): void {
    this.updateUrl({ page: 0 });
  }

  toggleSort(column: SortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.updateUrl({ sort: this.sortColumn, dir: this.sortDirection, page: 0 });
  }

  goToPage(index: number): void {
    if (index < 0 || (this.page && index >= this.page.totalPages)) {
      return;
    }
    this.updateUrl({ page: index });
  }

  private updateUrl(overrides: Record<string, unknown>): void {
    this.router.navigate(['/courses'], {
      queryParams: {
        keyword: this.keyword || null,
        category: this.category || null,
        active: this.activeFilter === 'all' ? null : this.activeFilter,
        page: this.pageIndex,
        size: this.pageSize,
        sort: this.sortColumn,
        dir: this.sortDirection,
        ...overrides
      }
    });
  }

  canManageCourses(): boolean {
    return this.auth.hasRole('ROLE_ADMIN');
  }

  // Delete action on the list row itself (in addition to the detail page).
  // Stops the row-click navigation so it doesn't also open the detail page.
  deleteCourse(event: Event, course: Course): void {
    event.stopPropagation();

    if (!confirm(`Delete course "${course.courseName}"? This cannot be undone.`)) {
      return;
    }

    this.courseService.deleteCourse(course.courseId).subscribe({
      next: () => this.loadCourses(),
      error: (err: HttpErrorResponse) => {
        const body = err.error as ApiError | undefined;
        this.errorMessage = body?.error ?? 'Could not delete this course.';
      }
    });
  }
}
