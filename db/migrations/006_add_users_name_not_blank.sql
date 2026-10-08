-- 006_add_users_name_not_blank.sql
-- В исходной схеме было CHECK (length(trim(name)) > 0),
-- но при разбиении на миграции (001/003) это ограничение потерялось.
-- Не переписываем историю — догоняем схему новой миграцией.

ALTER TABLE users
    ADD CONSTRAINT users_name_not_blank
        CHECK (length(trim(name)) > 0);
