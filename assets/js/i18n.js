/* =========================================================
   anam real estate agency — 간단한 다국어(EN/KR) 토글
   ========================================================= */
const I18N = {
  kr: {
    "nav.listings": "매물",
    "nav.about": "소개글",
    "nav.info": "부동산정보",
    "nav.contact": "문의",
    "hero.title": "변화하는 삶의 방식에 맞춰",
    "hero.sub": "라이프 스타일에 맞는 집을 하우스 메이트처럼 찾아드릴께요.",
    "filter.location.label": "위치 검색",
    "filter.location.placeholder": "지역명으로 검색 (예: 안암동)",
    "filter.type.label": "매물 종류",
    "filter.type.all": "전체",
    "filter.feature.label": "매물 특징",
    "filter.submit": "검색",
    "list.count.suffix": "건",
    "list.empty": "조건에 맞는 매물이 없습니다. 필터를 조정해 보세요.",
    "listing.link": "자세히 보기 →",
    "footer.tagline": "라이프스타일을 중개합니다. 안암·고려대 일대 원룸·주택·상가 전문 중개.",
    "footer.col1": "메뉴",
    "footer.col2": "고객지원",
    "footer.col3": "연락처",
    "footer.support1": "이용안내",
    "footer.support2": "자주 묻는 질문",
    "footer.support3": "관리자 문의",
    "footer.rights": "© 2026 anam real estate agency. All rights reserved.",
    "detail.back": "← 목록으로",
    "detail.contact": "문의하기",
    "detail.admin_note": "관리자 입력 영역 — 매물 소개글은 관리자가 언제든 동적으로 수정할 수 있습니다.",
    "spec.address": "주소",
    "spec.leaseType": "임대방식",
    "spec.moveIn": "입주일",
    "spec.price": "가격",
    "spec.structure": "구조",
    "spec.maintenance": "관리비",
    "spec.options": "옵션",
    "spec.etc": "기타",
    "spec.keywords": "키워드",
    "detail.map_heading": "위치",
    "modal.title": "문의하기",
    "modal.moveDate": "이사 일자",
    "modal.visitTime": "방문 원하는 시간",
    "modal.otherListing": "다른 찾는 매물",
    "modal.otherListingPh": "예) 안암동 위주로 오피스텔 추가로 보고 싶어요",
    "modal.note": "기타 사항",
    "modal.notePh": "궁금하신 점을 자유롭게 남겨주세요",
    "modal.contact": "연락처",
    "modal.contactPh": "010-0000-0000",
    "modal.submit": "문의 남기기",
    "modal.success": "문의가 접수되었습니다. 빠르게 연락드릴게요!"
  },
  en: {
    "nav.listings": "Listings",
    "nav.about": "About",
    "nav.info": "Real Estate Info",
    "nav.contact": "Contact",
    "hero.title": "Made for the way you live now",
    "hero.sub": "We'll find the home that fits your lifestyle, like a housemate would.",
    "filter.location.label": "Search by Location",
    "filter.location.placeholder": "Search by area (e.g. Anam-dong)",
    "filter.type.label": "Property Type",
    "filter.type.all": "All",
    "filter.feature.label": "Features",
    "filter.submit": "Search",
    "list.count.suffix": "listings",
    "list.empty": "No listings match your filters. Try adjusting them.",
    "listing.link": "View details →",
    "footer.tagline": "We mediate lifestyle. Studio, house & retail leasing around Anam & Korea University.",
    "footer.col1": "Menu",
    "footer.col2": "Support",
    "footer.col3": "Contact",
    "footer.support1": "How it works",
    "footer.support2": "FAQ",
    "footer.support3": "Admin inquiry",
    "footer.rights": "© 2026 anam real estate agency. All rights reserved.",
    "detail.back": "← Back to listings",
    "detail.contact": "Contact Us",
    "detail.admin_note": "Admin content area — this listing description can be edited dynamically by an administrator at any time.",
    "spec.address": "Address",
    "spec.leaseType": "Lease Type",
    "spec.moveIn": "Move-in Date",
    "spec.price": "Price",
    "spec.structure": "Structure",
    "spec.maintenance": "Maintenance Fee",
    "spec.options": "Options",
    "spec.etc": "Etc.",
    "spec.keywords": "Keywords",
    "detail.map_heading": "Location",
    "modal.title": "Contact Us",
    "modal.moveDate": "Move-in Date",
    "modal.visitTime": "Preferred Visit Time",
    "modal.otherListing": "Other Listings You're Looking For",
    "modal.otherListingPh": "e.g. I'd also like to see more studios around Anam-dong",
    "modal.note": "Additional Notes",
    "modal.notePh": "Feel free to leave any questions",
    "modal.contact": "Contact Number",
    "modal.contactPh": "010-0000-0000",
    "modal.submit": "Send Inquiry",
    "modal.success": "Your inquiry has been received. We'll be in touch soon!"
  }
};

const LangStore = {
  get() {
    try { return localStorage.getItem("anam-lang") || "kr"; } catch (e) { return "kr"; }
  },
  set(lang) {
    try { localStorage.setItem("anam-lang", lang); } catch (e) {}
  }
};

function applyI18n(lang) {
  const dict = I18N[lang] || I18N.kr;
  document.documentElement.lang = lang === "en" ? "en" : "ko";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] != null) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
  });

  document.querySelectorAll(".lang-toggle .lang-current").forEach((el) => {
    el.textContent = lang === "en" ? "EN" : "KR";
  });

  document.dispatchEvent(new CustomEvent("anam:lang-changed", { detail: { lang } }));
}

function initLangToggle() {
  const lang = LangStore.get();
  applyI18n(lang);

  document.querySelectorAll(".lang-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = LangStore.get() === "en" ? "kr" : "en";
      LangStore.set(next);
      applyI18n(next);
    });
  });
}

document.addEventListener("DOMContentLoaded", initLangToggle);
