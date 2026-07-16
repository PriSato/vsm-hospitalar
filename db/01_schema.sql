-- Schema — VSM Hospitalar
--
-- Espelha o modelo de dados em src/types/vsm.ts (plano de arquitetura, seção 3).
-- Execute conectado ao banco "vsm_hospitalar" (ver db/00_create_database.sql).
--
--   psql "host=SEU_HOST port=5432 dbname=vsm_hospitalar user=SEU_USUARIO" -f db/01_schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- fornece gen_random_uuid()

-- ────────────────────────────────────────────────────────────────
-- Organization → Sector
-- ────────────────────────────────────────────────────────────────

CREATE TABLE organizations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sectors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  color           text NOT NULL,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

CREATE INDEX idx_sectors_organization_id ON sectors(organization_id);

-- ────────────────────────────────────────────────────────────────
-- VSMProject — dono é um setor, mas pode envolver vários (multissetorial)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE vsm_projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id       uuid NOT NULL REFERENCES sectors(id) ON DELETE RESTRICT,
  name            text NOT NULL,
  is_multi_sector boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vsm_projects_sector_id ON vsm_projects(sector_id);

-- setores adicionais envolvidos quando is_multi_sector = true
-- (ex: paciente que passa por Emergência → Radiologia → Internação)
CREATE TABLE vsm_project_sectors (
  project_id uuid NOT NULL REFERENCES vsm_projects(id) ON DELETE CASCADE,
  sector_id  uuid NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, sector_id)
);

CREATE INDEX idx_vsm_project_sectors_sector_id ON vsm_project_sectors(sector_id);

-- ────────────────────────────────────────────────────────────────
-- VSMVersion (estado atual / estado futuro / estado ideal)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE vsm_versions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id             uuid NOT NULL REFERENCES vsm_projects(id) ON DELETE CASCADE,
  kind                   text NOT NULL CHECK (kind IN ('atual', 'futuro', 'ideal')),
  -- Metadata (seção 3): demanda de pacientes, capacidade, período de referência
  demand                 integer NOT NULL DEFAULT 0 CHECK (demand >= 0),
  available_time_minutes integer NOT NULL DEFAULT 0 CHECK (available_time_minutes >= 0),
  reference_period_label text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vsm_versions_project_id ON vsm_versions(project_id);

-- ────────────────────────────────────────────────────────────────
-- Nós do canvas (ProcessBox / InventoryNode)
--
-- vsm_nodes é uma tabela-base compartilhada só para permitir que
-- "connections" referencie, com integridade referencial real, tanto
-- etapas (process_boxes) quanto filas de espera (inventory_nodes) —
-- exatamente como Connection.fromId/toId funcionam no modelo TypeScript.
-- process_boxes e inventory_nodes reaproveitam o mesmo id de vsm_nodes
-- (padrão de herança por tabela).
-- ────────────────────────────────────────────────────────────────

CREATE TABLE vsm_nodes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES vsm_versions(id) ON DELETE CASCADE,
  node_type  text NOT NULL CHECK (node_type IN ('process_box', 'inventory'))
);

CREATE INDEX idx_vsm_nodes_version_id ON vsm_nodes(version_id);

-- etapas do atendimento
CREATE TABLE process_boxes (
  id          uuid PRIMARY KEY REFERENCES vsm_nodes(id) ON DELETE CASCADE,
  sector_id   uuid NOT NULL REFERENCES sectors(id) ON DELETE RESTRICT,
  name        text NOT NULL,
  -- minutos — tempo de atendimento de um paciente nesta etapa
  cycle_time  numeric(10, 2) NOT NULL DEFAULT 0 CHECK (cycle_time >= 0),
  -- minutos — tempo de preparo da sala/equipamento entre atendimentos
  setup_time  numeric(10, 2) NOT NULL DEFAULT 0 CHECK (setup_time >= 0),
  -- 0–1 — disponibilidade da equipe/sala para atender
  uptime      numeric(4, 3) NOT NULL DEFAULT 0.9 CHECK (uptime >= 0 AND uptime <= 1),
  -- profissionais necessários simultaneamente nesta etapa
  operators   integer NOT NULL DEFAULT 1 CHECK (operators >= 0),
  position_x  numeric NOT NULL DEFAULT 0,
  position_y  numeric NOT NULL DEFAULT 0
);

CREATE INDEX idx_process_boxes_sector_id ON process_boxes(sector_id);

-- filas/esperas entre etapas ("estoque" no vocabulário de VSM)
CREATE TABLE inventory_nodes (
  id               uuid PRIMARY KEY REFERENCES vsm_nodes(id) ON DELETE CASCADE,
  name             text NOT NULL DEFAULT 'Estoque (fila de espera)',
  patients_waiting integer NOT NULL DEFAULT 0 CHECK (patients_waiting >= 0),
  position_x       numeric NOT NULL DEFAULT 0,
  position_y       numeric NOT NULL DEFAULT 0
);

-- fluxo do paciente e fluxo de informação entre nós (pode cruzar setores)
CREATE TABLE connections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id   uuid NOT NULL REFERENCES vsm_versions(id) ON DELETE CASCADE,
  kind         text NOT NULL CHECK (kind IN ('paciente', 'informacao')),
  from_node_id uuid NOT NULL REFERENCES vsm_nodes(id) ON DELETE CASCADE,
  to_node_id   uuid NOT NULL REFERENCES vsm_nodes(id) ON DELETE CASCADE
);

CREATE INDEX idx_connections_version_id ON connections(version_id);
CREATE INDEX idx_connections_from_node_id ON connections(from_node_id);
CREATE INDEX idx_connections_to_node_id ON connections(to_node_id);

-- ────────────────────────────────────────────────────────────────
-- Comment[] / History[]
--
-- author_name fica como texto livre porque o app ainda não tem
-- autenticação (MVP roda sem backend). Quando o SSO corporativo
-- (Active Directory/SAML) for integrado — plano, seção 11 — troque
-- por author_id uuid REFERENCES users(id).
-- ────────────────────────────────────────────────────────────────

CREATE TABLE comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES vsm_projects(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  text        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_project_id ON comments(project_id);

-- log de auditoria de quem criou/editou cada mapa (plano, seção 11)
CREATE TABLE history_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES vsm_projects(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  action      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_history_entries_project_id ON history_entries(project_id);

-- ────────────────────────────────────────────────────────────────
-- updated_at automático
-- ────────────────────────────────────────────────────────────────

CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vsm_projects_updated_at
  BEFORE UPDATE ON vsm_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vsm_versions_updated_at
  BEFORE UPDATE ON vsm_versions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
