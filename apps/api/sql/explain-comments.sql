-- First page of one bear's comments, exactly as the API queries it
-- (LIMIT 21 = page size 20 + 1 lookahead row).

\echo '=== WITHOUT index (dropped inside a transaction, ROLLBACK restores it) ==='
BEGIN;
DROP INDEX comments_bear_created_idx;
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, bear_id, author, text, created_at
FROM comments
WHERE bear_id = 'ursus-arctos'
ORDER BY created_at DESC, id DESC
LIMIT 21;
ROLLBACK;

\echo '=== WITH index comments_bear_created_idx (bear_id, created_at, id) ==='
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, bear_id, author, text, created_at
FROM comments
WHERE bear_id = 'ursus-arctos'
ORDER BY created_at DESC, id DESC
LIMIT 21;
