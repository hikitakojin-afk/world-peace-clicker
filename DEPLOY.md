# デプロイ手順書

## 1. Supabase プロジェクト作成

### 1.1 アカウント作成
1. https://supabase.com にアクセス
2. GitHubアカウントでサインアップ
3. 新規プロジェクト作成

### 1.2 データベース設定

#### スキーマ作成
Supabase SQL Editor で以下を実行：

```sql
-- 1. 総カウントテーブル
CREATE TABLE global_count (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_clicks BIGINT NOT NULL DEFAULT 0,
  clear_threshold BIGINT NOT NULL DEFAULT 8300000000,
  is_cleared BOOLEAN NOT NULL DEFAULT false,
  cleared_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- 2. 国籍別集計テーブル
CREATE TABLE country_stats (
  country_code VARCHAR(2) PRIMARY KEY,
  country_name JSONB NOT NULL DEFAULT '{}',
  clicks BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. 年代別集計テーブル
CREATE TABLE age_group_stats (
  age_group VARCHAR(10) PRIMARY KEY,
  clicks BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. レート制限テーブル
CREATE TABLE rate_limits (
  id TEXT PRIMARY KEY,
  last_click_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  click_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);
CREATE INDEX idx_country_clicks ON country_stats(clicks DESC);
CREATE INDEX idx_age_group_clicks ON age_group_stats(clicks DESC);

-- 初期データ
INSERT INTO global_count (id, total_clicks, clear_threshold)
VALUES (1, 0, 8300000000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO age_group_stats (age_group) VALUES
  ('0-12'), ('13-17'), ('18-24'), ('25-34'),
  ('35-44'), ('45-54'), ('55-64'), ('65+')
ON CONFLICT DO NOTHING;
```

#### RLS (Row Level Security) 設定

```sql
ALTER TABLE global_count ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON global_count FOR SELECT USING (true);

ALTER TABLE country_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON country_stats FOR SELECT USING (true);

ALTER TABLE age_group_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON age_group_stats FOR SELECT USING (true);
```

#### 関数作成

`supabase/functions.sql` の内容を実行

### 1.3 Realtime 有効化

1. Supabase Dashboard → Database → Replication
2. `global_count`, `country_stats`, `age_group_stats` のRealtime を有効化

### 1.4 API キー取得

Settings → API で以下をコピー：
- Project URL
- `anon` key (公開用)
- `service_role` key (サーバー専用、**絶対に公開しない**)

---

## 2. Vercel デプロイ

### 2.1 GitHub リポジトリ作成

```bash
cd WEB_01
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/world-peace-clicker.git
git push -u origin main
```

### 2.2 Vercel プロジェクト作成

1. https://vercel.com にアクセス
2. GitHubアカウントでサインイン
3. "Import Project" → リポジトリ選択
4. Framework Preset: **Next.js** (自動検出)
5. Root Directory: `./`

### 2.3 環境変数設定

Vercel Dashboard → Settings → Environment Variables で設定：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |

### 2.4 デプロイ実行

```bash
npm install -g vercel
vercel --prod
```

または GitHub push で自動デプロイ

---

## 3. ローカル開発環境

### 3.1 依存関係インストール

```bash
cd WEB_01
npm install
```

### 3.2 環境変数設定

`.env.local` ファイル作成：

```bash
cp .env.example .env.local
# .env.localを編集してSupabase認証情報を設定
```

### 3.3 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

---

## 4. 動作確認

### 4.1 基本動作
1. 初回アクセス → モーダルで国籍・年齢入力
2. ハートクリック → カウント増加
3. 統計表示 → リアルタイム更新

### 4.2 レート制限
- 1秒1回制限が機能するか確認
- 連続クリックでエラー表示

### 4.3 クリア条件
- Supabase SQL Editor で手動カウント変更：
  ```sql
  UPDATE global_count SET total_clicks = 8300000000 WHERE id = 1;
  ```
- クリック → クリアメッセージ表示確認

---

## 5. 本番運用

### 5.1 モニタリング

- Vercel Analytics: アクセス解析
- Supabase Dashboard: DB負荷・クエリ監視

### 5.2 スケール対応

#### 無料枠超過時
1. **Supabase Pro** ($25/月)
   - 8GB DB
   - 50GB 帯域
   - Read Replica対応

2. **Vercel Pro** ($20/月)
   - 1TB 帯域
   - Advanced Analytics

#### 高負荷対策
- Materialized View作成（統計キャッシュ）
- Redis導入（レート制限）
- CDN活用（静的アセット）

### 5.3 バックアップ

Supabase Dashboard → Database → Backups
- 自動バックアップ: 毎日
- 手動バックアップ: 重要変更前

---

## 6. トラブルシューティング

### エラー: "Missing Supabase credentials"
→ `.env.local` または Vercel環境変数を確認

### エラー: "Rate limit exceeded"
→ `rate_limits` テーブルをクリア:
```sql
DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
```

### カウントがリアルタイム更新されない
→ Supabase Realtime設定を確認
→ ブラウザコンソールでWebSocket接続確認

---

## 7. 拡張案（将来）

### MVP完成後に追加可能
- 管理画面（クリア条件変更、統計CSV出力）
- 地図ヒートマップ（国別クリック可視化）
- 異常検知（Bot判定強化）
- ランキング報酬（デイリー/ウィークリー）
- SNSシェア機能

---

完成！ 🌙
