# 餐廳點餐系統

使用 Next.js、SQLite 和 Drizzle ORM 開發的餐廳點餐系統，適用於小型餐廳或攤販的點餐與訂單管理。

## 功能特色

### 客戶端功能

- 瀏覽餐點（依分類顯示）
- 加入購物車
- 調整數量與刪除餐點
- 結帳功能
- 自動生成 6 位數訂單號
- 訂單確認頁面
- Toast 通知反饋

### 店家端功能

- 分類管理（新增、編輯、刪除）
- 餐點管理（上架、編輯、停售、刪除）
- 圖片上傳（儲存在本地 server）
- 訂單管理（查看訂單、更新狀態、標記已付款）
- 訂單列印功能（支援感熱紙標籤機）
- 響應式設計（桌面版使用側邊欄，手機版使用全螢幕對話框）

## 技術架構

- **Frontend**: Next.js 16 (App Router)
- **Backend**: Next.js API Routes
- **Database**: SQLite
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS v4
- **UI**: freeCodeCamp 風格（黑白配色、方形按鈕）
- **Icons**: lucide-react
- **Language**: TypeScript
- **Runtime**: Bun

## 安裝與啟動

### 1. 安裝相依套件

```bash
bun install
```

### 2. 執行資料庫 migration

```bash
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

### 3. 啟動開發伺服器

```bash
bun run dev
```

伺服器會在 <http://localhost:3000> 啟動

## 使用說明

### 客戶點餐流程

1. 訪問首頁 <http://localhost:3000>
2. 選擇分類瀏覽餐點
3. 點擊「加入」將餐點加入購物車
4. 點擊右上角「購物車」按鈕查看購物車
5. 調整數量或刪除餐點
6. 點擊「結帳」完成訂單
7. 系統會顯示 6 位數訂單號（例如：000001）

### 店家管理

訪問 <http://localhost:3000/admin> 進入管理後台

管理後台採用響應式設計：

- 桌面版：側邊欄 (Sidebar) 設計，方便快速切換不同管理功能
- 手機版：全螢幕對話框 (Dialog) 設計，提供更好的觸控體驗

管理功能：

- 分類管理
- 餐點管理
- 訂單管理
- 返回首頁

#### 分類管理 (/admin/categories)

- 新增分類：點擊「+ 新增分類」
- 編輯分類：點擊分類右側的「編輯」
- 刪除分類：點擊「刪除」（注意：會同時刪除該分類下的所有餐點）
- 調整順序：設定顯示順序數值

#### 餐點管理 (/admin/menu)

- 新增餐點：
  1. 點擊「+ 新增餐點」
  2. 填寫餐點資訊（名稱、說明、價格、分類）
  3. 上傳圖片（可選）
  4. 點擊「儲存餐點」
- 停售/上架：點擊餐點右側的「停售」或「上架」
- 刪除餐點：點擊「刪除」

#### 訂單管理 (/admin/orders)

- 查看所有訂單及訂單號
- 點擊訂單查看詳細資訊
- 更新訂單狀態：
  - 處理中 (pending)
  - 準備中 (preparing)
  - 可取餐 (ready)
  - 已完成 (completed)
- 標記付款狀態：點擊付款狀態按鈕切換「已付款」/「未付款」
- 列印訂單：點擊「列印訂單」即可使用感熱紙標籤機列印

## 資料庫結構

### categories (分類表)

- id: 主鍵
- name: 分類名稱
- displayOrder: 顯示順序
- createdAt: 建立時間

### menu_items (餐點表)

- id: 主鍵
- categoryId: 分類 ID (外鍵)
- name: 餐點名稱
- description: 說明
- price: 價格
- imagePath: 圖片路徑
- available: 是否可供應
- createdAt: 建立時間

### orders (訂單表)

- id: 主鍵
- orderNumber: 訂單號（6 位數字）
- status: 狀態 (pending/preparing/ready/completed)
- total: 總金額
- paid: 是否已付款
- createdAt: 建立時間

### order_items (訂單明細表)

- id: 主鍵
- orderId: 訂單 ID (外鍵)
- menuItemId: 餐點 ID (軟引用，可為空)
- menuItemName: 餐點名稱（直接儲存）
- quantity: 數量
- price: 單價

註：訂單明細使用軟引用 (Soft Reference) 設計，即使餐點被刪除，歷史訂單仍可保留完整資訊。

## API Endpoints

### Categories

- GET `/api/categories` - 取得所有分類
- POST `/api/categories` - 新增分類
- GET `/api/categories/[id]` - 取得單一分類
- PATCH `/api/categories/[id]` - 更新分類
- DELETE `/api/categories/[id]` - 刪除分類

### Menu Items

- GET `/api/menu` - 取得所有餐點
- POST `/api/menu` - 新增餐點（含圖片上傳）
- GET `/api/menu/[id]` - 取得單一餐點
- PATCH `/api/menu/[id]` - 更新餐點
- DELETE `/api/menu/[id]` - 刪除餐點

### Orders

- GET `/api/orders` - 取得所有訂單
- GET `/api/orders/[id]` - 取得訂單詳情
- PATCH `/api/orders/[id]` - 更新訂單狀態/付款狀態
- GET `/api/orders/number/[orderNumber]` - 根據訂單號查詢訂單

### Checkout

- POST `/api/checkout` - 結帳（建立訂單並生成訂單號）

## 專案結構

```
/home/ray/project/ordering-app
├── app
│   ├── admin
│   │   ├── categories
│   │   ├── layout.tsx
│   │   ├── menu
│   │   ├── orders
│   │   └── page.tsx
│   ├── api
│   │   ├── categories
│   │   ├── checkout
│   │   ├── menu
│   │   └── orders
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── order
│   │   └── [orderNumber]
│   └── page.tsx
├── bun.lock
├── components
│   └── Toast.tsx
├── contexts
│   └── CartContext.tsx
├── db
│   ├── index.ts
│   └── schema.ts
├── drizzle
│   ├── 0000_noisy_sphinx.sql
│   └── meta
│       ├── 0000_snapshot.json
│       └── _journal.json
├── drizzle.config.ts
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── uploads
│   │   └── menu-items
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── sqlite.db
└── tsconfig.json
```

## 設計特色

### UI/UX 設計

- 黑白配色方案（高對比度）
- 響應式設計（Mobile-First）

## 注意事項

1. **圖片上傳**：圖片會儲存在 `public/uploads/menu-items/` 目錄
2. **訂單號**：系統會自動生成 6 位數字流水號（000001, 000002, ...）
6. **列印功能**：支援感熱紙標籤機，使用 CSS print media query 控制列印內容

## 開發指令

```bash
# 開發模式
bun run dev

# 建置生產版本
bun run build

# 執行生產版本
bun start

# 產生新的 migration
bunx drizzle-kit generate

# 執行 migration
bunx drizzle-kit migrate

# 開啟 Drizzle Studio (資料庫 GUI)
bunx drizzle-kit studio
```

## 系統需求

- Node.js 18+ 或 Bun
- SQLite 3
- 現代瀏覽器（支援 ES6+）
