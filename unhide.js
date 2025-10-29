function start() {
  chrome.runtime.sendMessage({
    type: "info",
    data: "Starting to show comments...",
  });

  let count = 0;
  document.querySelectorAll(".wpd-comment").forEach((comment) => {
    if (comment.style.display !== "none") {
      return; // Already shown
    }
    comment.style.display = "block";
    count++;
  });
  chrome.runtime.sendMessage({
    type: "info",
    data: `Show ${count} comments.`,
  });
}

start();
