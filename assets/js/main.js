/* =========================================================
   anam real estate agency — 메인 랜딩 페이지 로직
   - 최신순 정렬(최대 10건) + 매물 종류/특징 실시간 필터
   ========================================================= */
(function () {
  const listEl = document.getElementById("listingList");
  const countEl = document.getElementById("listingCount");
  const emptyEl = document.getElementById("emptyState");
  const typeSelect = document.getElementById("filterType");
  const chipGroup = document.getElementById("filterFeatures");
  const filterForm = document.getElementById("filterForm");
  const locationInput = document.getElementById("filterLocation");

  const state = { type: "all", features: new Set(), query: "" };

  function lang() { return LangStore.get(); }

  function formatPrice(item) {
    const isEn = lang() === "en";
    const label = isEn ? (item.leaseTypeEn || item.leaseType) : item.leaseType;
    if (item.leaseType === "전세") {
      return isEn
        ? `${label} · ${item.deposit.toLocaleString()}0,000 KRW`
        : `${label} ${item.deposit.toLocaleString()}만원`;
    }
    return isEn
      ? `${label} · ${item.deposit.toLocaleString()}0,000 / ${item.monthlyRent.toLocaleString()}0,000 KRW`
      : `${label} ${item.deposit.toLocaleString()}/${item.monthlyRent.toLocaleString()}만원`;
  }

  function formatDate(iso) {
    const d = new Date(iso);
    const isEn = lang() === "en";
    return isEn
      ? d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }

  function matches(item) {
    if (state.type !== "all" && item.type !== state.type) return false;
    if (state.features.size > 0) {
      for (const f of state.features) {
        if (!item.features.includes(f)) return false;
      }
    }
    if (state.query) {
      const q = state.query;
      const location = (item.location || "").toLowerCase();
      const locationEn = (item.locationEn || "").toLowerCase();
      if (!location.includes(q) && !locationEn.includes(q)) return false;
    }
    return true;
  }

  function render() {
    const isEn = lang() === "en";
    const sorted = [...LISTINGS].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const filtered = sorted.filter(matches).slice(0, 10);

    countEl.textContent = `${filtered.length}${isEn ? " " : ""}${I18N[lang()]["list.count.suffix"]}`;
    listEl.innerHTML = "";

    if (filtered.length === 0) {
      emptyEl.classList.add("is-visible");
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    filtered.forEach((item) => {
      const card = document.createElement("article");
      card.className = "listing-card";

      const title = isEn ? item.titleEn : item.title;
      const location = isEn ? item.locationEn : item.location;
      const typeLabel = isEn ? item.typeEn : item.type;
      const linkLabel = I18N[lang()]["listing.link"];

      card.innerHTML = `
        <a class="listing-photo" href="detail.html?id=${item.id}" aria-label="${title}">
          <img src="${item.images[0]}" alt="${title}" loading="lazy" />
        </a>
        <div class="listing-info">
          <span class="listing-type">${typeLabel}</span>
          <h3 class="listing-title">${title}</h3>
          <dl class="listing-meta">
            <div>
              <dt>${isEn ? "Location" : "위치"}</dt>
              <dd>${location}</dd>
            </div>
            <div>
              <dt>${isEn ? "Price" : "가격"}</dt>
              <dd>${formatPrice(item)}</dd>
            </div>
            <div>
              <dt>${isEn ? "Move-in" : "입주일"}</dt>
              <dd>${formatDate(item.moveInDate)}</dd>
            </div>
          </dl>
          <div class="listing-tags">
            ${item.features.map((f) => `<span class="tag">${f}</span>`).join("")}
          </div>
          <a class="listing-link" href="detail.html?id=${item.id}">${linkLabel}</a>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  function toggleChip(chip) {
    const feature = chip.getAttribute("data-feature");
    if (state.features.has(feature)) {
      state.features.delete(feature);
      chip.classList.remove("is-active");
    } else {
      state.features.add(feature);
      chip.classList.add("is-active");
    }
    render();
  }

  // 라이프스타일 키워드는 관리자 [키워드] 탭에서 등록/수정한 목록(anamGetKeywords)을
  // 기준으로 매번 새로 그려서, 다른 탭에서 저장한 변경 사항도 즉시 반영합니다.
  function renderFeatureChips() {
    const keywords = anamGetKeywords();
    // 더 이상 존재하지 않는 키워드는 선택 상태에서도 제거합니다.
    state.features.forEach((f) => { if (!keywords.includes(f)) state.features.delete(f); });

    chipGroup.innerHTML = "";
    keywords.forEach((feature) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (state.features.has(feature) ? " is-active" : "");
      chip.setAttribute("data-feature", feature);
      chip.textContent = feature;
      chip.addEventListener("click", () => toggleChip(chip));
      chipGroup.appendChild(chip);
    });
  }

  // 매물 종류 옵션 — 관리자 [매물종류/임대방식] 탭에서 등록한 목록(anamGetListingTypes)을
  // 기준으로 매번 새로 그려서, 종류를 추가/삭제해도 필터바에 즉시 반영되도록 합니다.
  function renderTypeOptions() {
    const types = anamGetListingTypes();
    const current = typeSelect.value;
    typeSelect.innerHTML = `<option value="all">${I18N[lang()]["filter.type.all"]}</option>`;
    types.forEach((type) => {
      const opt = document.createElement("option");
      opt.value = type;
      opt.textContent = type;
      typeSelect.appendChild(opt);
    });
    // 삭제된 종류가 선택되어 있었다면 "전체"로 되돌립니다.
    typeSelect.value = types.includes(current) ? current : "all";
    state.type = typeSelect.value;
  }

  typeSelect.addEventListener("change", () => {
    state.type = typeSelect.value;
    render();
  });

  // 위치 검색 — 입력할 때마다 실시간으로 매물 목록을 좁혀줍니다.
  locationInput.addEventListener("input", () => {
    state.query = locationInput.value.trim().toLowerCase();
    render();
  });

  renderFeatureChips();
  renderTypeOptions();
  // 관리자 페이지(admin.html)에서 키워드를 수정하면 다른 탭의 localStorage "storage" 이벤트로 전달됩니다.
  window.addEventListener("storage", (e) => {
    if (e.key === KEYWORD_STORAGE_KEY) { renderFeatureChips(); render(); }
    if (e.key === LISTING_TYPE_STORAGE_KEY) { renderTypeOptions(); render(); }
  });

  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    render();
  });

  // 상세 페이지로 부드럽게 이동 (View Transitions API 지원 시 활용, 미지원 브라우저는 즉시 이동)
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='detail.html']");
    if (!link) return;
    if (!document.startViewTransition) return; // 기본 이동으로 폴백
    e.preventDefault();
    document.startViewTransition(() => {
      window.location.href = link.getAttribute("href");
    });
  });

  document.addEventListener("anam:lang-changed", () => { renderTypeOptions(); render(); });
  document.addEventListener("anam:listings-updated", render); // Supabase 실시간 반영
  document.addEventListener("anam:keywords-updated", () => { renderFeatureChips(); render(); }); // Supabase 실시간 반영
  document.addEventListener("anam:listing-types-updated", () => { renderTypeOptions(); render(); }); // Supabase 실시간 반영
  render();
})();
