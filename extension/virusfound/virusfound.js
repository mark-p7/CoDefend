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
            alert("Failed to resume the download.");
          } else {
            console.log("Download resumed:", pausedDownloadId);
            alert("Download resumed successfully.");
            chrome.storage.local.set({ pausedDownloadIdAndURL: null});
          }
        });
      } else {
        console.warn("No paused download to resume.");
        alert("No paused download to resume.");
      }
    });
}