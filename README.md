# Course Enrollment and Progress System -- Angular Frontend

Angular frontend for the existing Spring Boot **Course Enrollment and Results
System** backend. Built with Angular 19 (standalone components), Bootstrap 5,
and Reactive Forms. Every screen calls the real backend API -- no mock data.

## How to run the backend

From the `course-enrollment-system` project:

```bash
./mvnw clean install
./mvnw spring-boot:run
```

Or with Podman:

```bash
podman build -t course-enrollment-app .
podman network create course-net
podman run -d --name mysql-db --network course-net -e MYSQL_ROOT_PASSWORD=<pwd> -e MYSQL_DATABASE=course_enrollment_db -p 3306:3306 mysql:8
podman run -d --name course-enrollment-app --network course-net -e DB_USERNAME=root -e DB_PASSWORD=<pwd> -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql-db:3306/course_enrollment_db -p 8081:8081 course-enrollment-app
```

The backend must be running on **http://localhost:8081** (CORS is enabled for
`http://localhost:4200`) before starting the frontend.

## How to run the frontend

```bash
npm install
ng serve
```

Then open **http://localhost:4200**.

## API base URL / environment configuration

Stored only in the environment files, never hardcoded in a component or service:

- `src/environments/environment.ts` (dev): `apiUrl: 'http://localhost:8081/api'`
- `src/environments/environment.prod.ts` (prod build): same value.

## Demo users

Same three accounts as the backend's `data.sql` (password `password123` for all):

| Username | Role | Can do |
|---|---|---|
| `student1` | `ROLE_STUDENT` | View courses. View **only their own profile** (`GET /api/students/me`), **only their own** enrollments and results (`GET /api/enrollments/me`, `GET /api/results/me`). Sees a personal dashboard. Cannot see other students, create/edit/delete anything, or run workflow actions. |
| `instructor1` | `ROLE_INSTRUCTOR` | Everything a student can, plus: create/edit students, create enrollments, run all workflow transitions (approve/reject/withdraw/complete), record assessment results, view the full dashboard. Cannot create/edit/delete courses. |
| `admin1` | `ROLE_ADMIN` | Everything, including creating/editing/deleting courses. |

`student1` is linked (via `students.user_id` in `data.sql`) to the Student
record "Sarah Mubarak" -- that link is what lets the backend resolve "my
enrollments/results/dashboard" for that login.

## Application routes and guards

| Route | Guard | Notes |
|---|---|---|
| `/login` | -- | |
| `/dashboard` | `authGuard` | Role-aware: full report for `INSTRUCTOR`/`ADMIN`, personal summary for `STUDENT` -- both from real backend endpoints |
| `/courses` | `authGuard` | Search, 2 filters (category, active), sort on 2 columns (name, duration), pagination |
| `/courses/search/:keyword`, `/courses/filter/:value` | `authGuard` | Alternate entry points into the same `CourseListComponent` -- `:keyword` seeds the search box, `:value` seeds the category filter. Any further interaction (typing, paging, sorting) normalizes the URL back to `/courses?...` |
| `/courses/new`, `/courses/:id/edit` | `authGuard` + `roleGuard(ROLE_ADMIN)` | |
| `/courses/:id` | `authGuard` | |
| `/enrollments` | `authGuard` | All enrollments for `INSTRUCTOR`/`ADMIN`; only the logged-in student's own for `STUDENT` |
| `/enrollments/new` | `authGuard` + `roleGuard(ROLE_INSTRUCTOR, ROLE_ADMIN)` | |
| `/enrollments/:id/workflow` | `authGuard` | Workflow screen: status transitions + "Record Assessment Result" once `COMPLETED` |
| `/students` | `authGuard` | `STUDENT` sees only their own profile + enrollments (`GET /api/students/me`); `INSTRUCTOR`/`ADMIN` see the full list |
| `/students/new`, `/students/:id/edit`, `/students/:id` | `authGuard` + `roleGuard(ROLE_INSTRUCTOR, ROLE_ADMIN)` | |
| `/results`, `/results/:id` | `authGuard` | List + view (third module). All results for `INSTRUCTOR`/`ADMIN`; only the logged-in student's own for `STUDENT` |
| `/access-denied`, `/**` | -- | |

`authGuard` redirects an unauthenticated user to `/login`. `roleGuard` redirects
a logged-in user without the right role to `/access-denied`. The backend is
still the real authorization layer -- every write request, and every `/me`
endpoint's identity resolution, is enforced server-side, not just hidden in
the UI.

## Modules implemented

1. **Courses** -- full CRUD (list/search/filter/sort/paginate, view, create, edit, delete). Main module.
2. **Students** -- listed and viewed for `INSTRUCTOR`/`ADMIN` (who can also create/edit); `STUDENT` sees only their own profile.
3. **Results** -- listed and viewed, personally scoped for `STUDENT`.
4. **Enrollments** -- the workflow module, personally scoped for `STUDENT`, plus creating a new enrollment.

## Workflow transitions

Statuses: `ENROLLED -> APPROVED / REJECTED / WITHDRAWN`, `APPROVED -> COMPLETED / WITHDRAWN`.
`REJECTED`, `WITHDRAWN`, `COMPLETED` are final. `REJECTED`/`WITHDRAWN` require a reason,
collected in the workflow screen and sent to the backend. Once an enrollment reaches
`COMPLETED`, the workflow screen shows a "Record Assessment Result" action (score +
completion status, Reactive Form) that calls `POST /api/results` -- shown only once,
and only to `INSTRUCTOR`/`ADMIN`. The frontend only shows the transitions/actions valid
from the current state -- the backend independently rejects anything else with a 409.

## Dashboard endpoints used

- `GET /api/summary` -- total students, total enrollments, average result score (`INSTRUCTOR`/`ADMIN`).
- `GET /api/summary/courses` -- enrollment count per course (`INSTRUCTOR`/`ADMIN`).
- `GET /api/summary/me` -- the logged-in student's own enrollment count, completed count, and average score (`STUDENT`).

## Assumptions, limitations, known issues

- **Basic Auth in a SPA**: the backend uses HTTP Basic authentication, not
  JWT. The frontend stores the username/password pair (base64-encoded) in
  `localStorage` after a successful login so the interceptor can attach it to
  every subsequent request, and so the session survives a page refresh. This
  is the simplest approach that matches the backend as-is; a production app
  would use a token-based scheme instead.
- **No dedicated "categories" endpoint**: the category filter/field is a
  free-text input rather than a backend-populated dropdown, since the backend
  doesn't expose a category list. The student/course dropdowns on the "New
  Enrollment" form *are* loaded from the backend.
- **Personal-record resolution depends on the `students.user_id` link**: if a
  `STUDENT` account isn't linked to a Student row, `/api/enrollments/me`,
  `/api/results/me`, and `/api/summary/me` return 404 with a clear message
  ("No student profile is linked to this account") rather than silently
  showing nothing.
- **Enrollment workflow permissions**: per the backend's `SecurityConfig`,
  only `INSTRUCTOR`/`ADMIN` can create enrollments, run status transitions,
  or record a result -- a plain `STUDENT` can only view their own records.
  This mirrors the backend exactly.
