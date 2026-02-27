-- supabase/record_click_tx.sql
-- This RPC executes a single atomic transaction for recording a click.
-- It handles global count check/update, country stats, age group stats, and daily stats in one go.

DROP FUNCTION IF EXISTS record_click(VARCHAR(2), VARCHAR(10), DATE);

CREATE OR REPLACE FUNCTION record_click(p_country_code VARCHAR(2), p_age_group VARCHAR(10), p_date DATE)
RETURNS TABLE (
  success boolean,
  total_clicks bigint,
  clear_threshold bigint,
  is_cleared boolean,
  cleared_at timestamptz
) AS $$
DECLARE
  v_new_total bigint;
  v_threshold bigint;
  v_is_cleared boolean;
  v_cleared_at timestamptz;
BEGIN
  -- 1. 行ロックを取得して総カウントを安全に取得
  SELECT 
    global_count.total_clicks, 
    global_count.clear_threshold, 
    global_count.is_cleared, 
    global_count.cleared_at 
  INTO 
    v_new_total, 
    v_threshold, 
    v_is_cleared, 
    v_cleared_at
  FROM global_count
  WHERE id = 1
  FOR UPDATE;

  -- 2. 目標達成済みなら更新せず現在のステータスをそのまま返す (success = false)
  IF v_new_total >= v_threshold THEN
    RETURN QUERY SELECT false, v_new_total, v_threshold, v_is_cleared, v_cleared_at;
    RETURN;
  END IF;

  -- 3. 総カウント更新処理
  v_new_total := v_new_total + 1;
  
  IF NOT v_is_cleared AND v_new_total >= v_threshold THEN
    v_is_cleared := true;
    v_cleared_at := NOW();
  END IF;

  UPDATE global_count
  SET 
    total_clicks = v_new_total,
    is_cleared = v_is_cleared,
    cleared_at = v_cleared_at,
    updated_at = NOW()
  WHERE id = 1;

  -- 4. 国籍別カウント更新
  INSERT INTO country_stats (country_code, clicks, country_name)
  VALUES (p_country_code, 1, '{}')
  ON CONFLICT (country_code)
  DO UPDATE SET 
    clicks = country_stats.clicks + 1,
    updated_at = NOW();

  -- 5. 年代別カウント更新
  -- 年代別は事前にレコードが存在することを前提として単純な UPDATE にするか、INSERT...ON CONFLICTにする。
  UPDATE age_group_stats
  SET clicks = clicks + 1,
      updated_at = NOW()
  WHERE age_group = p_age_group;

  -- もし対象の年代レコードが存在しなかった場合に備えるなら、下記のように UPSERT化するとより安全です（オプション）
  IF NOT FOUND THEN
    INSERT INTO age_group_stats (age_group, clicks) VALUES (p_age_group, 1);
  END IF;

  -- 6. 日別カウント更新 (存在しない場合は作成)
  INSERT INTO daily_stats (date, clicks, updated_at)
  VALUES (p_date, 1, NOW())
  ON CONFLICT (date)
  DO UPDATE SET 
    clicks = daily_stats.clicks + 1,
    updated_at = NOW();

  -- 全て成功したら success = true として返す
  RETURN QUERY SELECT true, v_new_total, v_threshold, v_is_cleared, v_cleared_at;
END;
$$ LANGUAGE plpgsql;
