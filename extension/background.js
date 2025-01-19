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

        chrome.action.setPopup({popup: './popup/popup.html'});
        chrome.action.openPopup();
        }
      });
  });
  
// chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
//     //If the url was changed
//     if (changeInfo.url) {
//       const response = await fetch("http://localhost:3000/scanurl", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ url: changeInfo.url })
//       })

//       const result = await response.json();
//       if (result.stats.suspicious || result.stats.malicious) {
//         chrome.action.setPopup({popup: './popup/url_popup.html'});
//         chrome.action.openPopup();
//       }
//     }
//   })