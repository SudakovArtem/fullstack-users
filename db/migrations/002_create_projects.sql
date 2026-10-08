-- 002_create_projects.sql
-- Создаём таблицу проектов.
-- Каждый проект принадлежит одному пользователю (owner_id).
-- ON DELETE RESTRICT: нельзя удалить пользователя, пока у него есть проекты.

CREATE TABLE projects
(
    id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name     TEXT    NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES users (id) ON DELETE RESTRICT
);
