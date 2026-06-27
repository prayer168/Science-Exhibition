# 黑熊老師科展日誌 —— Railway / 容器部署
FROM node:22-bookworm-slim

# puppeteer 改用系統 chromium，不另外下載
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 系統相依：chromium（PDF 匯出）、思源黑體（PDF 中文字型）、better-sqlite3 編譯工具
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      fonts-noto-cjk \
      ca-certificates \
      python3 \
      make \
      g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先裝相依（含 devDependencies，build 需要），並在容器內重新編譯 better-sqlite3
COPY package.json package-lock.json ./
RUN npm ci

# 複製原始碼並建置
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
# 預設資料目錄；Railway 上請改用掛載 Volume 的路徑（並以 DATA_DIR 環境變數覆蓋）
ENV DATA_DIR=/data

EXPOSE 3000
CMD ["npm", "run", "start"]
