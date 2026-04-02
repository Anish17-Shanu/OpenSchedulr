# OpenSchedulr API Flow

This guide explains the main backend API flows and shows example requests and responses for local development.

Base URL:

- `http://localhost:8080/api`

Swagger UI:

- `http://localhost:8080/api/docs/swagger`

## Authentication flow

### Login

Endpoint:

- `POST /auth/login`

Request:

```json
{
  "email": "admin@openschedulr.dev",
  "password": "Admin@123"
}
```

Response:

```json
{
  "token": "jwt-token-value",
  "email": "admin@openschedulr.dev",
  "role": "ADMIN"
}
```

Usage:

- Include the returned token in the `Authorization` header:

```http
Authorization: Bearer <jwt-token>
```

## Catalog flow

### List faculty

Endpoint:

- `GET /faculty?page=0&size=10`

Role:

- `ADMIN`

### List courses

Endpoint:

- `GET /courses?page=0&size=10`

Role:

- `ADMIN`, `FACULTY`

### List rooms

Endpoint:

- `GET /catalog/rooms`

Role:

- `ADMIN`, `FACULTY`

### List timeslots

Endpoint:

- `GET /catalog/timeslots`

Role:

- `ADMIN`, `FACULTY`

## Scheduling flow

### Generate timetable

Endpoint:

- `POST /scheduling/generate`

Role:

- `ADMIN`

Request:

- No body required

Response:

```json
{
  "generatedEntries": 4,
  "warnings": []
}
```

Internal flow:

1. Load lecture demands
2. Load rooms and timeslots
3. Build OptaPlanner problem
4. Solve constraints
5. Persist timetable entries as `DRAFT`
6. Notify impacted faculty

## Timetable flow

### List all timetable entries

Endpoint:

- `GET /timetable`

Role:

- `ADMIN`, `FACULTY`

Sample response:

```json
[
  {
    "id": "entry-id",
    "courseId": "course-id",
    "courseCode": "CS501",
    "courseTitle": "Distributed Systems",
    "studentGroup": "BTECH-CSE-SEM5",
    "facultyId": "faculty-id",
    "facultyName": "Dr. Meera Nair",
    "roomId": "room-id",
    "roomName": "Lab-1",
    "timeSlotId": "slot-id",
    "dayOfWeek": "MONDAY",
    "startTime": "09:00:00",
    "endTime": "10:00:00",
    "status": "DRAFT",
    "source": "AUTO"
  }
]
```

### Detect conflicts

Endpoint:

- `GET /timetable/conflicts`

Role:

- `ADMIN`, `FACULTY`

Sample response:

```json
[
  "Faculty conflict: Dr. Meera Nair at Mon 09:00-10:00"
]
```

### Manual reschedule

Endpoint:

- `PATCH /timetable/{entryId}/reschedule`

Role:

- `ADMIN`

Request:

```json
{
  "roomId": "new-room-id",
  "timeSlotId": "new-timeslot-id"
}
```

Response:

```json
{
  "id": "entry-id",
  "courseId": "course-id",
  "courseCode": "CS501",
  "courseTitle": "Distributed Systems",
  "studentGroup": "BTECH-CSE-SEM5",
  "facultyId": "faculty-id",
  "facultyName": "Dr. Meera Nair",
  "roomId": "new-room-id",
  "roomName": "Room-204",
  "timeSlotId": "new-timeslot-id",
  "dayOfWeek": "TUESDAY",
  "startTime": "10:00:00",
  "endTime": "11:00:00",
  "status": "DRAFT",
  "source": "MANUAL"
}
```

### Publish timetable

Endpoint:

- `POST /timetable/publish`

Role:

- `ADMIN`

Request:

- No body required

Result:

- All timetable entries move to `PUBLISHED`

## Faculty dashboard flow

### Faculty profile

Endpoint:

- `GET /faculty/dashboard/{facultyId}`

Role:

- `ADMIN`, `FACULTY`

### Faculty timetable

Endpoint:

- `GET /faculty/dashboard/{facultyId}/timetable`

Role:

- `ADMIN`, `FACULTY`

### Faculty notifications

Endpoint:

- `GET /faculty/dashboard/{email}/notifications`

Role:

- `ADMIN`, `FACULTY`

Sample response:

```json
[
  {
    "id": "notification-id",
    "title": "Schedule refreshed",
    "message": "A new draft timetable is available for CS501",
    "readFlag": false,
    "createdAt": "2026-04-02T16:00:00Z"
  }
]
```

## Analytics flow

### Analytics summary

Endpoint:

- `GET /analytics`

Role:

- `ADMIN`, `FACULTY`

Sample response:

```json
{
  "workloadDistribution": {
    "Dr. Meera Nair": 2,
    "Prof. Arjun Rao": 2
  },
  "roomUtilization": {
    "Lab-1": 2,
    "Room-204": 2
  },
  "totalEntries": 4,
  "totalConflicts": 0
}
```

## Realtime notification flow

WebSocket endpoint:

- `/api/ws`

Topic pattern:

- `/topic/notifications/{email}`

Flow:

1. User logs in
2. Frontend subscribes to the user-specific topic
3. Backend broadcasts notification events after schedule generation or rescheduling
4. Frontend prepends the new notification into the dashboard

## Suggested API testing order

1. `POST /auth/login`
2. `GET /catalog/rooms`
3. `GET /catalog/timeslots`
4. `POST /scheduling/generate`
5. `GET /timetable`
6. `GET /timetable/conflicts`
7. `PATCH /timetable/{entryId}/reschedule`
8. `POST /timetable/publish`
9. `GET /analytics`
