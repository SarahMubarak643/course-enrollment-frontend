import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/course.model';
import { Page } from '../../models/page.model';

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
    // Read initial state from the URL so the list reacts to route/query changes
    // (e.g. bookmarked search, back button).
    this.route.queryParamMap.subscribe((params) => {
      this.keyword = params.get('keyword') ?? '';
      this.category = params.get('category') ?? '';
      this.activeFilter = (params.get('active') as 'all' | 'true' | 'false') ?? 'all';
      this.pageIndex = Number(params.get('page') ?? 0);
      this.pageSize = Number(params.get('size') ?? 10);
      this.sortColumn = (params.get('sort') as SortColumn) ?? 'courseName';
      this.sortDirection = (params.get('dir') as 'asc' | 'desc') ?? 'asc';

      this.loadCourses();
    });
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        keyword: this.keyword || null,
        category: this.category || null,
        active: this.activeFilter === 'all' ? null : this.activeFilter,
        page: this.pageIndex,
        size: this.pageSize,
        sort: this.sortColumn,
        dir: this.sortDirection,
        ...overrides
      },
      queryParamsHandling: 'merge'
    });
  }

  canManageCourses(): boolean {
    return this.auth.hasRole('ROLE_ADMIN');
  }
}
