-- 005_add_indexes.sql
-- Индексы под типичные запросы.
-- PRIMARY KEY (project_id, user_id) уже даёт индекс на (project_id, user_id).
-- Добавляем обратный индекс для запросов "в каких проектах участвует user".

CREATE INDEX project_members_user_id_idx
    ON project_members (user_id);

-- Индекс на projects.owner_id — для JOIN users → projects по владельцу.
CREATE INDEX projects_owner_id_idx
    ON projects (owner_id);
