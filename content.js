document.querySelectorAll(".wpd-comment-author").forEach((author) => {
  const authorName = author.textContent.trim();
  if (
    authorName === "Anti Defamation League" ||
    authorName === "American Israel Public Affairs Committee"
  ) {
    // Find the parent comment container
    const commentContainer = author.closest(".wpd-comment");
    if (commentContainer) {
      commentContainer.style.display = "none";
    }
  }
});
