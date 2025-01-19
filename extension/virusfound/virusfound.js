document.getElementById('cancelButton').onclick = function () {
    // Your onclick handler code here
    console.log('Cancel Download button clicked');
    chrome.storage.local.get("pausedDownloadIdAndURL", (data) => {
        if (data.pausedDownloadIdAndURL) {
            const pausedDownloadId = data.pausedDownloadIdAndURL.id;
            chrome.downloads.cancel(pausedDownloadId, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error canceling download:", chrome.runtime.lastError);
                    console.warn("Failed to cancel the download.");
                } else {
                    console.log("Download canceled:", pausedDownloadId);
                    chrome.storage.local.set({ pausedDownloadId: null });
                    // move the user to the cancelled page
                    window.location.href = '../cancelled/cancelled.html';
                }
            });
        } else {
            console.warn("No paused download to cancel.");
        }
    });
};

document.getElementById('resumeButton').onclick = function() {

      chrome.storage.local.get("pausedDownloadIdAndURL", (data) => {
      if (data.pausedDownloadIdAndURL) {
        const pausedDownloadId = data.pausedDownloadIdAndURL.id
        chrome.downloads.resume(pausedDownloadId, () => {
          if (chrome.runtime.lastError) {
            console.error("Error resuming download:", chrome.runtime.lastError);
          } else {
            console.log("Download resumed:", pausedDownloadId);
            chrome.storage.local.set({ pausedDownloadIdAndURL: null});
            window.location.href = '../resumescreen/resumescreen.html';
          }
        });
      } else {
        console.warn("No paused download to resume.");
        
      }
    });
}