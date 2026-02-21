-- カウントインクリメント関数
CREATE OR REPLACE FUNCTION increment()
RETURNS trigger AS $$
BEGIN
  NEW.total_clicks = OLD.total_clicks + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 国籍別カウントインクリメント
CREATE OR REPLACE FUNCTION increment_country(p_country_code VARCHAR(2))
RETURNS VOID AS $$
BEGIN
  INSERT INTO country_stats (country_code, clicks, country_name)
  VALUES (p_country_code, 1, '{}')
  ON CONFLICT (country_code)
  DO UPDATE SET 
    clicks = country_stats.clicks + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 年代別カウントインクリメント
CREATE OR REPLACE FUNCTION increment_age_group(p_age_group VARCHAR(10))
RETURNS VOID AS $$
BEGIN
  UPDATE age_group_stats
  SET clicks = clicks + 1,
      updated_at = NOW()
  WHERE age_group = p_age_group;
END;
$$ LANGUAGE plpgsql;
