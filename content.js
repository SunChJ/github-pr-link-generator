function getRepoInfo() {
    const metaElement = document.querySelector('meta[name="octolytics-dimension-repository_nwo"]');
    if (metaElement) {
        return metaElement.getAttribute('content');
    }

    const urlParts = window.location.pathname.split('/');
    if (urlParts.length >= 3) {
        return `${urlParts[1]}/${urlParts[2]}`;
    }

    throw new Error('Could not find repo info');
}

function generatePRLink() {
    try {
        console.log('Generating PR link...');
        
        const titleElement = document.querySelector('.js-issue-title');
        console.log('Title element:', titleElement);
        
        const authorElement = document.querySelector('.author');
        console.log('Author element:', authorElement);
        
        const numberElement = document.querySelector('.gh-header-number');
        console.log('Number element:', numberElement);

        if (!titleElement || !authorElement || !numberElement) {
            throw new Error('Could not find required PR elements');
        }

        const title = titleElement.textContent.trim();
        const author = authorElement.textContent.trim();
        const prNumber = numberElement.textContent.trim();
        const repoInfo = getRepoInfo();

        console.log('Generated info:', { title, author, prNumber, repoInfo });

        const richLink = `<a href="${window.location.href}">${title} by ${author} · ${prNumber} · ${repoInfo}</a>`;
        console.log('Rich link:', richLink);

        return { richLink, plainText: `${title} by ${author} · ${prNumber} · ${repoInfo}` };
    } catch (error) {
        console.error('Error generating PR link:', error);
        throw error;
    }
}

function copyToClipboard(richLink, plainText) {
    if (navigator.clipboard && navigator.clipboard.write) {
        const blob = new Blob([richLink], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({ 'text/html': blob });
        
        return navigator.clipboard.write([clipboardItem])
            .then(() => 'Rich text link copied to clipboard!')
            .catch(err => {
                console.error('Failed to copy rich text:', err);
                return navigator.clipboard.writeText(plainText)
                    .then(() => 'Plain text link copied to clipboard.')
                    .catch(err => {
                        console.error('Failed to copy plain text:', err);
                        throw new Error('Failed to copy. Please copy manually.');
                    });
            });
    } else {
        return navigator.clipboard.writeText(plainText)
            .then(() => 'Plain text link copied to clipboard.')
            .catch(err => {
                console.error('Failed to copy text:', err);
                throw new Error('Failed to copy. Please copy manually.');
            });
    }
}
function addButton() {
    const headerActions = document.querySelector('.gh-header-actions');
    if (headerActions && !document.getElementById('copy-pr-link-btn')) {
        const button = document.createElement('button');
        button.id = 'copy-pr-link-btn';
        button.className = 'btn btn-sm';
        button.textContent = 'Copy PR Link';
        button.addEventListener('click', handleButtonClick);
        headerActions.prepend(button);
        chrome.runtime.sendMessage({ action: 'logMessage', message: 'Button added successfully' });
    } else {
        chrome.runtime.sendMessage({ action: 'logMessage', message: 'Header actions not found or button already exists' });
    }
}
  
function handleButtonClick() {
    try {
        const { richLink, plainText } = generatePRLink();
        copyToClipboard(richLink, plainText)
            .then(message => {
                alert(message);
            })
            .catch(error => {
                console.error('Error copying to clipboard:', error);
                alert(error.message);
            });
    } catch (error) {
        console.error('Error handling button click:', error);
        alert('Failed to generate PR link. Please try again.');
    }
}
  
function checkAndAddButton() {
    if (window.location.pathname.includes('/pull/')) {
        const maxAttempts = 10;
        let attempts = 0;

        function tryAddButton() {
        if (attempts >= maxAttempts) {
            chrome.runtime.sendMessage({ action: 'logMessage', message: 'Max attempts reached. Button not added.' });
            return;
        }

        const headerActions = document.querySelector('.gh-header-actions');
        if (headerActions && !document.getElementById('copy-pr-link-btn')) {
            addButton();
        } else if (!headerActions) {
            attempts++;
            setTimeout(tryAddButton, 1000);
        }
        }

        tryAddButton();
    }
}

  // 使用 MutationObserver 来监听 DOM 变化
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        checkAndAddButton();
      }
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Initial check when the script loads
  checkAndAddButton();
  
  // 监听来自背景脚本的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkAndAddButton') {
      checkAndAddButton();
      sendResponse({ status: 'Button check initiated' });
    }
  });