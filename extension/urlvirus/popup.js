document.onload = async function() {
  await chrome.action.disable();
}

document.getElementById('cancelButton').onclick = async function() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  await chrome.tabs.remove(tab?.id);
  window.close();
  chrome.action.setPopup({popup: './popup/popup.html'});
}

document.getElementById('resumeButton').onclick = async function() {
  window.close();
  chrome.action.setPopup({popup: './popup/popup.html'});
}