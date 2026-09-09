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
      p.textContent = line;
      bodyEl.appendChild(p);
    });
  }

  document.addEventListener("anam:magazine-updated", render);
  render();
})();
