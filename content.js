function loadStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}
function start() {
  chrome.runtime.sendMessage({
    type: "info",
    data: "Starting to hide comments...",
  });

  let count = 0;
  loadStorage("config").then((config) => {
    const authorsToHide = [];
    const commentTextsToHide = [];
    if (!config) {
      chrome.runtime.sendMessage({
        type: "error",
        data: "No configured values found",
      });
    }
    if (!Array.isArray(config)) {
      chrome.runtime.sendMessage({
        type: "error",
        data: "Invalid config format, clear existing config and add again",
      });
      return;
    }
    config.forEach((item) => {
      if (item.type === "name") {
        authorsToHide.push(item.text.toLowerCase().trim());
      } else if (item.type === "comment") {
        commentTextsToHide.push(item.text.toLowerCase().trim());
      }
    });

    document.querySelectorAll(".wpd-comment").forEach((comment) => {
      if (comment.style.display === "none") {
        return; // Already hidden
      }
      const authorName = comment
        .querySelector(".wpd-comment-author")
        .textContent.trim()
        .toLowerCase();
      const commentText = comment
        .querySelector(".wpd-comment-text")
        .textContent.trim()
        .toLowerCase();
      if (
        authorsToHide.includes(authorName) ||
        commentTextsToHide.includes(commentText)
      ) {
        comment.style.display = "none";
        count++;
      }
    });
    chrome.runtime.sendMessage({
      type: "info",
      data: `Removed ${count} comments.`,
    });
  });
}
function observeCommentChanges() {
  const observer = new MutationObserver((mutations) => {
    chrome.runtime.sendMessage({
      type: "info",
      data: "Comment list changed, hiding comments...",
    });
    loadStorage("autoHideComments").then((runInBackground) => {
      if (!runInBackground) return;
      start();
    });
  });

  // Wait for wpd-thread-list to exist
  const threadList = document.querySelector(".wpd-thread-list");
  if (threadList) {
    observer.observe(threadList, {
      childList: true,
      subtree: true,
    });
    chrome.runtime.sendMessage({
      type: "info",
      data: "Observer attached to comment list",
    });
  } else {
    // If not found, wait and try again
    setTimeout(observeCommentChanges, 1000);
  }
}
function powerUp() {
  // Check if running in content script vs popup
  if (typeof chrome.runtime !== "undefined") {
    // Check if chrome.runtime.sendMessage exists (content script or popup)
    try {
      // Content scripts can send messages but don't have access to chrome.tabs
      if (typeof chrome.tabs === "undefined") {
        // This is a content script - run automatically
        start();
      } else {
        loadStorage("autoHideComments").then((runInBackground) => {
          if (!runInBackground) return;
          start();
        });
      }
    } catch (e) {
      start();
    }
  }
  observeCommentChanges();
}

powerUp();
