document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scan');
  const hintBtn = document.getElementById('hint');
  const clearBtn = document.getElementById('clear');
  const countSpan = document.getElementById('count');

  // 更新筆數顯示
  function updateCount() {
    chrome.storage.local.get('questions', (data) => {
      const questions = data.questions || [];
      countSpan.textContent = questions.length;
    });
  }

  updateCount(); // 初始載入

  scanBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url.startsWith('chrome://') || tabs[0].url.startsWith('about:')) {
        alert('此插件無法在Chrome內建頁面（如chrome://）上運行。請在一般網頁測試。');
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, { action: 'scan' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('訊息傳送失敗:', chrome.runtime.lastError.message);
          alert('無法掃描頁面，請確認頁面已載入完成並支援插件功能。');
          return;
        }
        if (response && response.success) {
          updateCount();
          alert(`成功掃描 ${response.count || 0} 筆新題目`);
        } else {
          alert(response?.message || '掃描失敗，未找到題目或答案');
        }
      });
    });
  });

  hintBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url.startsWith('chrome://') || tabs[0].url.startsWith('about:')) {
        alert('此插件無法在Chrome內建頁面（如chrome://）上運行。請在一般網頁測試。');
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, { action: 'hint' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('訊息傳送失敗:', chrome.runtime.lastError.message);
          alert('無法顯示提示，請確認頁面已載入完成並支援插件功能。');
          return;
        }
        if (response && response.success) {
          //alert('提示已顯示（若有匹配題目）');
        } else {
          //alert('提示失敗，未找到匹配題目');
        }
      });
    });
  });

  clearBtn.addEventListener('click', () => {
    chrome.storage.local.set({ questions: [] }, () => {
      updateCount();
      alert('已清除所有儲存的題目');
    });
  });
});