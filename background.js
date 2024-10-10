chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('github.com')) {
    chrome.tabs.sendMessage(tabId, { action: 'checkAndAddButton' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Error sending message:', chrome.runtime.lastError.message);
      } else if (response) {
        console.log('Message sent successfully:', response);
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'logMessage') {
    console.log('Message from content script:', request.message);
  }
});