-- Criação do banco de dados — VSM Hospitalar
--
-- Execute este arquivo conectado a um banco de manutenção (ex: "postgres"),
-- nunca dentro de uma transação (CREATE DATABASE não pode rodar em BEGIN/COMMIT).
--
-- Exemplo via psql:
--   psql "host=SEU_HOST port=5432 dbname=postgres user=SEU_USUARIO" -f db/00_create_database.sql

CREATE DATABASE vsm_hospitalar
  WITH
  ENCODING = 'UTF8'
  TEMPLATE = template0;

-- Se o servidor tiver o locale pt_BR.UTF-8 instalado, prefira criar com
-- LC_COLLATE = 'pt_BR.UTF-8' e LC_CTYPE = 'pt_BR.UTF-8' para ordenação e
-- comparação de texto corretas em português (acentos, cedilha etc.):
--
-- CREATE DATABASE vsm_hospitalar
--   WITH
--   ENCODING = 'UTF8'
--   LC_COLLATE = 'pt_BR.UTF-8'
--   LC_CTYPE = 'pt_BR.UTF-8'
--   TEMPLATE = template0;
