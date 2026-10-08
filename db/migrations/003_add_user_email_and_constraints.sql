-- 003_add_user_email_and_constraints.sql
-- Добавляем email к пользователям и ограничения.
-- Email должен быть уникальным, но допускаем NULL
-- (пользователь может быть создан без email, как Alex).

ALTER TABLE users
    ADD COLUMN email TEXT;

-- Уникальность email. В Postgres несколько NULL допускаются в UNIQUE,
-- поэтому пользователи без email не конфликтуют между собой.
ALTER TABLE users
    ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Простая валидация формата email на уровне БД.
-- Полноценная валидация — задача приложения, но базовая защита не помешает.
ALTER TABLE users
    ADD CONSTRAINT users_email_format
        CHECK (email IS NULL OR email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');
