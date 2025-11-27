BEGIN;

-- 1. Definir los Nombres de Pacientes con un índice
WITH indexed_names AS (
  SELECT
    name_full,
    ROW_NUMBER() OVER () AS row_num
  FROM unnest(ARRAY[
    'Ana Maria Garcia', 'Luis Fernando Martinez', 'Sofia Elena Rodriguez',
    'Javier Antonio Lopez', 'Carolina Andrea Perez', 'Ricardo Jose Gomez',
    'Valeria Isabel Diaz', 'Miguel Angel Sanchez', 'Paula Cristina Torres',
    'Diego Alejandro Flores', 'Maria Fernanda Vargas', 'Jorge Eduardo Ruiz',
    'Daniela Victoria Gil', 'Roberto Carlos Ramos', 'Laura Patricia Morales',
    'Hector David Castro', 'Claudia Alejandra Silva', 'Emilio Nicolas Cruz',
    'Adriana Lucia Herrera', 'Gabriel Andres Ponce', 'Natalia Carolina Rojas',
    'Felipe Santiago Blanco', 'Camila Alejandra Nunez', 'Pedro Joaquin Mendoza',
    'Teresa Juana Reyes'
  ]) AS name_full
),

-- 2. Crear 25 usuarios tipo PATIENT usando los nombres reales
new_users AS (
  INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt")
  SELECT
    'demo_user_' || g.g               AS id,
    'demo_p' || g.g || '@example.com' AS email,
    'demo-pass'                       AS password,
    n.name_full                       AS name,
    'PATIENT'::"Role"                 AS role,
    NOW()                             AS "createdAt",
    NOW()                             AS "updatedAt"
  FROM generate_series(1, 25) AS g(g)
  JOIN indexed_names n ON n.row_num = g.g
  RETURNING "id"
),

-- 3. Crear 25 registros en Patient ligados a esos usuarios
new_patients AS (
  INSERT INTO "Patient" ("id", "userId")
  SELECT
    'demo_patient_' || row_number() OVER () AS id,
    u."id" AS "userId"
  FROM new_users u
  RETURNING "id"
),

-- 4. Insertar 1 sesion Mini Squat 0–45 por cada paciente
sessions_insert AS (
  INSERT INTO "Session"
    ("id",
     "patientId",
     "startedAt",
     "endedAt",
     "durationSecs",
     "romMaxDeg",
     "notes",
     "exerciseId",
     "phaseLabel",
     "sessionType")
  SELECT
    'demo_session_' || row_number() OVER () AS id,
    p.id                                          AS "patientId",
    started_at,
    started_at + make_interval(secs => dur_sec)  AS "endedAt",
    dur_sec                                       AS "durationSecs",
    rom                                           AS "romMaxDeg",
    'Mini Squat 0-45, paciente demo edad ' ||
      edad || ' anios.'                           AS "notes",
    'mini_squat_0_45'                             AS "exerciseId",
    'Fase 2 - Movilidad funcional'                AS "phaseLabel",
    'controlled_mobility'                         AS "sessionType"
  FROM (
    SELECT
      p.id,
      -- Fechas distribuidas en la ultima semana
      now() - (INTERVAL '1 day') * (random() * 7)  AS started_at,
      -- Edad simulada 18–23 anios
      18 + (row_number() OVER (ORDER BY p.id) % 6) AS edad,
      -- ROM entre 40 y 60 grados, 1 decimal
      ROUND((40 + random() * 20)::numeric, 1)      AS rom,
      -- Duracion entre 300 y 600 s
      300 + (random() * 300)::int                  AS dur_sec
    FROM new_patients p
  ) p
  RETURNING 1
)

SELECT 'OK - sesiones insertadas: ' || COUNT(*) AS resultado
FROM sessions_insert;

COMMIT;
