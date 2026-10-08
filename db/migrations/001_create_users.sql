-- 001_create_users.sql
-- Создаём базовую таблицу пользователей.
-- Минимальный набор колонок: id + name.
-- Email и constraints добавим отдельной миграцией.

CREATE TABLE users
(
    id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL
);
