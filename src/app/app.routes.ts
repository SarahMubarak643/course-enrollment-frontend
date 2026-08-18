import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CourseListComponent } from './components/course-list/course-list.component';
import { CourseDetailComponent } from './components/course-detail/course-detail.component';
import { CourseFormComponent } from './components/course-form/course-form.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { StudentDetailComponent } from './components/student-detail/student-detail.component';
import { StudentFormComponent } from './components/student-form/student-form.component';
import { ResultListComponent } from './components/result-list/result-list.component';
import { ResultDetailComponent } from './components/result-detail/result-detail.component';
import { EnrollmentListComponent } from './components/enrollment-list/enrollment-list.component';
import { EnrollmentWorkflowComponent } from './components/enrollment-workflow/enrollment-workflow.component';
import { EnrollmentFormComponent } from './components/enrollment-form/enrollment-form.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Dashboard is role-aware: INSTRUCTOR/ADMIN see the full report,
  // STUDENT sees a personal summary (both use real backend endpoints).
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

  // Courses -- main CRUD module. Everyone logged in can view; only
  // ADMIN can create/edit (mirrors SecurityConfig's write rule).
  { path: 'courses', component: CourseListComponent, canActivate: [authGuard] },
  {
    path: 'courses/new',
    component: CourseFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'courses/:id/edit',
    component: CourseFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },

  // Required entry-point routes for the main list: reuse the same
  // CourseListComponent and the same query-param-driven state as
  // /courses -- these just seed the initial keyword/category filter.
  { path: 'courses/search/:keyword', component: CourseListComponent, canActivate: [authGuard] },
  { path: 'courses/filter/:value', component: CourseListComponent, canActivate: [authGuard] },

  { path: 'courses/:id', component: CourseDetailComponent, canActivate: [authGuard] },

  // Enrollments -- workflow module. Everyone logged in can view;
  // creating/transitioning requires INSTRUCTOR/ADMIN (mirrors backend).
  { path: 'enrollments', component: EnrollmentListComponent, canActivate: [authGuard] },
  {
    path: 'enrollments/new',
    component: EnrollmentFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_INSTRUCTOR', 'ROLE_ADMIN'] }
  },
  { path: 'enrollments/:id/workflow', component: EnrollmentWorkflowComponent, canActivate: [authGuard] },

  // Students -- listed/viewed for INSTRUCTOR/ADMIN; a plain STUDENT sees
  // only their own profile (rendered directly on /students, no id needed).
  // ADMIN/INSTRUCTOR can also create/edit (mirrors SecurityConfig's write rule).
  { path: 'students', component: StudentListComponent, canActivate: [authGuard] },
  {
    path: 'students/new',
    component: StudentFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_INSTRUCTOR', 'ROLE_ADMIN'] }
  },
  {
    path: 'students/:id/edit',
    component: StudentFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_INSTRUCTOR', 'ROLE_ADMIN'] }
  },
  {
    path: 'students/:id',
    component: StudentDetailComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_INSTRUCTOR', 'ROLE_ADMIN'] }
  },

  // Results -- third module, listed and viewed.
  { path: 'results', component: ResultListComponent, canActivate: [authGuard] },
  { path: 'results/:id', component: ResultDetailComponent, canActivate: [authGuard] },

  { path: 'access-denied', component: AccessDeniedComponent },

  // Wildcard route must always be last.
  { path: '**', component: PageNotFoundComponent }
];
