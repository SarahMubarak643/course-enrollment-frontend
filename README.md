# Course Enrollment and Progress System — Angular Frontend

Angular frontend for the existing Spring Boot **Course Enrollment and Results
System** backend. Built with Angular 19 (standalone components), Bootstrap 5,
and Reactive Forms. Every screen calls the real backend API -- no mock data.

## How to run the backend

From the `course-enrollment-system` project:

```bash
./mvnw clean install
./mvnw spring-boot:run
```

Or with Podman (see the backend's own README section 12 for the full
network/container setup):

```bash
podman build -t course-enrollment-app .
podman network create course-net
podman run -d --name mysql-db --network course-net -e MYSQL_ROOT_PASSWORD=<pwd> -e MYSQL_DATABASE=course_enrollment_db -p 3306:3306 mysql:8
podman run -d --name course-enrollment-app --network course-net -e DB_USERNAME=root -e DB_PASSWORD=<pwd> -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql-db:3306/course_enrollment_db -p 8081:8081 course-enrollment-app
```

The backend must be running on **http://localhost:8081** (with CORS enabled
for `http://localhost:4200`) before starting the frontend.

## How to run the frontend

```bash
npm install
ng serve
```

Then open **http://localhost:4200**.

## API base URL / environment configuration

The backend URL is stored only in the environment files -- never hardcoded in
a component or service:

- `src/environments/environment.ts` (dev): `apiUrl: 'http://localhost:8081/api'`
- `src/environments/environment.prod.ts` (prod build): same value, change if
  you deploy the backend elsewhere.

## Demo users

Same three accounts as the backend's `data.sql` (password `password123` for all):

| Username | Role | Can do |
|---|---|---|
| `student1` | `ROLE_STUDENT` | View courses, students, results, and enrollments. Cannot create/edit/delete anything, cannot change enrollment status, cannot see the dashboard. |
| `instructor1` | `ROLE_INSTRUCTOR` | Everything a student can, plus: create enrollments, run workflow transitions (approve/reject/withdraw/complete), view the dashboard. Cannot create/edit/delete courses or students. |
| `admin1` | `ROLE_ADMIN` | Everything, including creating/editing/deleting courses. |

## Application routes and guards

| Route | Guard | Notes |
|---|---|---|
| `/login` | -- | |
| `/dashboard` | `authGuard` + `roleGuard(ROLE_INSTRUCTOR, ROLE_ADMIN)` | Backend restricts `/api/summary/**` to these roles; there's no student-personal dashboard endpoint |
| `/courses` | `authGuard` | List, search, filter, sort, paginate |
| `/courses/new`, `/courses/:id/edit` | `authGuard` + `roleGuard(ROLE_ADMIN)` | |
| `/courses/:id` | `authGuard` | |
| `/enrollments` | `authGuard` | |
| `/enrollments/new` | `authGuard` + `roleGuard(ROLE_INSTRUCTOR, ROLE_ADMIN)` | |
| `/enrollments/:id` | `authGuard` | Workflow screen -- actions only shown/enabled for `ROLE_INSTRUCTOR`/`ROLE_ADMIN` |
| `/students`, `/students/:id` | `authGuard` | List + view only (second module) |
| `/results` | `authGuard` | List only (third module) |
| `/access-denied`, `/**` | -- | |

`authGuard` redirects an unauthenticated user to `/login`. `roleGuard` redirects
a logged-in user without the right role to `/access-denied`. The backend is
still the real authorization layer -- the frontend only hides buttons/routes
for convenience, and every write request is re-checked by Spring Security.

## Modules implemented

1. **Courses** -- full CRUD (list/search/filter/sort/paginate, view, create, edit, delete). Main module.
2. **Students** -- listed and viewed.
3. **Results** -- listed and viewed.
4. **Enrollments** -- the workflow module (see below), plus creating a new enrollment.

## Workflow transitions

Statuses: `ENROLLED -> APPROVED / REJECTED / WITHDRAWN`, `APPROVED -> COMPLETED / WITHDRAWN`.
`REJECTED`, `WITHDRAWN`, `COMPLETED` are final. `REJECTED`/`WITHDRAWN` require a reason,
collected in the workflow screen and sent to the backend. The frontend only shows the
transitions that are valid from the current status -- the backend independently
rejects anything else with a 409.

## Dashboard endpoints used

- `GET /api/summary` -- total students, total enrollments, average result score.
- `GET /api/summary/courses` -- enrollment count per course (detailed table report).

## Assumptions, limitations, known issues

- **Basic Auth in a SPA**: the backend uses HTTP Basic authentication, not
  JWT. The frontend stores the username/password pair (base64-encoded) in
  `localStorage` after a successful login so the interceptor can attach it to
  every subsequent request, and so the session survives a page refresh. This
  is the simplest approach that matches the backend as-is; a production app
  would use a token-based scheme instead.
- **No dedicated "categories" endpoint**: the backend doesn't expose a list
  of course categories, so the category filter/field is a free-text input
  rather than a backend-populated dropdown. The student/course dropdowns on
  the "New Enrollment" form *are* loaded from the backend (`GET /api/students`,
  `GET /api/courses`).
- **Dashboard is INSTRUCTOR/ADMIN only**: the backend has no
  personal/student-scoped summary endpoint, so students don't see a
  dashboard at all (attempting to visit it redirects to Access Denied).
- **Enrollment workflow permissions**: per the backend's existing
  `SecurityConfig`, only `INSTRUCTOR`/`ADMIN` can create enrollments or run
  any status transition -- a plain `STUDENT` can only view their own
  enrollments. This mirrors the backend exactly; it was not changed for the
  frontend.
