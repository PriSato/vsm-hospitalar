-- Seed opcional — organização e setores padrão
--
-- Espelha src/lib/sectors.ts (as cores hexadecimais correspondem às
-- variáveis --color-sector-1..7 definidas em src/index.css). Rode depois
-- de db/01_schema.sql. Idempotente: pode rodar mais de uma vez sem duplicar
-- linhas (usa ON CONFLICT sobre organizations.name e sectors(organization_id, name)).

WITH org AS (
  INSERT INTO organizations (name)
  VALUES ('Hospital e Maternidade São Vicente de Paulo')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
)
INSERT INTO sectors (organization_id, name, color, active)
SELECT org.id, s.name, s.color, true
FROM org
CROSS JOIN (
  VALUES
    ('Emergência', '#002157'),
    ('Centro Cirúrgico', '#0a5ca8'),
    ('UTI', '#0d9488'),
    ('Laboratório', '#b98a2e'),
    ('Radiologia', '#7c3aed'),
    ('Farmácia', '#65a30d'),
    ('Internação', '#0891b2')
) AS s(name, color)
ON CONFLICT (organization_id, name) DO NOTHING;
