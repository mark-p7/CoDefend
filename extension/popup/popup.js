// upon clicking the scan button, 
// it will will send the URL to the back end for scanning

document.getElementById('scanButtonQuick').onclick = async function() {

    console.log('scanButtonQuick clicked!')

    await chrome.storage.local.get("pausedDownloadIdAndURL", async (data) => {

        if (data.pausedDownloadIdAndURL) {
        // change the HTML to loading!
        document.body.innerHTML = loadingHTML;

        if(data.pausedDownloadIdAndURL){
            const pausedDownloadId = data.pausedDownloadIdAndURL.id;
            const pausedDownloadURL = data.pausedDownloadIdAndURL.url;

            console.log('pausedDownloadId is', pausedDownloadId);
            console.log('pausedDownloadURL is', pausedDownloadURL);
            console.log('sending URL to backend');

            const response = await fetch("http://localhost:3000/scan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: pausedDownloadURL })
            })

            const result = await response.json();
            console.log(result)

            console.log('result.stats.malicious is', result.stats.malicious);
            console.log('results.stats.suspicious is', result.stats.suspicious);

            if(result.stats.malicious === 0 && result.stats.suspicious === 0){
                // Redirect to the novirus page
                window.location.href = '../novirus/novirus.html';
            }
            else {
                // Redirect to the virus page
                window.location.href = '../virusfound/virusfound.html';
            }

            // setTimeout(() => {
            //     console.log('setTimeout is run!')
            //     // Redirect to the success page
            //     window.location.href = '../novirus/novirus.html';
            // }, 3000);

            // setTimeout(() => {
            //     console.log('setTimeout is run!')
            //     // Redirect to the success page
            //     window.location.href = '../virusfound/virusfound.html';
            // }, 1000);

        }
    }
});
};

document.getElementById('scanButtonFull').onclick = async function() {

    console.log('scanButtonFull clicked!')

    await chrome.storage.local.get("pausedDownloadIdAndURL", async (data) => {

        if (data.pausedDownloadIdAndURL) {
        // change the HTML to loading!
        document.body.innerHTML = loadingHTML;

        if(data.pausedDownloadIdAndURL){
            const pausedDownloadId = data.pausedDownloadIdAndURL.id;
            const pausedDownloadURL = data.pausedDownloadIdAndURL.url;

            console.log('pausedDownloadId is', pausedDownloadId);
            console.log('pausedDownloadURL is', pausedDownloadURL);
            console.log('sending URL to backend');

            const response = await fetch("http://localhost:3000/scan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: pausedDownloadURL })
            })

            const result = await response.json();
            console.log(result)

            console.log('result.stats.malicious is', result.stats.malicious);
            console.log('results.stats.suspicious is', result.stats.suspicious);

            if(result.stats.malicious === 0 && result.stats.suspicious === 0){
                // Redirect to the novirus page
                window.location.href = '../novirus/novirus.html';
            }
            else {
                // Redirect to the virus page
                window.location.href = '../virusfound/virusfound.html';
            }

            // setTimeout(() => {
            //     console.log('setTimeout is run!')
            //     // Redirect to the success page
            //     window.location.href = '../novirus/novirus.html';
            // }, 3000);

            // setTimeout(() => {
            //     console.log('setTimeout is run!')
            //     // Redirect to the success page
            //     window.location.href = '../virusfound/virusfound.html';
            // }, 1000);

        }
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



const loadingHTML = 
`
    <div class="container">
        <div class="logo">Co<span>Defend</span>
        <span>
            <svg width="24" height="28" viewBox="0 0 78 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.531436 13.7137C0.675522 12.3802 1.72713 11.3874 3.05587 11.2046C6.78796 10.6911 14.3953 9.52326 19.7965 7.88781C25.6962 6.10142 34.228 2.16306 37.4666 0.629006C38.3012 0.233698 39.2593 0.233698 40.0939 0.629006C43.3325 2.16306 51.8644 6.10142 57.764 7.88781C63.1652 9.52326 70.7726 10.6911 74.5047 11.2046C75.8334 11.3874 76.885 12.3802 77.0291 13.7137C78.2107 24.6491 80.9553 72.8135 39.6238 85.3352C39.0852 85.4984 38.4753 85.4984 37.9367 85.3352C-3.39472 72.8135 -0.650159 24.6491 0.531436 13.7137Z" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M33.6804 72.9918C31.9884 72.2254 30.4179 71.3629 28.9607 70.4182L43.0597 12.7569C44.5158 13.4318 46.2028 14.1877 47.8881 14.886L33.6804 72.9918ZM38.1088 11.1288L24.4623 66.9395C20.9988 63.7658 18.3802 60.051 16.4097 56.1206L26.1612 16.2391C30.0864 14.8692 35.0645 12.5167 37.4229 11.3682C37.6436 11.2607 37.8739 11.1809 38.1088 11.1288Z" fill="white"/>
                <path d="M11.0262 21.5547C11.1529 20.2181 12.2039 19.2073 13.5321 19.0114C16.3931 18.5893 21.4021 17.7528 25.0336 16.6139C29.0785 15.3453 34.8321 12.63 37.4233 11.3681C38.2801 10.9509 39.2809 10.9509 40.1377 11.3681C42.7289 12.63 48.4825 15.3453 52.5274 16.6139C56.159 17.7528 61.1679 18.5893 64.0289 19.0114C65.3572 19.2073 66.4081 20.2181 66.5348 21.5547C67.4021 30.7098 68.6655 65.3075 39.6484 74.6178C39.0942 74.7957 38.4668 74.7957 37.9126 74.6178C8.89552 65.3075 10.1589 30.7098 11.0262 21.5547Z" stroke="#1E8BF5" stroke-width="5"/>
                <path d="M38.4205 39.0909H33.6136C33.5795 38.6932 33.4886 38.3324 33.3409 38.0085C33.1989 37.6847 33 37.4062 32.7443 37.1733C32.4943 36.9347 32.1903 36.7528 31.8324 36.6278C31.4744 36.4972 31.0682 36.4318 30.6136 36.4318C29.8182 36.4318 29.1449 36.625 28.5938 37.0114C28.0483 37.3977 27.6335 37.9517 27.3494 38.6733C27.071 39.3949 26.9318 40.2614 26.9318 41.2727C26.9318 42.3409 27.0739 43.2358 27.358 43.9574C27.6477 44.6733 28.0653 45.2131 28.6108 45.5767C29.1563 45.9347 29.8125 46.1136 30.5795 46.1136C31.017 46.1136 31.4091 46.0597 31.7557 45.9517C32.1023 45.8381 32.4034 45.6761 32.6591 45.4659C32.9148 45.2557 33.1222 45.0028 33.2812 44.7074C33.446 44.4062 33.5568 44.0682 33.6136 43.6932L38.4205 43.7273C38.3636 44.4659 38.1563 45.2187 37.7983 45.9858C37.4403 46.7472 36.9318 47.4517 36.2727 48.0994C35.6193 48.7415 34.8097 49.2585 33.8438 49.6506C32.8778 50.0426 31.7557 50.2386 30.4773 50.2386C28.875 50.2386 27.4375 49.8949 26.1648 49.2074C24.8977 48.5199 23.8949 47.5085 23.1562 46.1733C22.4233 44.8381 22.0568 43.2045 22.0568 41.2727C22.0568 39.3295 22.4318 37.6932 23.1818 36.3636C23.9318 35.0284 24.9432 34.0199 26.2159 33.3381C27.4886 32.6506 28.9091 32.3068 30.4773 32.3068C31.5795 32.3068 32.5938 32.4574 33.5199 32.7585C34.446 33.0597 35.2585 33.5 35.9574 34.0795C36.6563 34.6534 37.2188 35.3608 37.6449 36.2017C38.071 37.0426 38.3295 38.0057 38.4205 39.0909ZM47.2862 50H40.5703V32.5455H47.218C49.0135 32.5455 50.5646 32.8949 51.8714 33.5938C53.1839 34.2869 54.1953 35.2869 54.9055 36.5938C55.6214 37.8949 55.9794 39.4545 55.9794 41.2727C55.9794 43.0909 55.6243 44.6534 54.9141 45.9602C54.2038 47.2614 53.1982 48.2614 51.897 48.9602C50.5959 49.6534 49.0589 50 47.2862 50ZM45.3089 45.9773H47.1158C47.9794 45.9773 48.7152 45.8381 49.3232 45.5597C49.9368 45.2812 50.4027 44.8011 50.7209 44.1193C51.0447 43.4375 51.2067 42.4886 51.2067 41.2727C51.2067 40.0568 51.0419 39.108 50.7124 38.4261C50.3885 37.7443 49.9112 37.2642 49.2805 36.9858C48.6555 36.7074 47.8885 36.5682 46.9794 36.5682H45.3089V45.9773Z" fill="#1481EB"/>
            </svg>
        </span></div>
        <div class="subtitle">Anti-Virus File Scanner</div>

        <div class="progress">
            <div class="spinner">
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="circle"></div>
            </div>
        </div>

        <button class="btn-secondary">Cancel scan</button>
    </div>

`
