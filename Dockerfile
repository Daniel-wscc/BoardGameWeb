FROM node:22-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝所有依賴 (包含打包所需的 devDependencies)
RUN npm install

# 複製其餘專案文件
COPY . .

# 執行 vite build (將前端資源打包並混淆至 dist 目錄)
RUN npm run build

# 把原本未處理的 public 刪除，將處理好的 dist 替換成 public 讓 Server.js 讀取
RUN rm -rf public && mv dist public

# 清理 devDependencies，縮減 image 體積
RUN npm prune --production

# 曝露伺服器運行的 PORT
EXPOSE 3000

# 啟動 Node 伺服器
CMD ["node", "Server.js"]
