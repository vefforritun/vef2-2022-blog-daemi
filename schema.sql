CREATE TABLE IF NOT EXISTS public.comments (
  id serial primary key,
  name varchar(128) not null,
  email varchar(64) not null,
  nationalId varchar(10) not null,
  comment text not null,
  date timestamp with time zone not null default current_timestamp
);

CREATE TABLE users (
  id serial primary key,
  username character varying(255) NOT NULL,
  password character varying(255) NOT NULL
);

INSERT INTO users (username, password) VALUES ('admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');

-- MUNA AÐ KEYRA!
-- ALTER TABLE public.comments
--    ALTER COLUMN name TYPE character varying(128) COLLATE pg_catalog."default";
