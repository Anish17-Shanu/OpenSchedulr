# OpenSchedulr Architecture

## High-level architecture

OpenSchedulr uses a modular monolith to keep hosting cost at zero or near zero while still separating business concerns cleanly.

## System diagram

```mermaid
flowchart LR
    U[Admin / Faculty User] --> F[React Frontend]
    F --> A[Spring Boot API]
    F --> W[WebSocket Endpoint]
    A --> S[Spring Security + JWT]
    A --> M[Application Modules]
    M --> O[OptaPlanner Solver]
    M --> D[(PostgreSQL / H2)]
    M --> N[Notification Service]
    N --> W
    M --> R[(Redis Optional)]
```

Modules:

- Auth
- Faculty
- Course
- Scheduling
- Timetable
- Notification
- Analytics

## Data flow

### 1. Input flow

- Faculty availability and preferences are stored
- Courses define required teaching demand
- Rooms define capacity and type
- Timeslots define the scheduling grid
- Lecture demands define course-to-faculty assignment counts

### 2. Solver flow

- `LectureDemand` records are expanded into `LectureAssignment` planning entities
- Rooms and timeslots are treated as planning value ranges
- OptaPlanner solves using hard and soft constraints

## Module diagram

```mermaid
flowchart TD
    Auth --> Faculty
    Auth --> Timetable
    Faculty --> Scheduling
    Course --> Scheduling
    Scheduling --> Timetable
    Timetable --> Notification
    Timetable --> Analytics
    Notification --> Frontend[Frontend Clients]
    Analytics --> Frontend
```

Hard constraints:

- No faculty overlap
- No room overlap
- Room type compatibility

Soft constraints:

- Balanced workload
- Earlier slot preference

### 3. Persistence flow

- Solver output becomes `TimetableEntry` rows
- Entries are stored as draft schedule data
- Manual overrides update the same model with source tracking

### 4. Realtime flow

- Schedule changes create notifications
- Notifications are stored in the database
- WebSockets broadcast updates to subscribed users

### 5. Analytics flow

- Timetable entries are aggregated by faculty and room
- Conflict scans produce warning lists
- Frontend renders summary cards and panels

## Request flow example: generate schedule

1. Frontend sends `POST /api/scheduling/generate`
2. Backend authenticates the request
3. Scheduling service loads lecture demands, rooms, and timeslots
4. OptaPlanner computes a best-fit draft schedule
5. Backend persists timetable entries
6. Backend creates notifications and audit logs
7. Frontend refreshes timetable and analytics

### Sequence diagram: generate schedule

```mermaid
sequenceDiagram
    participant Admin
    participant UI as React UI
    participant API as Spring Boot API
    participant Solver as OptaPlanner
    participant DB as Database
    participant WS as WebSocket

    Admin->>UI: Click Generate timetable
    UI->>API: POST /api/scheduling/generate
    API->>DB: Load lecture demands, rooms, timeslots
    API->>Solver: Build and solve planning problem
    Solver-->>API: Best solution
    API->>DB: Save draft timetable entries
    API->>DB: Save notifications and audit logs
    API-->>UI: Generation response
    API->>WS: Push faculty notifications
    UI->>API: Refresh timetable/conflicts/analytics
```

## Request flow example: reschedule entry

1. Frontend sends `PATCH /api/timetable/{entryId}/reschedule`
2. Backend validates entry, room, and timeslot
3. Backend updates the timetable entry
4. Entry source changes to manual
5. Backend emits a notification event

### Sequence diagram: manual override

```mermaid
sequenceDiagram
    participant Admin
    participant UI as React UI
    participant API as Spring Boot API
    participant DB as Database
    participant WS as WebSocket
    participant Faculty

    Admin->>UI: Drag lecture to new slot
    UI->>API: PATCH /api/timetable/{id}/reschedule
    API->>DB: Validate and update timetable entry
    API->>DB: Save audit log and notification
    API->>WS: Broadcast notification
    API-->>UI: Updated timetable entry
    WS-->>Faculty: Reschedule notification
```
