document.addEventListener('DOMContentLoaded', function () { 
    
    chrome.storage.local.get("pausedDownloadIdAndURL", (data) => {

    console.log('data in novirus is', data);

    if(data.pausedDownloadIdAndURL){
        const pausedDownloadId = data.pausedDownloadIdAndURL.id;
        const pausedDownloadURL = data.pausedDownloadIdAndURL.url;
    
        console.log('pausedDownloadId', pausedDownloadId);
        console.log('pausedDownloadURL', pausedDownloadURL);

        // continue the download
        chrome.downloads.resume(pausedDownloadId, () => {
            if (chrome.runtime.lastError) {
                console.error("Error resuming download:", chrome.runtime.lastError);
          } else {
            console.log("Download resumed:", pausedDownloadId);
            chrome.storage.local.set({ pausedDownloadIdAndURL: null});
            // move the user to the resumed page
            window.location.href = '../resumescreen/resumescreen.html';
          }
        });
      } else {
        console.warn("No paused download to resume.");
      }
    });
});