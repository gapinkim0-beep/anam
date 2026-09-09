/* =========================================================
   anam real estate agency — 관리자 대시보드(admin.html) 로직
   - 로그인(비밀번호 1개)
   - 상단 탭: [매물수정] [키워드] [문의고객] [부동산정보]
   - 매물 등록/수정/삭제 (CRUD)
   - 라이프스타일 키워드 추가/삭제
   - 고객 문의 내역 조회 + 상태(확인/상담중/완료) 스텝 인디케이터
   - 부동산정보 매거진 글 작성/수정/삭제
   Supabase가 연동되어 있으면(assets/js/supabase-client.js) 실제 DB/Storage를 사용하고,
   연동 전에는 이 브라우저의 localStorage로 동작하는 데모 모드로 자동 전환됩니다.
   ========================================================= */
(function () {
  const LISTING_STORAGE_KEY = "anam-admin-listings";
  const INQUIRY_STORAGE_KEY = "anam-inquiries"; // 상세페이지 문의 팝업(로컬 모드)과 동일한 키
  const MAGAZINE_STORAGE_KEY = "anam-admin-magazine";
  const DEMO_SESSION_KEY = "anam-admin-demo-session";

  // 데모(로컬) 모드 전용 비밀번호입니다. Supabase 연동 전 화면 확인용일 뿐,
  // 실제 운영 시에는 반드시 Supabase Auth(ADMIN_EMAIL 계정)를 연동해 교체하세요.
  const DEMO_ADMIN_PASSWORD = "anam1234";

  const INQUIRY_STEPS = ["확인", "상담중", "완료"];

  function isSupabaseMode() { return !!window.anamSupabase; }

  /* -------------------- 로그인 / 세션 -------------------- */
  const loginWrap = document.getElementById("adminLogin");
  const dashboard = document.getElementById("adminDashboard");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");

  function showDashboard() {
    loginWrap.classList.add("admin-hidden");
    dashboard.classList.remove("admin-hidden");
    loadListings();
    loadInquiries();
    loadMagazinePosts();
    renderKeywordPanel();
    renderFeatureChips();
  }

  function showLogin() {
    dashboard.classList.add("admin-hidden");
    loginWrap.classList.remove("admin-hidden");
  }

  async function checkExistingSession() {
    if (isSupabaseMode()) {
      const { data } = await window.anamSupabase.auth.getSession();
      if (data && data.session) showDashboard();
      return;
    }
    if (sessionStorage.getItem(DEMO_SESSION_KEY) === "1") showDashboard();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("adminPassword").value;
    loginError.classList.remove("is-visible");

    if (isSupabaseMode()) {
      const { error } = await window.anamSupabase.auth.signInWithPassword({
        email: ADMIN_EMAIL, // supabase-client.js에 정의된 관리자 계정 이메일
        password
      });
      if (error) {
        loginError.classList.add("is-visible");
        return;
      }
      loginForm.reset();
      showDashboard();
      return;
    }

    // 데모 모드
    if (password === DEMO_ADMIN_PASSWORD) {
      sessionStorage.setItem(DEMO_SESSION_KEY, "1");
      loginForm.reset();
      showDashboard();
    } else {
      loginError.classList.add("is-visible");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    if (isSupabaseMode()) {
      await window.anamSupabase.auth.signOut();
    } else {
      sessionStorage.removeItem(DEMO_SESSION_KEY);
    }
    showLogin();
  });

  /* -------------------- 상단 탭 전환 -------------------- */
  const tabButtons = document.querySelectorAll(".admin-tab");
  const tabPanels = document.querySelectorAll(".admin-tab-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      tabButtons.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      tabPanels.forEach((panel) => {
        panel.classList.toggle("admin-hidden", panel.getAttribute("data-tab-panel") !== target);
      });
    });
  });

  /* -------------------- 매물 CRUD -------------------- */
  let adminListings = [];
  let editingId = null;

  const listingForm = document.getElementById("listingForm");
  const listingFormTitle = document.getElementById("listingFormTitle");
  const listingSubmitBtn = document.getElementById("listingSubmitBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const listingFormStatus = document.getElementById("listingFormStatus");
  const listingTableBody = document.getElementById("listingTableBody");
  const featureGroup = document.getElementById("fFeatures");
  let selectedFeatures = new Set();

  // [키워드] 탭에서 등록한 목록을 기준으로 '매물 특징' 칩을 매번 새로 그립니다.
  function renderFeatureChips() {
    const keywords = anamGetKeywords();
    selectedFeatures.forEach((f) => { if (!keywords.includes(f)) selectedFeatures.delete(f); });

    featureGroup.innerHTML = "";
    keywords.forEach((feature) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (selectedFeatures.has(feature) ? " is-active" : "");
      chip.setAttribute("data-feature", feature);
      chip.textContent = feature;
      chip.addEventListener("click", () => {
        if (selectedFeatures.has(feature)) {
          selectedFeatures.delete(feature);
          chip.classList.remove("is-active");
        } else {
          selectedFeatures.add(feature);
          chip.classList.add("is-active");
        }
      });
      featureGroup.appendChild(chip);
    });
  }

  function readLocalListings() {
    try {
      const raw = localStorage.getItem(LISTING_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn("[anam] 로컬 매물 데이터를 읽지 못했습니다:", err);
    }
    // 최초 1회는 목업 데이터(assets/js/data.js)를 시드로 사용합니다.
    return JSON.parse(JSON.stringify(LISTINGS));
  }

  function writeLocalListings(list) {
    localStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify(list));
  }

  async function loadListings() {
    if (isSupabaseMode()) {
      const { data, error } = await window.anamSupabase
        .from("listings")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) {
        console.warn("[anam] 매물 조회 실패:", error);
        adminListings = [];
      } else {
        adminListings = data.map(anamMapSupabaseRow);
      }
    } else {
      adminListings = readLocalListings();
    }
    renderListingTable();
  }

  function renderListingTable() {
    listingTableBody.innerHTML = "";
    if (adminListings.length === 0) {
      listingTableBody.innerHTML = `<tr class="admin-empty-row"><td colspan="6">등록된 매물이 없습니다.</td></tr>`;
      return;
    }
    adminListings.forEach((item) => {
      const tr = document.createElement("tr");
      const priceLabel = item.leaseType === "전세"
        ? `전세 ${item.deposit}만원`
        : `월세 ${item.deposit}/${item.monthlyRent}만원`;
      const updated = item.updatedAt ? new Date(item.updatedAt).toLocaleString("ko-KR") : "-";
      tr.innerHTML = `
        <td>${item.title}</td>
        <td>${item.type}</td>
        <td>${item.location}</td>
        <td>${priceLabel}</td>
        <td>${updated}</td>
        <td class="admin-row-actions">
          <button type="button" class="admin-row-btn" data-action="edit" data-id="${item.id}">수정</button>
          <button type="button" class="admin-row-btn" data-action="delete" data-id="${item.id}">삭제</button>
        </td>
      `;
      listingTableBody.appendChild(tr);
    });
  }

  listingTableBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.getAttribute("data-id"));
    if (btn.getAttribute("data-action") === "edit") startEdit(id);
    if (btn.getAttribute("data-action") === "delete") deleteListing(id);
  });

  function startEdit(id) {
    const item = adminListings.find((l) => l.id === id);
    if (!item) return;
    editingId = id;
    document.getElementById("listingId").value = id;
    document.getElementById("fTitle").value = item.title || "";
    document.getElementById("fType").value = item.type || "오피스텔";
    document.getElementById("fLeaseType").value = item.leaseType || "월세";
    document.getElementById("fAddress").value = item.location || "";
    document.getElementById("fDeposit").value = item.deposit || 0;
    document.getElementById("fMonthlyRent").value = item.monthlyRent || 0;
    document.getElementById("fMaintenanceFee").value = item.maintenanceFee || "";
    document.getElementById("fMoveInDate").value = item.moveInDate || "";
    document.getElementById("fStructure").value = item.structure || "";
    document.getElementById("fOptions").value = item.options || "";
    document.getElementById("fEtc").value = item.etc || "";
    document.getElementById("fDescription").value = item.description || "";
    document.getElementById("fKeywords").value = (item.keywords || []).join(", ");

    selectedFeatures = new Set(item.features || []);
    renderFeatureChips();

    listingFormTitle.textContent = "매물 수정";
    listingSubmitBtn.textContent = "수정 저장";
    cancelEditBtn.classList.remove("admin-hidden");
    listingFormStatus.textContent = "";
    window.scrollTo({ top: listingForm.offsetTop - 40, behavior: "smooth" });
  }

  function resetForm() {
    editingId = null;
    listingForm.reset();
    document.getElementById("listingId").value = "";
    selectedFeatures = new Set();
    renderFeatureChips();
    listingFormTitle.textContent = "매물 등록";
    listingSubmitBtn.textContent = "등록하기";
    cancelEditBtn.classList.add("admin-hidden");
  }

  cancelEditBtn.addEventListener("click", resetForm);

  async function deleteListing(id) {
    if (!confirm("이 매물을 삭제할까요?")) return;
    if (isSupabaseMode()) {
      const { error } = await window.anamSupabase.from("listings").delete().eq("id", id);
      if (error) { alert("삭제 실패: " + error.message); return; }
    } else {
      const list = readLocalListings().filter((l) => l.id !== id);
      writeLocalListings(list);
    }
    if (editingId === id) resetForm();
    loadListings();
  }

  // 이미지 파일을 data URL로 변환합니다 (데모 모드 전용 — 실서비스는 Supabase Storage 업로드 사용)
  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function uploadImage(file, bucket) {
    if (!file) return null;
    if (isSupabaseMode()) {
      const path = `${Date.now()}-${file.name}`;
      const { error } = await window.anamSupabase.storage.from(bucket).upload(path, file);
      if (error) throw error;
      const { data } = window.anamSupabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    }
    return readFileAsDataUrl(file);
  }

  listingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    listingFormStatus.textContent = "저장 중…";

    const keywords = document.getElementById("fKeywords").value
      .split(",").map((k) => k.trim()).filter(Boolean);

    const mainFile = document.getElementById("fMainImage").files[0];
    const subFiles = Array.from(document.getElementById("fSubImages").files || []);

    let images = [];
    try {
      const existing = editingId ? adminListings.find((l) => l.id === editingId) : null;
      // 새로 첨부한 파일이 있으면 그것을 쓰고, 없으면 수정 전 기존 이미지를 그대로 유지합니다.
      const mainUrl = mainFile ? await uploadImage(mainFile, "listing-images") : (existing && existing.images ? existing.images[0] : null);
      const subUrls = subFiles.length
        ? await Promise.all(subFiles.map((f) => uploadImage(f, "listing-images")))
        : (existing && existing.images ? existing.images.slice(1) : []);
      images = [mainUrl, ...subUrls].filter(Boolean);
      if (images.length === 0) images = ["https://picsum.photos/seed/anam-new/1200/900"];
    } catch (err) {
      listingFormStatus.textContent = "이미지 업로드 실패: " + err.message;
      return;
    }

    const payload = {
      type: document.getElementById("fType").value,
      title: document.getElementById("fTitle").value,
      location: document.getElementById("fAddress").value,
      lease_type: document.getElementById("fLeaseType").value,
      deposit: Number(document.getElementById("fDeposit").value) || 0,
      monthly_rent: Number(document.getElementById("fMonthlyRent").value) || 0,
      move_in_date: document.getElementById("fMoveInDate").value || null,
      area: "",
      structure: document.getElementById("fStructure").value,
      maintenance_fee: document.getElementById("fMaintenanceFee").value,
      options: document.getElementById("fOptions").value,
      etc: document.getElementById("fEtc").value,
      features: Array.from(selectedFeatures),
      keywords,
      description: document.getElementById("fDescription").value,
      images,
      updated_at: new Date().toISOString()
    };

    try {
      if (isSupabaseMode()) {
        if (editingId) {
          const { error } = await window.anamSupabase.from("listings").update(payload).eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await window.anamSupabase.from("listings").insert(payload);
          if (error) throw error;
        }
      } else {
        const list = readLocalListings();
        const mapped = anamMapSupabaseRow({ id: editingId || nextLocalId(list), ...payload });
        const idx = list.findIndex((l) => l.id === mapped.id);
        if (idx >= 0) list[idx] = mapped; else list.push(mapped);
        writeLocalListings(list);
      }
      listingFormStatus.textContent = "저장되었습니다.";
      resetForm();
      loadListings();
    } catch (err) {
      listingFormStatus.textContent = "저장 실패: " + err.message;
    }
  });

  function nextLocalId(list) {
    return list.reduce((max, l) => Math.max(max, Number(l.id) || 0), 0) + 1;
  }

  /* -------------------- 키워드 관리 -------------------- */
  const keywordForm = document.getElementById("keywordForm");
  const keywordInput = document.getElementById("fKeywordNew");
  const keywordChipList = document.getElementById("keywordChipList");

  function renderKeywordPanel() {
    const keywords = anamGetKeywords();
    keywordChipList.innerHTML = "";
    if (keywords.length === 0) {
      keywordChipList.innerHTML = `<span class="admin-form-status">등록된 키워드가 없습니다.</span>`;
      return;
    }
    keywords.forEach((keyword) => {
      const chip = document.createElement("span");
      chip.className = "chip admin-keyword-chip";
      chip.innerHTML = `${keyword} <button type="button" class="admin-keyword-remove" data-keyword="${keyword}" aria-label="${keyword} 삭제">×</button>`;
      keywordChipList.appendChild(chip);
    });
  }

  keywordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = keywordInput.value.trim();
    if (!value) return;
    const keywords = anamGetKeywords();
    if (keywords.includes(value)) {
      keywordInput.value = "";
      return;
    }
    keywords.push(value);
    anamSetKeywords(keywords);
    keywordInput.value = "";
    renderKeywordPanel();
    renderFeatureChips();
  });

  keywordChipList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-keyword]");
    if (!btn) return;
    const target = btn.getAttribute("data-keyword");
    const keywords = anamGetKeywords().filter((k) => k !== target);
    anamSetKeywords(keywords);
    renderKeywordPanel();
    renderFeatureChips();
  });

  /* -------------------- 고객 문의 내역 -------------------- */
  const inquiryTableBody = document.getElementById("inquiryTableBody");
  let adminInquiries = [];

  async function loadInquiries() {
    if (isSupabaseMode()) {
      const { data, error } = await window.anamSupabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.warn("[anam] 문의 내역 조회 실패:", error);
      adminInquiries = data || [];
    } else {
      try {
        adminInquiries = JSON.parse(localStorage.getItem(INQUIRY_STORAGE_KEY) || "[]")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } catch (err) {
        adminInquiries = [];
      }
    }
    renderInquiryTable();
  }

  function renderStepIndicator(inquiry) {
    const current = INQUIRY_STEPS.includes(inquiry.status) ? inquiry.status : "확인";
    const currentIdx = INQUIRY_STEPS.indexOf(current);
    const steps = INQUIRY_STEPS.map((step, idx) => {
      const state = idx < currentIdx ? "is-done" : idx === currentIdx ? "is-current" : "";
      return `<button type="button" class="step-indicator-item ${state}" data-inquiry-id="${inquiry.id}" data-status="${step}">
        <span class="step-indicator-dot"></span><span class="step-indicator-label">${step}</span>
      </button>`;
    });
    return `<div class="step-indicator">${steps.join('<span class="step-indicator-line"></span>')}</div>`;
  }

  function renderInquiryTable() {
    inquiryTableBody.innerHTML = "";
    if (!adminInquiries.length) {
      inquiryTableBody.innerHTML = `<tr class="admin-empty-row"><td colspan="8">접수된 문의가 없습니다.</td></tr>`;
      return;
    }
    adminInquiries.forEach((inq) => {
      const tr = document.createElement("tr");
      const created = inq.created_at ? new Date(inq.created_at).toLocaleString("ko-KR") : "-";
      tr.innerHTML = `
        <td>${created}</td>
        <td>${inq.listing_title || "-"}</td>
        <td>${inq.move_date || "-"}</td>
        <td>${inq.visit_time || "-"}</td>
        <td>${inq.other_listing || "-"}</td>
        <td>${inq.note || "-"}</td>
        <td>${inq.contact || "-"}</td>
        <td>${renderStepIndicator(inq)}</td>
      `;
      inquiryTableBody.appendChild(tr);
    });
  }

  inquiryTableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-inquiry-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-inquiry-id");
    const status = btn.getAttribute("data-status");
    await updateInquiryStatus(id, status);
  });

  async function updateInquiryStatus(id, status) {
    if (isSupabaseMode()) {
      const { error } = await window.anamSupabase.from("inquiries").update({ status }).eq("id", id);
      if (error) { alert("상태 업데이트 실패: " + error.message); return; }
    } else {
      try {
        const list = JSON.parse(localStorage.getItem(INQUIRY_STORAGE_KEY) || "[]");
        const idx = list.findIndex((inq) => String(inq.id) === String(id));
        if (idx >= 0) {
          list[idx].status = status;
          localStorage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify(list));
        }
      } catch (err) {
        console.warn("[anam] 문의 상태 저장 실패:", err);
      }
    }
    loadInquiries();
  }

  /* -------------------- 부동산정보 매거진 CRUD -------------------- */
  let adminMagazinePosts = [];
  let editingMagazineId = null;

  const magazineForm = document.getElementById("magazineForm");
  const magazineFormTitle = document.getElementById("magazineFormTitle");
  const magazineSubmitBtn = document.getElementById("magazineSubmitBtn");
  const magazineCancelBtn = document.getElementById("magazineCancelBtn");
  const magazineFormStatus = document.getElementById("magazineFormStatus");
  const magazineTableBody = document.getElementById("magazineTableBody");

  function readLocalMagazine() {
    try {
      const raw = localStorage.getItem(MAGAZINE_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn("[anam] 로컬 매거진 데이터를 읽지 못했습니다:", err);
    }
    return JSON.parse(JSON.stringify(MAGAZINE_POSTS));
  }

  function writeLocalMagazine(list) {
    localStorage.setItem(MAGAZINE_STORAGE_KEY, JSON.stringify(list));
  }

  async function loadMagazinePosts() {
    if (isSupabaseMode()) {
      const { data, error } = await window.anamSupabase
        .from("magazine_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("[anam] 매거진 조회 실패:", error);
        adminMagazinePosts = [];
      } else {
        adminMagazinePosts = data.map(anamMapSupabaseMagazineRow);
      }
    } else {
      adminMagazinePosts = readLocalMagazine();
    }
    renderMagazineTable();
  }

  function renderMagazineTable() {
    magazineTableBody.innerHTML = "";
    if (adminMagazinePosts.length === 0) {
      magazineTableBody.innerHTML = `<tr class="admin-empty-row"><td colspan="3">등록된 글이 없습니다.</td></tr>`;
      return;
    }
    adminMagazinePosts.forEach((post) => {
      const tr = document.createElement("tr");
      const created = post.createdAt ? new Date(post.createdAt).toLocaleDateString("ko-KR") : "-";
      tr.innerHTML = `
        <td>${post.title}</td>
        <td>${created}</td>
        <td class="admin-row-actions">
          <button type="button" class="admin-row-btn" data-action="edit" data-id="${post.id}">수정</button>
          <button type="button" class="admin-row-btn" data-action="delete" data-id="${post.id}">삭제</button>
        </td>
      `;
      magazineTableBody.appendChild(tr);
    });
  }

  magazineTableBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.getAttribute("data-id"));
    if (btn.getAttribute("data-action") === "edit") startEditMagazine(id);
    if (btn.getAttribute("data-action") === "delete") deleteMagazinePost(id);
  });

  function startEditMagazine(id) {
    const post = adminMagazinePosts.find((p) => p.id === id);
    if (!post) return;
    editingMagazineId = id;
    document.getElementById("magazineId").value = id;
    document.getElementById("mTitle").value = post.title || "";
    document.getElementById("mContent").value = post.content || "";
    magazineFormTitle.textContent = "부동산정보 글 수정";
    magazineSubmitBtn.textContent = "수정 저장";
    magazineCancelBtn.classList.remove("admin-hidden");
    magazineFormStatus.textContent = "";
    window.scrollTo({ top: magazineForm.offsetTop - 40, behavior: "smooth" });
  }

  function resetMagazineForm() {
    editingMagazineId = null;
    magazineForm.reset();
    document.getElementById("magazineId").value = "";
    magazineFormTitle.textContent = "부동산정보 글 작성";
    magazineSubmitBtn.textContent = "등록하기";
    magazineCancelBtn.classList.add("admin-hidden");
  }

  magazineCancelBtn.addEventListener("click", resetMagazineForm);

  async function deleteMagazinePost(id) {
    if (!confirm("이 글을 삭제할까요?")) return;
    if (isSupabaseMode()) {
      const { error } = await window.anamSupabase.from("magazine_posts").delete().eq("id", id);
      if (error) { alert("삭제 실패: " + error.message); return; }
    } else {
      const list = readLocalMagazine().filter((p) => p.id !== id);
      writeLocalMagazine(list);
    }
    if (editingMagazineId === id) resetMagazineForm();
    loadMagazinePosts();
  }

  function nextLocalMagazineId(list) {
    return list.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
  }

  magazineForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    magazineFormStatus.textContent = "저장 중…";

    const thumbFile = document.getElementById("mThumbnail").files[0];
    let thumbnail = null;
    try {
      const existing = editingMagazineId ? adminMagazinePosts.find((p) => p.id === editingMagazineId) : null;
      thumbnail = thumbFile ? await uploadImage(thumbFile, "magazine-images") : (existing ? existing.thumbnail : null);
      if (!thumbnail) thumbnail = "https://picsum.photos/seed/anam-mag-new/1000/750";
    } catch (err) {
      magazineFormStatus.textContent = "이미지 업로드 실패: " + err.message;
      return;
    }

    const payload = {
      title: document.getElementById("mTitle").value,
      thumbnail,
      content: document.getElementById("mContent").value,
      created_at: editingMagazineId
        ? (adminMagazinePosts.find((p) => p.id === editingMagazineId) || {}).createdAt || new Date().toISOString()
        : new Date().toISOString()
    };

    try {
      if (isSupabaseMode()) {
        if (editingMagazineId) {
          const { error } = await window.anamSupabase.from("magazine_posts").update(payload).eq("id", editingMagazineId);
          if (error) throw error;
        } else {
          const { error } = await window.anamSupabase.from("magazine_posts").insert(payload);
          if (error) throw error;
        }
      } else {
        const list = readLocalMagazine();
        const mapped = anamMapSupabaseMagazineRow({ id: editingMagazineId || nextLocalMagazineId(list), ...payload });
        const idx = list.findIndex((p) => p.id === mapped.id);
        if (idx >= 0) list[idx] = mapped; else list.push(mapped);
        writeLocalMagazine(list);
      }
      magazineFormStatus.textContent = "저장되었습니다.";
      resetMagazineForm();
      loadMagazinePosts();
    } catch (err) {
      magazineFormStatus.textContent = "저장 실패: " + err.message;
    }
  });

  checkExistingSession();
})();
