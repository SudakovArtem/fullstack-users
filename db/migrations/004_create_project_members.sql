-- 004_create_project_members.sql
-- Таблица-связка для many-to-many между projects и users.
-- Составной PRIMARY KEY (project_id, user_id) гарантирует уникальность пары.
-- ON DELETE CASCADE с обеих сторон: удаление проекта или пользователя
-- автоматически убирает связанные membership-записи.

CREATE TABLE project_members
(
    project_id INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role       TEXT        NOT NULL DEFAULT 'member'
        CHECK (role IN ('admin', 'member', 'viewer')),
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, user_id)
);
