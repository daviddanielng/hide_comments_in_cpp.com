chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    // Execute the content.js script on the currently active tab
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  }
});
