# 繁體中文偏好
- 無論使用者輸入什麼語言，請一律使用「繁體中文」(Traditional Chinese) 進行回應。
- 使用台灣習慣的技術術語（例如：儲存、執行、虛擬環境）。
- Agent產生的implementation.plan*、task.md*、walkthrought.md*，全部用繁體中文。
- 自動產生 git commit messages/comments時，一律使用繁體中文。

# 網路環境設定
- 因為網路環境問題，需要設定proxy=http://10.160.3.88:8080

# 執行環境規範
- 目前作業系統為 Windows，Shell 為 PowerShell。
- 嚴禁在 `run_shell_command` 中使用 `&&` 或 `||` 進行指令串接（PowerShell 5.1 不支援）。
- 串接多個指令時，請使用分號 `;`。
- 優先使用 Windows 相容的指令路徑與語法。

# Python 執行環境規範
- 在執行、建議或撰寫 Python 程式碼時，必須優先使用 `venv` 虛擬環境，只能用uv指令建立python project和虛擬環境。
- 當需要安裝套件時，請利用uv指令安裝套件到虛擬環境，不要用pip，不要影響base環境。

### 1. 外部資源參考 (Context7 MCP)
- **優先使用 Context7**：在撰寫 Python 程式碼或尋找套件實作範例時，請務必先透過 `context7` MCP 工具檢索最新的官方文件、GitHub 範例或社群最佳實踐。
- **時效性要求**：禁止僅依賴內置的訓練數據（斷代數據）。若涉及熱門框架（如 Pydantic v2, FastAPI, LangChain 等），必須經由 Context7 確認最新語法，以避免使用已棄用 (Deprecated) 的 API。

### 2. 程式風格與最新語法
- **Modern Python**：程式碼必須遵循 Python 3.10+ 的標準。
- **型別提示 (Type Hinting)**：所有函數必須包含完整的類型標註（使用 `typing` 模組）。
- **非同步支援**：若場景允許，優先採用 `asyncio` 進行非同步處理。
- **錯誤處理**：使用具體的 Exception 類別，並搭配完善的錯誤日誌紀錄。