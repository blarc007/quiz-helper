# Quiz Helper - Chrome 擴充功能

[![Version](https://img.shields.io/badge/version-1.1-blue.svg)](manifest.json)
[![Manifest](https://img.shields.io/badge/manifest-V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

Quiz Helper 是一個專為特定測驗平台設計的 Chrome 擴充功能，旨在幫助使用者自動掃描已完成的題目與答案，並在下次作答時提供即時的提示與自動勾選功能。

## 🚀 主要功能

- **自動掃描 (Scan)**：一鍵掃描當前頁面中的所有測驗題目與正確答案，並儲存至瀏覽器本地空間 (`chrome.storage.local`)。
- **即時提示 (Hint)**：在作答頁面中，根據已儲存的答案庫，自動標記正確選項（使用綠色打勾圖示）並自動選取對應的選項。
- **重複過濾**：自動判斷題目是否已存在，僅儲存新的題目資訊。
- **本地存儲管理**：提供清除功能，隨時重置您的答案庫。

## 📂 專案結構

```text
quiz-helper/
├── assets/                 # 靜態資源 (圖示)
├── popup/                  # 擴充功能彈出介面 (UI)
│   ├── popup.html
│   └── popup.js
├── scripts/                # 內容腳本 (邏輯處理)
│   └── content.js
├── manifest.json           # 擴充功能設定檔 (Manifest V3)
└── README.md               # 專案文檔
```

## 🛠️ 安裝說明

1. 下載或複製本專案原始碼至您的電腦。
2. 開啟 Google Chrome 瀏覽器，進入 `chrome://extensions/` 頁面。
3. 開啟頁面右上角的「**開發者模式**」。
4. 點擊「**載入解壓縮擴充功能**」。
5. 選擇本專案的根目錄（包含 `manifest.json` 的資料夾）。

## 📖 使用教學

1. **收集答案**：在「回顧測驗結果」或「已完成測驗」頁面，點擊插件圖標並按下「**掃描**」。
2. **獲得提示**：在進行「新的測驗」或「重新作答」時，點擊插件圖標並按下「**提示**」。
3. **管理資料**：查看插件介面下方的「目前暫存筆數」，若需清空請點擊「**清除**」。

## ⚖️ 免責聲明

本工具僅供學術交流與技術研究使用，請遵守相關平台的服務條款與測驗規範。使用者須自行承擔使用本工具所帶來的相關風險。

---
Developed with ❤️ for efficiency.
