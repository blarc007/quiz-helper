chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scan') {
    const questions = [];
    const questionElems = document.querySelectorAll('.que.multichoice, .que.allchoice'); // 擴展選擇器涵蓋單/多選

    questionElems.forEach((qElem) => {
      const questionTextElem = qElem.querySelector('.qtext');
      const questionText = questionTextElem ? questionTextElem.textContent.trim() : '';
      
      const answerDiv = qElem.querySelector('.answer');
      if (answerDiv) {
        const options = answerDiv.querySelectorAll('div[class^="r"]');
        const isMultiChoice = qElem.querySelector('input[type="checkbox"]') !== null; // 判斷多選
        let answer = [];
        
        options.forEach((option) => {
          const correctImg = option.querySelector('img[src*="grade_answer"]');
          if (correctImg) {
            // 嘗試多種文字選擇器，確保兼容
            const answerContent = option.querySelector('.flex-fill.ml-1')?.textContent.trim() || 
                                  option.querySelector('.ml-1')?.textContent.trim() || '';
            if (answerContent) {
              answer.push(answerContent); // 收集純文字到陣列
            }
          }
        });
        
        if (questionText && answer.length > 0) {
          const questionData = { question: questionText, answer: isMultiChoice ? answer : answer[0] || '' };
          questions.push(questionData);
        }
      }
    });

    if (questions.length > 0) {
      chrome.storage.local.get('questions', (data) => {
        let stored = data.questions || [];
        // 過濾重複（用question作為key）
        const unique = questions.filter(q => !stored.some(s => s.question === q.question));
        stored = [...stored, ...unique];
        chrome.storage.local.set({ questions: stored }, () => {
          sendResponse({ success: true, count: unique.length });
        });
      });
    } else {
      sendResponse({ success: false, message: '未找到題目或答案' });
    }
    return true;
  } else if (request.action === 'hint') {
    chrome.storage.local.get('questions', (data) => {
      const stored = data.questions || [];
      const questionElems = document.querySelectorAll('.que.multichoice, .que.allchoice'); // 同步調整提示選擇器
      let modified = false;
      
      questionElems.forEach((qElem) => {
        const questionTextElem = qElem.querySelector('.qtext');
        const questionText = questionTextElem ? questionTextElem.textContent.trim() : '';
        const match = stored.find(s => s.question === questionText);
        
        if (match) {
          const options = qElem.querySelectorAll('.answer div[class^="r"]');
          const isMultiChoice = qElem.querySelector('input[type="checkbox"]') !== null;
          const answersToMatch = Array.isArray(match.answer) ? match.answer : [match.answer];
          
          options.forEach((option) => {
            // 嘗試多種文字選擇器
            const optionText = option.querySelector('.ml-1')?.textContent.trim() || 
                               option.querySelector('.flex-fill.ml-1')?.textContent.trim() || '';
            if (answersToMatch.includes(optionText)) {
              // 插入圖標
              const dFlex = option.querySelector('.d-flex.w-100');
              if (dFlex && !dFlex.querySelector('.questioncorrectnessicon')) {
                const img = document.createElement('img');
                img.src = 'https://ilearn.elearning.cht.com.tw/theme/image.php/adaptable/core/1744425936/i/grade_answer';
                img.alt = '';
                img.className = 'questioncorrectnessicon';
                img.style.marginRight = '5px';
                dFlex.insertBefore(img, dFlex.firstChild);
                modified = true;
              }
              
              // 選取checkbox或radio
              const input = option.querySelector('input[type="checkbox"], input[type="radio"]');
              if (input && !input.checked) {
                input.checked = true;
                modified = true;
                // 觸發change事件
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
              }
            }
          });
        }
      });
      sendResponse({ 
        success: true, 
        message: modified ? '已標記並選取匹配的答案' : '未找到匹配的題目或已選取' 
      });
    });
    return true;
  }
});