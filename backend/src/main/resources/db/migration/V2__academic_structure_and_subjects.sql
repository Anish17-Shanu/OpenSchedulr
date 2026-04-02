alter table faculty
    add column subjects text not null default '[]';

alter table courses
    add column department varchar(120) not null default 'General';

alter table courses
    add column program varchar(120) not null default 'General';

alter table courses
    add column batch_name varchar(120) not null default 'Batch-A';

alter table courses
    add column section varchar(120) not null default 'Section-A';

update faculty
set subjects = '[]'
where subjects is null;

update courses
set department = 'General',
    program = 'General',
    batch_name = 'Batch-A',
    section = 'Section-A'
where department is null
   or program is null
   or batch_name is null
   or section is null;
