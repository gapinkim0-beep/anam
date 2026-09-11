/* =========================================================
   anam real estate agency — 매물 상세 페이지 로직
   ========================================================= */
(function () {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  // Supabase 데이터가 늦게 도착해 LISTINGS 배열이 교체될 수 있으므로,
  // item은 상수로 고정하지 않고 렌더링 시점마다 다시 찾습니다.
  let item = LISTINGS.find((l) => l.id === id) || LISTINGS[0];

  function lang() { return LangStore.get(); }

  function formatPrice(item) {
    const isEn = lang() === "en";
    if (item.leaseType === "전세") {
      return isEn
        ? `Jeonse · ${item.deposit.toLocaleString()}0,000 KRW`
        : `전세 ${item.deposit.toLocaleString()}만원`;
    }
    return isEn
      ? `Monthly · Deposit ${item.deposit.toLocaleString()}0,000 / Rent ${item.monthlyRent.toLocaleString()}0,000 KRW`
      : `월세 보증금 ${item.deposit.toLocaleString()}만원 / 월 ${item.monthlyRent.toLocaleString()}만원`;
  }

  function formatDate(iso) {
    const d = new Date(iso);
    const isEn = lang() === "en";
    return isEn
      ? d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }

  function renderGallery() {
    const mainImage = document.getElementById("mainImage");
    const thumbs = document.getElementById("galleryThumbs");
    mainImage.src = item.images[0];
    mainImage.alt = lang() === "en" ? item.titleEn : item.title;

    thumbs.innerHTML = "";
    item.images.forEach((src, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "is-thumb" + (i === 0 ? " is-active" : "");
      if (i === 0) btn.classList.add("is-active");
      btn.innerHTML = `<img src="${src}" alt="thumbnail ${i + 1}" />`;
      btn.addEventListener("click", () => {
        mainImage.src = src;
        thumbs.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
      thumbs.appendChild(btn);
    });
  }

  // 매물 주소(location)를 기준으로 구글 지도를 임베드합니다.
  // API 키 없이도 쓸 수 있는 'output=embed' 검색 임베드 방식을 사용합니다.
  function renderMap() {
    const mapEl = document.getElementById("listingMap");
    if (!mapEl) return;
    const address = lang() === "en" ? (item.locationEn || item.location) : item.location;
    mapEl.src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  }

  function render() {
    const isEn = lang() === "en";
    document.title = `${isEn ? item.titleEn : item.title} — anam real estate agency`;

    document.getElementById("listingType").textContent = isEn ? item.typeEn : item.type;
    document.getElementById("listingTitle").textContent = isEn ? item.titleEn : item.title;
    document.getElementById("listingLocation").textContent = isEn ? item.locationEn : item.location;
    document.getElementById("listingPrice").textContent = formatPrice(item);
    document.getElementById("listingDesc").textContent = isEn ? item.descriptionEn : item.description;

    document.getElementById("specAddress").textContent = isEn ? item.locationEn : item.location;
    document.getElementById("specLeaseType").textContent = isEn ? item.leaseTypeEn : item.leaseType;
    document.getElementById("specMoveIn").textContent = formatDate(item.moveInDate);
    document.getElementById("specPrice").textContent = formatPrice(item);
    document.getElementById("specStructure").textContent = isEn ? item.structureEn : item.structure;
    document.getElementById("specMaintenance").textContent = isEn ? item.maintenanceFeeEn : item.maintenanceFee;
    document.getElementById("specOptions").textContent = isEn ? item.optionsEn : item.options;
    document.getElementById("specEtc").textContent = isEn ? item.etcEn : item.etc;

    const keywords = isEn ? item.keywordsEn : item.keywords;
    document.getElementById("specKeywords").innerHTML = keywords
      .map((k) => `<span class="tag" style="margin-right:8px;">${k}</span>`)
      .join("");

    renderGallery();
    renderMap();

    // 문의하기 모달은 assets/js/inquiry-modal.js가 공통으로 제어합니다.
    // 현재 매물 정보를 넘겨줘서 문의 접수 시 어떤 매물 문의인지 함께 저장되도록 합니다.
    if (window.AnamInquiryModal) {
      window.AnamInquiryModal.setContext({ listingId: item.id, listingTitle: item.title });
    }
  }

  document.addEventListener("anam:lang-changed", render);
  document.addEventListener("anam:listings-updated", () => {
    item = LISTINGS.find((l) => l.id === id) || LISTINGS[0]; // Supabase 실시간 반영
    render();
  });
  render();
})();
