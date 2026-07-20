// ── 平台偵測 ─────────────────────────────────────────────
function isMSForms() {
  return window.location.hostname === 'forms.cloud.microsoft';
}

// ── Microsoft Forms：掃描結果頁的正確答案 ──────────────────
function scanMSForms(sendResponse) {
  const isResultPage = !!document.querySelector('[data-automation-id="totalScore"]');
  if (!isResultPage) {
    sendResponse({ success: false, message: '請先提交測驗，再到「檢視結果」頁面執行掃描' });
    return;
  }

  const questionElems = document.querySelectorAll('[data-automation-id="questionItem"]');
  const scanned = [];

  questionElems.forEach((q) => {
    const titleElem = q.querySelector('[data-automation-id="questionTitle"] .text-format-content');
    const questionText = titleElem?.textContent?.trim();
    if (!questionText) return;

    const isMulti = q.querySelector('input[type="checkbox"]') !== null;
    const correctAnswers = [];

    q.querySelectorAll('[data-automation-id="choiceItem"]').forEach((choice) => {
      if (choice.querySelector('[title="正確答案"]')) {
        const val = choice.querySelector('[data-automation-value]')?.getAttribute('data-automation-value')
                 || choice.textContent?.trim();
        if (val) correctAnswers.push(val);
      }
    });

    if (correctAnswers.length > 0) {
      scanned.push({
        question: questionText,
        answer: isMulti ? correctAnswers : (correctAnswers[0] || ''),
      });
    }
  });

  if (scanned.length === 0) {
    sendResponse({ success: false, message: '未找到題目或正確答案，請確認在「檢視結果」頁面' });
    return;
  }

  chrome.storage.local.get('questions', (data) => {
    let stored = data.questions || [];
    const unique = scanned.filter(q => !stored.some(s => s.question === q.question));
    stored = [...stored, ...unique];
    chrome.storage.local.set({ questions: stored }, () => {
      sendResponse({ success: true, count: unique.length });
    });
  });
}

// ── Microsoft Forms：在作答頁標記並勾選正確答案 ────────────
function hintMSForms(sendResponse) {
  chrome.storage.local.get('questions', (data) => {
    const stored = data.questions || [];
    const questionElems = document.querySelectorAll('[data-automation-id="questionItem"]');
    let modified = false;

    questionElems.forEach((q) => {
      const titleElem = q.querySelector('[data-automation-id="questionTitle"] .text-format-content');
      const questionText = titleElem?.textContent?.trim();
      const match = stored.find(s => s.question === questionText);
      if (!match) return;

      const answersToMatch = Array.isArray(match.answer) ? match.answer : [match.answer];

      q.querySelectorAll('[data-automation-id="choiceItem"]').forEach((choice) => {
        const val = choice.querySelector('[data-automation-value]')?.getAttribute('data-automation-value');
        if (!val || !answersToMatch.includes(val)) return;

        // 插入綠色打勾圖示
        if (!choice.querySelector('.quiz-helper-icon')) {
          const label = choice.querySelector('label');
          if (label) {
            const iconSpan = document.createElement('span');
            iconSpan.className = 'quiz-helper-icon';
            iconSpan.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="3"
                   stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px;vertical-align:middle;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>`;
            label.insertBefore(iconSpan, label.firstChild);
            modified = true;
          }
        }

        // 勾選選項（使用 React 相容的 label.click() 方式）
        const input = choice.querySelector('input[type="checkbox"], input[type="radio"]');
        if (input && !input.checked) {
          const label = choice.querySelector('label');
          if (label) {
            label.click();
            modified = true;
          }
        }
      });
    });

    sendResponse({
      success: true,
      message: modified ? '已標記並選取匹配的答案' : '未找到匹配的題目或已選取',
    });
  });
}

// ── CHT 平台：掃描已完成測驗的正確答案 ──────────────────────
function scanCHT(sendResponse) {
  const questions = [];
  const questionElems = document.querySelectorAll('.que.multichoice, .que.allchoice');

  questionElems.forEach((qElem) => {
    const questionTextElem = qElem.querySelector('.qtext');
    const questionText = questionTextElem ? questionTextElem.textContent.trim() : '';

    const answerDiv = qElem.querySelector('.answer');
    if (answerDiv) {
      const options = answerDiv.querySelectorAll('div[class^="r"]');
      const isMultiChoice = qElem.querySelector('input[type="checkbox"]') !== null;
      let answer = [];

      options.forEach((option) => {
        const correctImg = option.querySelector('img[src*="grade_answer"]');
        if (correctImg) {
          const answerContent = option.querySelector('.flex-fill.ms-1')?.textContent.trim()
                             || option.querySelector('.flex-fill.ml-1')?.textContent.trim()
                             || option.querySelector('.ms-1')?.textContent.trim()
                             || option.querySelector('.ml-1')?.textContent.trim() || '';
          if (answerContent) answer.push(answerContent);
        }
      });

      if (questionText && answer.length > 0) {
        questions.push({ question: questionText, answer: isMultiChoice ? answer : answer[0] || '' });
      }
    }
  });

  if (questions.length > 0) {
    chrome.storage.local.get('questions', (data) => {
      let stored = data.questions || [];
      const unique = questions.filter(q => !stored.some(s => s.question === q.question));
      stored = [...stored, ...unique];
      chrome.storage.local.set({ questions: stored }, () => {
        sendResponse({ success: true, count: unique.length });
      });
    });
  } else {
    sendResponse({ success: false, message: '未找到題目或答案' });
  }
}

// ── CHT 平台：在作答頁標記並勾選正確答案 ────────────────────
function hintCHT(sendResponse) {
  chrome.storage.local.get('questions', (data) => {
    const stored = data.questions || [];
    const questionElems = document.querySelectorAll('.que.multichoice, .que.allchoice');
    let modified = false;

    questionElems.forEach((qElem) => {
      const questionTextElem = qElem.querySelector('.qtext');
      const questionText = questionTextElem ? questionTextElem.textContent.trim() : '';
      const match = stored.find(s => s.question === questionText);

      if (match) {
        const options = qElem.querySelectorAll('.answer div[class^="r"]');
        const answersToMatch = Array.isArray(match.answer) ? match.answer : [match.answer];

        options.forEach((option) => {
          const optionText = option.querySelector('.flex-fill.ms-1')?.textContent.trim()
                          || option.querySelector('.flex-fill.ml-1')?.textContent.trim()
                          || option.querySelector('.ms-1')?.textContent.trim()
                          || option.querySelector('.ml-1')?.textContent.trim() || '';
          if (answersToMatch.includes(optionText)) {
            const dFlex = option.querySelector('[data-region="answer-label"]')
                       || option.querySelector('.d-flex.w-auto')
                       || option.querySelector('.d-flex.w-100');
            if (dFlex && !dFlex.querySelector('.quiz-helper-icon')) {
              const iconSpan = document.createElement('span');
              iconSpan.className = 'quiz-helper-icon';
              iconSpan.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="3"
                     stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px;vertical-align:middle;">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>`;
              dFlex.insertBefore(iconSpan, dFlex.firstChild);
              modified = true;
            }

            const input = option.querySelector('input[type="checkbox"], input[type="radio"]');
            if (input && !input.checked) {
              input.checked = true;
              modified = true;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      }
    });

    sendResponse({
      success: true,
      message: modified ? '已標記並選取匹配的答案' : '未找到匹配的題目或已選取',
    });
  });
}

// ── 訊息監聽器 ────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scan') {
    if (isMSForms()) {
      scanMSForms(sendResponse);
    } else {
      scanCHT(sendResponse);
    }
    return true;
  } else if (request.action === 'hint') {
    if (isMSForms()) {
      hintMSForms(sendResponse);
    } else {
      hintCHT(sendResponse);
    }
    return true;
  }
});