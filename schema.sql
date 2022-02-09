CREATE TABLE IF NOT EXISTS public.comments (
  id serial primary key,
  name varchar(32) not null,
  email varchar(64) not null,
  nationalId varchar(10) not null,
  comment text not null,
  date timestamp with time zone not null default current_timestamp
);
