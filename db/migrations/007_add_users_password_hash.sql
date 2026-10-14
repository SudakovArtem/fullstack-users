-- 007_add_users_password_hash.sql
-- Добавляем password_hash для будущей аутентификации.
-- Поле пока nullable, потому что в БД уже есть пользователи без пароля.

ALTER TABLE users
    ADD COLUMN password_hash TEXT;
