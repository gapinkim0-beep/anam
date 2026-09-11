/* =========================================================
   anam real estate agency — 부동산 정보 매거진 상세(info-detail.html) 로직
   ========================================================= */
(function () {
  const titleEl = document.getElementById("postTitle");
  if (!titleEl) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  function formatDate(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (ch) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    ));
  }

  // 본문 한 줄(line)에 "관련 기사" 같은 URL이 포함되어 있으면,
  // 그 URL만 클릭 가능한 링크로 바꿔줍니다. (관리자는 본문에 URL을 그대로 적기만 하면 됩니다)
  const URL_PATTERN = /(https?:\/\/[^\s<]+)/g;
  function linkifyLine(line) {
    return escapeHtml(line).replace(URL_PATTERN, (url) => (
      `<a href="${url}" class="magazine-link" target="_blank" rel="noopener noreferrer">${url}</a>`
    ));
  }

  function render() {
    const post = MAGAZINE_POSTS.find((p) => p.id === id) || MAGAZINE_POSTS[0];
    if (!post) return;

    document.title = `${post.title} — anam real estate agency`;
    titleEl.textContent = post.title;
    document.getElementById("postDate").textContent = formatDate(post.createdAt);
    document.getElementById("postThumb").src = post.thumbnail;
    document.getElementById("postThumb").alt = post.title;

    const bodyEl = document.getElementById("postBody");
    bodyEl.innerHTML = "";
    (post.content || "").split("\n").forEach((line) => {
      if (!line.trim()) return;
      const p = document.createElement("p");
      p.innerHTML = linkifyLine(line);
      bodyEl.appendChild(p);
    });
  }

  document.addEventListener("anam:magazine-updated", render);
  render();
})();
