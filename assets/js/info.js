/* =========================================================
   anam real estate agency — 부동산 정보 매거진 목록(info.html) 로직
   ========================================================= */
(function () {
  const listEl = document.getElementById("magazineList");
  const emptyEl = document.getElementById("magazineEmpty");
  if (!listEl) return;

  function formatDate(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }

  function render() {
    const sorted = [...MAGAZINE_POSTS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    listEl.innerHTML = "";

    if (sorted.length === 0) {
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    sorted.forEach((post) => {
      const card = document.createElement("article");
      card.className = "magazine-card";
      const excerpt = (post.content || "").split("\n").find((line) => line.trim()) || "";
      card.innerHTML = `
        <a class="magazine-photo" href="info-detail.html?id=${post.id}" aria-label="${post.title}">
          <img src="${post.thumbnail}" alt="${post.title}" loading="lazy" />
        </a>
        <div class="magazine-info">
          <span class="magazine-date">${formatDate(post.createdAt)}</span>
          <h3 class="magazine-title"><a href="info-detail.html?id=${post.id}">${post.title}</a></h3>
          <p class="magazine-excerpt">${excerpt}</p>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  document.addEventListener("anam:magazine-updated", render);
  render();
})();
