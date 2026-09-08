/* =========================================================
   anam real estate agency — 매물 상세 페이지 로직
   ========================================================= */
(function () {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const item = LISTINGS.find((l) => l.id === id) || LISTINGS[0];

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
  }

  /* 문의하기 모달 */
  const overlay = document.getElementById("modalOverlay");
  const openBtn = document.getElementById("contactBtn");
  const closeBtn = document.getElementById("modalClose");
  const form = document.getElementById("inquiryForm");
  const successMsg = document.getElementById("formSuccess");

  function openModal() {
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inquiry = {
      listingId: item.id,
      listingTitle: item.title,
      moveDate: form.moveDate.value,
      visitTime: form.visitTime.value,
      otherListing: form.otherListing.value,
      note: form.note.value,
      contact: form.contact.value,
      submittedAt: new Date().toISOString()
    };

    // NOTE: 데모용 임시 저장소입니다. 실제 서비스에서는 이 지점에서
    // Supabase/Firebase 등 백엔드로 문의 데이터를 저장합니다. (README.md 참고)
    try {
      const existing = JSON.parse(localStorage.getItem("anam-inquiries") || "[]");
      existing.push(inquiry);
      localStorage.setItem("anam-inquiries", JSON.stringify(existing));
    } catch (err) {
      console.warn("문의 임시 저장 실패:", err);
    }

    successMsg.classList.add("is-visible");
    form.reset();
    setTimeout(() => {
      closeModal();
      successMsg.classList.remove("is-visible");
    }, 1600);
  });

  document.addEventListener("anam:lang-changed", render);
  render();
})();
