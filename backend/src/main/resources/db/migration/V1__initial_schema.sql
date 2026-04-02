create table users (
    id uuid primary key,
    email varchar(255) not null unique,
    password varchar(255) not null,
    role varchar(32) not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

create table faculty (
    id uuid primary key,
    user_id uuid not null unique references users(id),
    full_name varchar(255) not null,
    department varchar(120) not null,
    max_load integer not null,
    availability text not null,
    preferences text not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

create table courses (
    id uuid primary key,
    code varchar(32) not null unique,
    title varchar(255) not null,
    credits integer not null,
    required_hours integer not null,
    student_group varchar(120) not null,
    room_type varchar(64) not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

create table rooms (
    id uuid primary key,
    name varchar(128) not null unique,
    capacity integer not null,
    room_type varchar(64) not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

create table timeslots (
    id uuid primary key,
    day_of_week varchar(16) not null,
    start_time time not null,
    end_time time not null,
    label varchar(64) not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

create table lecture_demands (
    id uuid primary key,
    course_id uuid not null references courses(id),
    faculty_id uuid not null references faculty(id),
    sessions_per_week integer not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

create table timetable_entries (
    id uuid primary key,
    course_id uuid not null references courses(id),
    faculty_id uuid not null references faculty(id),
    room_id uuid not null references rooms(id),
    timeslot_id uuid not null references timeslots(id),
    status varchar(32) not null,
    source varchar(32) not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

create table constraints (
    id uuid primary key,
    constraint_type varchar(64) not null,
    weight integer not null,
    enabled boolean not null,
    config text not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

create table notifications (
    id uuid primary key,
    user_id uuid not null references users(id),
    title varchar(255) not null,
    message varchar(1000) not null,
    read_flag boolean not null,
    created_at timestamp not null
);

create table audit_logs (
    id uuid primary key,
    actor_email varchar(255) not null,
    action varchar(255) not null,
    target_type varchar(128) not null,
    target_id varchar(128) not null,
    detail varchar(2000) not null,
    created_at timestamp not null
);

create index idx_timetable_faculty_timeslot on timetable_entries(faculty_id, timeslot_id);
create index idx_timetable_room_timeslot on timetable_entries(room_id, timeslot_id);
create index idx_timetable_course on timetable_entries(course_id);
create index idx_notifications_user on notifications(user_id, read_flag);
