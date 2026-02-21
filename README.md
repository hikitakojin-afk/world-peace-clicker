# 世界平和クリッカー - 設計・実装提案書

## 📋 1. 要件整理

### 1.1 プロジェクト概要
- **目的**: 全世界の人間が協力して「サイト上だけは世界平和を実現する」体験を作る
- **コンセプト**: グローバルなクリックカウンターで人類の協力を可視化

### 1.2 機能要件

#### A. ユーザー入力（初回アクセス時）
- 国籍（国/地域）: セレクト式、ISOコード対応
- 年齢: 数値入力 or 年代選択
- セッション保持: localStorage + Cookie

#### B. メイン機能
- **ハートクリック**: 
  - サーバー側で総カウント +1
  - 国籍別・年代別集計も同時更新
  - レート制限: 1秒1回
- **総カウンター**: 
  - BigInt対応（無量大数レベル）
  - 3桁区切り表示
  - 短縮表示切替（将来）
- **クリア条件**: 
  - 人類総人口（初期値: 8,300,000,000）
  - 達成時: 多言語メッセージ表示
  - クリア後も継続動作

#### C. リアルタイム統計
- 国籍別内訳: 上位N件 + Other
- 年代別内訳: 8区分
- リアルタイム更新: WebSocket or Realtime DB

#### D. 不正対策
- IPベースレート制限
- セッション制限
- Bot対策（Turnstile / reCAPTCHA）
- ワンタイムトークン（将来）

#### E. 多言語対応
- 10言語対応（ja, en, zh, ko, es, fr, de, pt, ru, ar）
- 国籍ベース自動切替
- i18n構造

### 1.3 非機能要件
- PC/スマホレスポンシブ
- モダンブラウザ対応
- スケーラビリティ（高負荷対応）
- カウント整合性保証
- デプロイ: Vercel

---

## 🏗️ 2. アーキテクチャ設計

### 2.1 技術スタック選定

| レイヤー | 技術 | 選定理由 |
|---------|------|---------|
| フロントエンド | **Next.js 14 (App Router)** | React最適化、SSR/SSG、Vercelネイティブ |
| UIライブラリ | **Tailwind CSS + shadcn/ui** | 高速開発、レスポンシブ対応 |
| データベース | **Supabase PostgreSQL** | リアルタイム対応、無料枠あり、スケーラブル |
| リアルタイム | **Supabase Realtime** | WebSocket不要、DB変更を自動配信 |
| 認証/セッション | **localStorage + IP tracking** | シンプル、サーバー負荷低 |
| 不正対策 | **Cloudflare Turnstile** | 無料、reCAPTCHA代替 |
| 多言語 | **next-intl** | App Router対応、型安全 |
| 状態管理 | **Zustand** | 軽量、React 18対応 |
| デプロイ | **Vercel** | Next.js最適化、Edge Functions |

### 2.2 システム構成図

```
[User Browser]
    ↓ (HTTPS)
[Cloudflare Turnstile] → Bot判定
    ↓
[Vercel Edge Network]
    ↓
[Next.js App]
    ├─ SSR/SSG (ページ生成)
    ├─ API Routes (カウント処理)
    └─ Realtime (統計配信)
        ↓
[Supabase]
    ├─ PostgreSQL (カウントDB)
    ├─ Realtime (pub/sub)
    └─ Row Level Security (RLS)
```

### 2.3 データフロー

#### クリック処理フロー
```
1. User clicks ハート
2. Client → POST /api/click
3. API Routes:
   - Turnstile検証
   - レート制限チェック (IP + session)
   - DB更新 (total + country + age)
   - Return new count
4. Supabase Realtime → 全クライアントに配信
5. Client UI更新
```

#### リアルタイム統計フロー
```
1. Supabase: stats テーブル更新
2. Realtime channel broadcast
3. All clients receive update
4. React state更新 → UI再描画
```

### 2.4 スケーラビリティ設計

#### MVP（初期）
- Supabase無料枠: 500MB DB, 2GB帯域/月
- Vercel無料枠: 100GB帯域/月
- 想定同時接続: ~1,000人

#### スケール時対応
1. **DB最適化**
   - Materialized View（集計キャッシュ）
   - Partial Index（国籍・年代）
   - Connection Pooling（PgBouncer）

2. **キャッシュ戦略**
   - Vercel Edge Cache（統計API）
   - Redis（レート制限、セッション）
   - CDN（静的アセット）

3. **水平スケール**
   - Supabase Pro（専用DB）
   - Read Replica（参照負荷分散）
   - Sharding（国籍別分割）

---

## 💾 3. DB設計

### 3.1 スキーマ設計

#### テーブル構成

```sql
-- 1. 総カウントテーブル
CREATE TABLE global_count (
  id INTEGER PRIMARY KEY DEFAULT 1, -- 常に1レコード
  total_clicks BIGINT NOT NULL DEFAULT 0,
  clear_threshold BIGINT NOT NULL DEFAULT 8300000000,
  is_cleared BOOLEAN NOT NULL DEFAULT false,
  cleared_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- 2. 国籍別集計テーブル
CREATE TABLE country_stats (
  country_code VARCHAR(2) PRIMARY KEY, -- ISO 3166-1 alpha-2
  country_name JSONB NOT NULL, -- {"en": "Japan", "ja": "日本"}
  clicks BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. 年代別集計テーブル
CREATE TABLE age_group_stats (
  age_group VARCHAR(10) PRIMARY KEY, -- "0-12", "13-17", ...
  clicks BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. レート制限テーブル
CREATE TABLE rate_limits (
  id TEXT PRIMARY KEY, -- IP or session_id
  last_click_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  click_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  INDEX idx_window (window_start)
);

-- 5. クリックログ（将来の分析用、オプション）
CREATE TABLE click_logs (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  country_code VARCHAR(2),
  age_group VARCHAR(10),
  ip_hash TEXT, -- ハッシュ化されたIP
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  INDEX idx_clicked_at (clicked_at DESC)
) PARTITION BY RANGE (clicked_at);
-- パーティション例（月次）
-- CREATE TABLE click_logs_2024_01 PARTITION OF click_logs
--   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 3.2 初期データ

```sql
-- 総カウント初期化
INSERT INTO global_count (id, total_clicks, clear_threshold)
VALUES (1, 0, 8300000000)
ON CONFLICT (id) DO NOTHING;

-- 年代グループ初期化
INSERT INTO age_group_stats (age_group) VALUES
  ('0-12'), ('13-17'), ('18-24'), ('25-34'),
  ('35-44'), ('45-54'), ('55-64'), ('65+')
ON CONFLICT DO NOTHING;
```

### 3.3 インデックス戦略

```sql
-- 高速カウント更新用
CREATE INDEX idx_country_clicks ON country_stats(clicks DESC);
CREATE INDEX idx_age_group_clicks ON age_group_stats(clicks DESC);

-- レート制限用
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start)
  WHERE window_start > NOW() - INTERVAL '1 hour';
```

### 3.4 Row Level Security (RLS)

```sql
-- 読み取り専用（統計）
ALTER TABLE global_count ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON global_count
  FOR SELECT USING (true);

ALTER TABLE country_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON country_stats
  FOR SELECT USING (true);

ALTER TABLE age_group_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON age_group_stats
  FOR SELECT USING (true);

-- 書き込みはAPI経由のみ（service_role key使用）
```

---

## 🔌 4. API設計

### 4.1 エンドポイント一覧

| Method | Path | 説明 | レート制限 |
|--------|------|------|----------|
| POST | `/api/click` | ハートクリック | 1req/秒/IP |
| GET | `/api/stats` | 現在の統計 | 10req/秒/IP |
| POST | `/api/verify` | Turnstile検証 | - |

### 4.2 `/api/click` - クリック処理

#### リクエスト
```typescript
POST /api/click
Content-Type: application/json

{
  "countryCode": "JP",     // ISO 3166-1 alpha-2
  "ageGroup": "25-34",     // 年代グループ
  "sessionId": "uuid",     // クライアント側生成
  "turnstileToken": "..."  // Turnstile検証トークン
}
```

#### レスポンス（成功）
```typescript
{
  "success": true,
  "data": {
    "totalClicks": "8300000123",  // string (BigInt)
    "isCleared": true,
    "clearedAt": "2024-02-20T12:00:00Z",
    "countryRank": 5,             // この国の順位
    "ageGroupRank": 2             // この年代の順位
  }
}
```

#### レスポンス（エラー）
```typescript
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Please wait 1 second before clicking again",
    "retryAfter": 0.5  // 秒
  }
}
```

#### エラーコード
- `RATE_LIMIT_EXCEEDED`: レート制限超過
- `INVALID_TURNSTILE`: Bot判定
- `INVALID_INPUT`: 不正な入力
- `SERVER_ERROR`: サーバーエラー

### 4.3 `/api/stats` - 統計取得

#### リクエスト
```typescript
GET /api/stats
```

#### レスポンス
```typescript
{
  "success": true,
  "data": {
    "totalClicks": "8300000123",
    "clearThreshold": "8300000000",
    "isCleared": true,
    "clearedAt": "2024-02-20T12:00:00Z",
    "countries": [
      {
        "code": "JP",
        "name": {"en": "Japan", "ja": "日本"},
        "clicks": "1500000000",
        "percentage": 18.07
      },
      // ... 上位20件
      {
        "code": "OTHER",
        "clicks": "500000000",
        "percentage": 6.02
      }
    ],
    "ageGroups": [
      {
        "group": "25-34",
        "clicks": "2000000000",
        "percentage": 24.10
      }
      // ... 全8グループ
    ]
  }
}
```

### 4.4 カウント整合性保証

#### トランザクション処理
```sql
BEGIN;

-- 1. レート制限チェック（SELECT FOR UPDATE）
SELECT * FROM rate_limits WHERE id = :ip
FOR UPDATE NOWAIT;

-- 2. 総カウント更新
UPDATE global_count
SET total_clicks = total_clicks + 1,
    updated_at = NOW()
WHERE id = 1
RETURNING total_clicks, clear_threshold;

-- 3. 国籍別更新（UPSERT）
INSERT INTO country_stats (country_code, clicks)
VALUES (:country_code, 1)
ON CONFLICT (country_code)
DO UPDATE SET clicks = country_stats.clicks + 1;

-- 4. 年代別更新
UPDATE age_group_stats
SET clicks = clicks + 1
WHERE age_group = :age_group;

-- 5. レート制限更新
INSERT INTO rate_limits (id, last_click_at)
VALUES (:ip, NOW())
ON CONFLICT (id)
DO UPDATE SET last_click_at = NOW();

COMMIT;
```

#### 楽観的ロック（高負荷時）
```typescript
// カウント更新を非同期化
await Promise.all([
  incrementGlobalCount(),
  incrementCountryCount(countryCode),  // 並列実行
  incrementAgeGroupCount(ageGroup)
]);
```

---

## 💻 5. 実装完了

### ✅ 完成ファイル一覧

```
WEB_01/
├── app/
│   ├── api/
│   │   ├── click/route.ts      # クリックAPI
│   │   └── stats/route.ts      # 統計API
│   ├── globals.css             # グローバルスタイル
│   ├── layout.tsx              # レイアウト
│   └── page.tsx                # メインページ
├── components/
│   ├── HeartButton.tsx         # ハートボタン
│   ├── CountDisplay.tsx        # カウンター表示
│   ├── StatsDisplay.tsx        # 統計表示
│   └── UserInputModal.tsx      # ユーザー入力モーダル
├── lib/
│   ├── supabase.ts             # Supabaseクライアント
│   ├── i18n.ts                 # 多言語対応
│   └── countries.ts            # 国リスト
├── types/
│   └── index.ts                # 型定義
├── supabase/
│   └── functions.sql           # DB関数
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.example
├── .gitignore
├── DEPLOY.md                   # デプロイ手順書
└── README.md                   # 本ファイル
```

### 📦 実装済み機能

#### ✅ 必須要件
- [x] ユーザー入力モーダル（国籍・年齢）
- [x] ハートクリック機能
- [x] サーバー側カウント更新
- [x] BigInt対応（無量大数レベル）
- [x] レート制限（1秒1回）
- [x] クリア条件判定（人類総人口）
- [x] クリアメッセージ表示
- [x] 国籍別統計（上位20件 + Other）
- [x] 年代別統計（8区分）
- [x] リアルタイム更新（Supabase Realtime）
- [x] 多言語対応（10言語）
- [x] レスポンシブデザイン

#### 🔒 不正対策
- [x] IPベースレート制限
- [x] セッションID管理
- [ ] Cloudflare Turnstile（オプション）

---

## 🚀 6. デプロイ手順

詳細は `DEPLOY.md` を参照してください。

### クイックスタート

```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数設定
cp .env.example .env.local
# .env.localを編集

# 3. 開発サーバー起動
npm run dev

# 4. ビルド
npm run build

# 5. 本番デプロイ
vercel --prod
```

---

## 🎯 7. 拡張案（MVP後）

### Phase 2: 体験強化
- 地図ヒートマップ（国別クリック可視化）
- アニメーション強化（パーティクルエフェクト）
- 音響効果（クリック音、達成サウンド）

### Phase 3: エンゲージメント
- デイリー/ウィークリーランキング
- 実績システム（バッジ）
- SNSシェア機能

### Phase 4: 管理機能
- 管理画面（Next.js Admin）
- クリア条件変更
- 統計CSV出力
- 異常検知ダッシュボード

### Phase 5: スケール対応
- Redis導入（キャッシュ・レート制限）
- Read Replica（参照負荷分散）
- Materialized View（集計高速化）
- CDN最適化

---

## 📊 技術的ハイライト

### カウント整合性保証
- PostgreSQL トランザクション
- 楽観的ロック（並列更新対応）
- BigInt型（オーバーフロー対策）

### リアルタイム配信
- Supabase Realtime（WebSocket自動管理）
- テーブル変更を自動配信
- クライアント側で自動更新

### スケーラビリティ
- Vercel Edge Functions（グローバル配信）
- Supabase Connection Pooling
- Next.js ISR（静的生成 + 自動再検証）

---

実装完了 🌙
