/* =========================================================
   anam real estate agency — 문의하기 팝업(Modal) 공통 컨트롤러
   index.html(상단 네비 '문의' 버튼)과 detail.html('문의하기' 버튼)에서
   동일한 #modalOverlay 마크업을 공유해 재사용합니다.
   ========================================================= */
(function () {
  const overlay = document.getElementById("modalOverlay");
  if (!overlay) return; // 모달 마크업이 없는 페이지(admin.html 등)에서는 아무 것도 하지 않음

  const closeBtn = document.getElementById("modalClose");
  const form = document.getElementById("inquiryForm");
  const successMsg = document.getElementById("formSuccess");

  // 상세페이지에서는 detail.js가 setContext()로 현재 매물 정보를 넘겨줍니다.
  // 메인 화면에서 열릴 때는 특정 매물과 무관한 일반 문의로 접수됩니다.
  let context = { listingId: null, listingTitle: null };

  function openModal() {
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function bindOpenTrigger(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // 상세페이지 '문의하기' 버튼 + 양쪽 페이지 상단 네비 '문의' 링크 모두 동일한 레이어를 띄웁니다.
  bindOpenTrigger("contactBtn");
  bindOpenTrigger("navContactLink");

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const inquiry = {
        id: Date.now(), // 로컬(데모) 모드 전용 식별자 — Supabase 연동 시 DB가 발급하는 id로 대체됩니다.
        listing_id: context.listingId,
        listing_title: context.listingTitle,
        move_date: form.moveDate.value,
        visit_time: form.visitTime.value,
        other_listing: form.otherListing.value,
        note: form.note.value,
        contact: form.contact.value,
        status: "확인", // 관리자 [문의고객] 탭의 확인 → 상담중 → 완료 흐름 중 최초 상태
        created_at: new Date().toISOString()
      };

      // Supabase가 연동되어 있으면 inquiries 테이블에 저장하고,
      // 아직 연동 전이거나 저장이 실패하면 localStorage에 임시 보관합니다. (README.md 참고)
      const savedRemotely = await saveInquiryRemote(inquiry);
      if (!savedRemotely) saveInquiryLocal(inquiry);

      successMsg.classList.add("is-visible");
      form.reset();
      setTimeout(() => {
        closeModal();
        successMsg.classList.remove("is-visible");
      }, 1600);
    });
  }

  async function saveInquiryRemote(inquiry) {
    if (!window.anamSupabase) return false;
    try {
      const { error } = await window.anamSupabase.from("inquiries").insert(inquiry);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn("Supabase 문의 저장 실패, localStorage로 대체합니다:", err);
      return false;
    }
  }

  function saveInquiryLocal(inquiry) {
    try {
      const existing = JSON.parse(localStorage.getItem("anam-inquiries") || "[]");
      existing.push(inquiry);
      localStorage.setItem("anam-inquiries", JSON.stringify(existing));
    } catch (err) {
      console.warn("문의 임시 저장 실패:", err);
    }
  }

  window.AnamInquiryModal = {
    open: openModal,
    close: closeModal,
    setContext(next) {
      context = { listingId: next.listingId ?? null, listingTitle: next.listingTitle ?? null };
    }
  };
})();
