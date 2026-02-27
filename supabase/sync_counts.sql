-- supabase/sync_counts.sql
-- Run this SQL in the Supabase SQL Editor if click counts are drifting out of sync.
-- It ensures that global_count matches the sum of country_stats, which is most reliable.

DO $$
DECLARE
  v_true_total bigint;
BEGIN
  -- 1. `country_stats` から真の合計クリック数を取得
  SELECT COALESCE(SUM(clicks), 0) INTO v_true_total
  FROM country_stats;

  -- 2. `global_count` を更新し、総クリック数を実態に合わせる
  UPDATE global_count
  SET total_clicks = v_true_total,
      updated_at = NOW()
  WHERE id = 1;

  RAISE NOTICE 'Counts synchronized successfully. New total updates to: %', v_true_total;
END;
$$;
