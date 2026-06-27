# 🐻 黑熊老師科展日誌

一個記錄科展研究歷程的網站，包含**公開前端日誌牆**與**需登入的管理後台**。
靈感與欄位設計取自《科展研究日誌》學生版。

## 功能

### 前端（日誌牆 `/`）
- 以卡片時間軸方式展示所有研究日誌（依日期排序）
- 每張卡片顯示：日期、第幾次、時間、地點、記錄者，研究內容、發現、問題、待辦、照片等
- **搜尋與篩選**：可依關鍵字、起始／結束日期查詢

### 後端管理（`/admin`，需 Google 登入）
- 日誌列表（表格檢視）＋ 搜尋篩選
- 新增日誌（`/admin/new`）／編輯（`/admin/[id]`）／刪除
- **照片拖拉上傳**：可一次拖入多張圖片，編輯時可刪除個別照片
- **匯出**：單篇或全部日誌可匯出成 **Word（.docx）/ PDF / HTML**，重現原始日誌表格格式

### 核心欄位
依需求設計的記錄欄位：
1. **年月日**（`date`，必填）
2. **當天科展所做的事情**（`content`，必填）
3. **遇到的問題**（`problems`）
4. **待辦事項**（`todos`）

另含輔助欄位：時間、日誌次數、地點、記錄者、發現與數據、照片／檔名編號、下次要改進、照片。

## 技術架構

- **Next.js 16**（App Router）+ TypeScript
- **Tailwind CSS v4**
- **better-sqlite3** — 本機 SQLite 資料庫，檔案存於 `data/journals.db`（首次執行自動建立）
- **NextAuth v5（Auth.js）** — Google 帳號登入，以 email 允許清單控管後台權限
- **docx** — 產生 Word 檔
- **puppeteer** — 將 HTML 轉成 PDF（首次安裝會下載 Chromium）

## 設定 Google 登入

1. 到 [Google Cloud Console → 憑證](https://console.cloud.google.com/apis/credentials) 建立 **OAuth 用戶端 ID**（類型：網頁應用程式）。
2. 「已授權的重新導向 URI」填入：`http://localhost:3000/api/auth/callback/google`
3. 把取得的用戶端 ID／密鑰填入 `.env.local`：

```env
AUTH_SECRET="（已自動產生，勿外流）"
AUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID="你的 Google Client ID"
AUTH_GOOGLE_SECRET="你的 Google Client Secret"
ALLOWED_EMAILS="prayer168@gmail.com"   # 允許進入後台的帳號，多個以逗號分隔
```

> 只有 `ALLOWED_EMAILS` 清單內的 Google 帳號能登入後台；其他人登入會被拒絕。

## 開發

```bash
npm install
npm run dev      # 開發伺服器 http://localhost:3000
npm run build    # 正式建置
npm run start    # 啟動正式版
npm run lint     # ESLint 檢查
```

## 專案結構

```
app/
  page.tsx                  # 前端日誌牆（含搜尋）
  login/page.tsx            # Google 登入頁
  SearchBar.tsx             # 共用搜尋元件
  admin/
    page.tsx                # 後台列表（含搜尋、匯出）
    new/page.tsx            # 新增頁
    [id]/page.tsx           # 編輯頁
    JournalForm.tsx         # 共用表單（含照片上傳）
    PhotoUploader.tsx       # 拖拉式照片上傳
    DeleteButton.tsx        # 刪除按鈕
    ExportMenu.tsx          # 匯出下拉選單
  api/
    auth/[...nextauth]/     # NextAuth 路由
    journals/               # 日誌 CRUD API
    journals/[id]/photos/   # 照片上傳 API
    photos/[id]/            # 照片刪除 API
    export/                 # 匯出 API（html/pdf/docx）
lib/
  db.ts                     # SQLite 連線與 CRUD（含搜尋、照片）
  types.ts                  # 型別與欄位中文標籤
  uploads.ts                # 上傳目錄與圖片驗證
  export-data.ts            # 匯出資料載入（含照片 base64）
  export-html.ts            # HTML 匯出模板
  export-docx.ts            # Word 匯出
  export-pdf.ts             # PDF 匯出（puppeteer）
auth.ts                     # NextAuth 設定
middleware.ts               # 保護 /admin 與寫入型 API
```

## API

| 方法 | 路徑 | 說明 | 需登入 |
|------|------|------|:--:|
| GET | `/api/journals?q=&from=&to=` | 取得（可篩選）日誌 | |
| POST | `/api/journals` | 新增日誌 | ✓ |
| GET | `/api/journals/:id` | 取得單筆 | |
| PUT | `/api/journals/:id` | 更新 | ✓ |
| DELETE | `/api/journals/:id` | 刪除 | ✓ |
| POST | `/api/journals/:id/photos` | 上傳照片（多檔） | ✓ |
| DELETE | `/api/photos/:id` | 刪除照片 | ✓ |
| GET | `/api/export?format=html\|pdf\|docx&id=&q=&from=&to=` | 匯出日誌 | |

## 資料儲存

- 日誌資料：SQLite，存於 `DATA_DIR`（本機預設 `data/journals.db`；Railway 上為 `/data/journals.db`，掛在持久 Volume）
- 上傳照片：存於 `DATA_DIR/uploads`，透過 `/api/uploads/[name]` 路由提供（不再放 `public/`，以便容器重啟後保留）

本機的 `data/` 已加入 `.gitignore`，不會進版控。

---

## 正式部署（Railway）

已部署於 Railway：**https://science-exhibition-production.up.railway.app**

- GitHub repo：`prayer168/Science-Exhibition`（Railway 監看此 repo，push 即自動部署）
- 容器以 `Dockerfile` 建置（Node + Chromium + 思源黑體）
- 持久磁碟：Railway Volume 掛載於 `/data`（日誌與照片都存這裡，重新部署不會遺失）

### Railway 環境變數
| 變數 | 說明 |
|------|------|
| `DATA_DIR` | `/data`（指向 Volume） |
| `AUTH_URL` | `https://science-exhibition-production.up.railway.app`（務必正確，打錯登入會壞） |
| `AUTH_SECRET` | NextAuth 簽章用隨機字串 |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth 憑證 |
| `ALLOWED_EMAILS` | 允許登入後台的 Google 帳號（逗號分隔） |

> Railway 會自動注入 `PORT`（目前為 8080）；公開網域的 target port 需與其一致。

---

## 如何修改網站（日常維護流程）

**核心：把改動 push 到 GitHub，Railway 就會自動重新部署。**

1. **本機改程式碼**
   ```bash
   cd science-exhibition
   # 編輯檔案…
   ```
2. **本機測試（建議）**
   ```bash
   npm run dev   # http://localhost:3000，測完 Ctrl+C
   ```
3. **推上 GitHub（觸發自動部署）**
   ```bash
   git add -A
   git commit -m "描述改動"
   git push
   ```
4. **Railway 自動部署** — 在 Railway → Deployments 看進度，約 2–5 分鐘變 Active，開網址確認。

### 常見維護情境
| 想做什麼 | 怎麼做 |
|---------|--------|
| 改功能 / 版面 | 改程式 → `git push` → 等 Railway 部署 |
| 改環境變數（密鑰、允許 email…） | Railway → Variables 直接改（會自動重部署，**不用** push） |
| 新增可登入的人 | `ALLOWED_EMAILS` 加 email；並到 Google「測試使用者」加同一個 email |
| 改壞了要還原 | Railway → Deployments → 選正常的舊版 → ⋮ → Redeploy |
| 看錯誤 | Railway → Deployments → 最新部署 → Deploy / Build Logs |
| 備份資料 | Railway → Backups 分頁設定 Volume 備份 |

### ⚠️ 注意
- `.env.local`（含本機密鑰）永不進版控；正式密鑰只存在 Railway，兩邊分開。
- `AUTH_URL` 一定要是正確的正式網址，打錯會導致登入失敗。
- 不要刪除 `/data` Volume，否則所有日誌與照片會消失。
- 資料庫結構（schema）大改時，因使用 SQLite，可能需處理既有資料，建議謹慎進行。
