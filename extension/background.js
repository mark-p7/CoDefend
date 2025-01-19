chrome.downloads.onCreated.addListener((downloadItem) => {
    // Pause the download
    chrome.downloads.pause(downloadItem.id, () => {
      if (chrome.runtime.lastError) {
        console.error("Error pausing download:", chrome.runtime.lastError);

      } else {
        console.log("Download paused:", downloadItem.url);
        console.log('download id is', downloadItem.id);
        
          // Show notification OLD STUFF MAYBE DELETE
        //   chrome.notifications.create({
        //     type: "basic",
        //     iconUrl: "hello_extensions.png", // Path to your extension icon
        //     title: "Download Paused",
        //     message: `The download from ${downloadItem.url} has been paused.`,
        // });

        chrome.storage.local.set({ pausedDownloadIdAndURL: { id: downloadItem.id, url: downloadItem.url } });
      
        chrome.action.openPopup();
        }
      });
  });
  