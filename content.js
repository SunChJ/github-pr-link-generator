(function() {
    function getRepoInfo() {
        const metaElements = document.querySelectorAll('meta[name="octolytics-dimension-repository_nwo"]');
        if (metaElements.length > 0) {
            return metaElements[0].getAttribute('content');
        }

        const urlParts = window.location.pathname.split('/');
        if (urlParts.length >= 3) {
            return `${urlParts[1]}/${urlParts[2]}`;
        }

        throw new Error('Could not find repo info');
    }

    try {
        // 获取 PR 标题
        const titleElement = document.querySelector('.js-issue-title');
        if (!titleElement) throw new Error('Could not find PR title element');
        const title = titleElement.textContent.trim();

        // 获取 PR 作者
        const authorElement = document.querySelector('.author');
        if (!authorElement) throw new Error('Could not find PR author element');
        const author = authorElement.textContent.trim();

        // 获取 PR 编号
        const numberElement = document.querySelector('.gh-header-number');
        if (!numberElement) throw new Error('Could not find PR number element');
        const prNumber = numberElement.textContent.trim();

        // 获取仓库信息
        const repoInfo = getRepoInfo();

        // 构建富文本链接
        const richLink = `<a href="${window.location.href}">${title} by ${author} · ${prNumber} · ${repoInfo}</a>`;

        // 将链接复制到剪贴板
        const tempElement = document.createElement('div');
        tempElement.innerHTML = richLink;

        if (navigator.clipboard && navigator.clipboard.write) {
            const blob = new Blob([tempElement.innerHTML], { type: 'text/html' });
            const clipboardItem = new ClipboardItem({ 'text/html': blob });
            
            navigator.clipboard.write([clipboardItem]).then(function() {
                console.log('Rich text link copied to clipboard:', richLink);
                alert('Rich text link copied to clipboard!');
            }, function(err) {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy. Please copy the following text manually:\n\n' + tempElement.innerText);
            });
        } else {
            // 降级方案：复制纯文本
            navigator.clipboard.writeText(tempElement.innerText).then(function() {
                console.log('Plain text link copied to clipboard:', tempElement.innerText);
                alert('Plain text link copied to clipboard. Rich text not supported in this browser.');
            }, function(err) {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy. Please copy the following text manually:\n\n' + tempElement.innerText);
            });
        }
    } catch (error) {
        console.error('Error in content script:', error);
        alert('An error occurred: ' + error.message);
    }
})();