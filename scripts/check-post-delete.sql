-- Why does deleting a post fail?
--
-- Read-only. Paste into the Neon SQL editor and run.
--
-- Deleting a row in `posts` requires every table that references it to give
-- way. Payload's schema does that with ON DELETE CASCADE — the article's
-- relationship rows, its continent-sharing rows and its admin lock row all go
-- with it. A reference that is not CASCADE stops the delete dead, and Payload
-- reports that as "an unknown error has occurred" with nothing to go on.
--
-- Two things come back:
--
--   1. Every foreign key pointing at posts, with its delete rule. Anything
--      whose rule is not CASCADE is a candidate for the block.
--   2. Any *_id column on the two link tables that has no foreign key at all
--      — a column added by hand without the constraint that belongs to it.
--
-- Empty result for section 1 would itself be the answer: no cascade exists.

SELECT
  'FK → posts' AS what,
  tc.table_name AS from_table,
  kcu.column_name AS from_column,
  rc.delete_rule,
  CASE WHEN rc.delete_rule = 'CASCADE' THEN 'ok' ELSE 'BLOCKS DELETE' END AS verdict
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_name = tc.constraint_name
 AND kcu.table_schema = tc.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
 AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints rc
  ON rc.constraint_name = tc.constraint_name
 AND rc.constraint_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND ccu.table_name = 'posts'

UNION ALL

SELECT
  'link column with no FK' AS what,
  c.table_name AS from_table,
  c.column_name AS from_column,
  '(none)' AS delete_rule,
  'NO CONSTRAINT' AS verdict
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name IN ('payload_locked_documents_rels', 'posts_rels', 'posts_share_with_continents')
  AND c.column_name LIKE '%\_id'
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.key_column_usage kcu
    JOIN information_schema.table_constraints tc
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
     AND tc.constraint_type = 'FOREIGN KEY'
    WHERE kcu.table_schema = c.table_schema
      AND kcu.table_name = c.table_name
      AND kcu.column_name = c.column_name
  )

ORDER BY 1, 2, 3;
