// upon clicking the scan button, 
// it will will send the URL to the back end for scanning
document.getElementById('scanButton').onclick = function() {

    document.getElementById('scanButton').style.display = 'block';

    console.log('scanButton clicked!')

    chrome.storage.local.get("pausedDownloadIdAndURL", (data) => {

        if(data.pausedDownloadIdAndURL){
            const pausedDownloadId = data.pausedDownloadIdAndURL.id;
            const pausedDownloadURL = data.pausedDownloadIdAndURL.url;
            
            console.log('pausedDownloadId is', pausedDownloadId);
            console.log('pausedDownloadURL is', pausedDownloadURL);
            console.log('sending URL to backend');
            // fetch("https://your-server-url.com/api/receive-download", {
            // method: "POST",
            // headers: {
            //     "Content-Type": "application/json"
            // },
            // body: JSON.stringify({
            //     url: downloadItem.url
            // })
            // })
            // .then((response) => {
            //     if (response.ok) {
            //     console.log("URL sent to server successfully.");
            //     } else {
            //     console.error("Failed to send URL to server.");
            //     }
            // })
            // .catch((error) => {
            //     console.error("Error sending URL to server:", error);
            // });
        }
    });
}



// document.getElementById('resumeButton').onclick = function () {

//     console.log('CLICKED resumeButton!')
//     chrome.storage.local.get("pausedDownloadId", (data) => {
//       const pausedDownloadId = data.id;
//       const pausedDownloadIdURL = data.URL;

//       if (pausedDownloadId && pausedDownloadIdURL) {
//         chrome.downloads.resume(pausedDownloadId, () => {
//           if (chrome.runtime.lastError) {
//             console.error("Error resuming download:", chrome.runtime.lastError);
//             alert("Failed to resume the download.");
//           } else {
//             console.log("Download resumed:", pausedDownloadId);
//             alert("Download resumed successfully.");
//             chrome.storage.local.set({ pausedDownloadIdAndURL: null});
//           }
//         });
//       } else {
//         console.warn("No paused download to resume.");
//         alert("No paused download to resume.");
//       }
//     });
//   };
  

document.getElementById('cancelButton').onclick = function() {
    // Your onclick handler code here
    console.log('Cancel Download button clicked');
    chrome.storage.local.get("pausedDownloadIdAndURL", (data) => {
        if(data.pausedDownloadIdAndURL){
            const pausedDownloadId = data.pausedDownloadIdAndURL.id;
            chrome.downloads.cancel(pausedDownloadId, () => {
                if (chrome.runtime.lastError) {
                console.error("Error canceling download:", chrome.runtime.lastError);
                alert("Failed to cancel the download.");
                } else {
                console.log("Download canceled:", pausedDownloadId);
                alert("Download canceled successfully.");
                chrome.storage.local.set({ pausedDownloadId: null});

                }
            });
        } else {
          console.warn("No paused download to cancel.");
          alert("No paused download to cancel.");
        }
      });
};