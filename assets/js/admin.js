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
    anamLoadKeywordsFromSupabase(); // 완료 시 "anam:keywords-updated" 이벤트로 아래 두 함수를 다시 호출
    anamLoadListingTypesFromSupabase();
    anamLoadLeaseTypesFromSupabase();
    renderKeywordPanel();
    renderFeatureChips();
    renderListingTypePanel();
    renderLeaseTypePanel();
    renderTypeSelectOptions();
    renderLeaseSelectOptions();
  }

  // Supabase 키워드 조회가 끝나면(또는 다른 탭에서 변경되면) 관리자 화면도 갱신
  document.addEventListener("anam:keywords-updated", () => {
    renderKeywordPanel();
    renderFeatureChips();
  });

  document.addEventListener("anam:listing-types-updated", () => {
    renderListingTypePanel();
    renderTypeSelectOptions();
  });

  document.addEventListener("anam:lease-types-updated", () => {
    renderLeaseTypePanel();
    renderLeaseSelectOptions();
  });

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

  const fTypeSelect = document.getElementById("fType");
  const fLeaseTypeSelect = document.getElementById("fLeaseType");

  // [매물종류/임대방식] 탭에서 등록한 목록을 기준으로 등록 폼의 드롭다운을 매번 새로 그립니다.
  function renderTypeSelectOptions() {
    const types = anamGetListingTypes();
    const current = fTypeSelect.value;
    fTypeSelect.innerHTML = types.map((t) => `<option value="${t}">${t}</option>`).join("");
    if (types.includes(current)) fTypeSelect.value = current;
  }

  function renderLeaseSelectOptions() {
    const types = anamGetLeaseTypes();
    const current = fLeaseTypeSelect.value;
    fLeaseTypeSelect.innerHTML = types.map((t) => `<option value="${t}">${t}</option>`).join("");
    if (types.includes(current)) fLeaseTypeSelect.value = current;
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

  // 호실(unitNumber)은 외부에 노출되면 안 되는 정보라 별도 테이블(listing_admin_info)에
  // 저장하고, 관리자로 로그인했을 때만 이렇게 따로 불러와 매물 id 기준으로 매칭합니다.
  let adminUnitNumbers = {}; // { [listingId]: unitNumber } — Supabase 연동 모드 전용

  function getUnitNumber(item) {
    return isSupabaseMode() ? (adminUnitNumbers[item.id] || "") : (item.unitNumber || "");
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

      const { data: infoRows, error: infoError } = await window.anamSupabase
        .from("listing_admin_info")
        .select("*");
      if (infoError) {
        console.warn("[anam] 호실 정보 조회 실패:", infoError);
        adminUnitNumbers = {};
      } else {
        adminUnitNumbers = {};
        (infoRows || []).forEach((row) => { adminUnitNumbers[row.listing_id] = row.unit_number || ""; });
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
        : `${item.leaseType} ${item.deposit}/${item.monthlyRent}만원`;
      const updated = item.updatedAt ? new Date(item.updatedAt).toLocaleString("ko-KR") : "-";
      // 호실은 관리자 표에서만 주소 옆 괄호로 보여줍니다 (외부 노출 금지 정보).
      const unitNumber = getUnitNumber(item);
      const addressLabel = unitNumber ? `${item.location} (${unitNumber})` : item.location;
      tr.innerHTML = `
        <td>${item.title}</td>
        <td>${item.type}</td>
        <td>${addressLabel}</td>
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
    renderTypeSelectOptions();
    renderLeaseSelectOptions();
    document.getElementById("fType").value = item.type || anamGetListingTypes()[0] || "";
    document.getElementById("fLeaseType").value = item.leaseType || anamGetLeaseTypes()[0] || "";
    document.getElementById("fAddress").value = item.location || "";
    document.getElementById("fUnitNumber").value = getUnitNumber(item);
    document.getElementById("fDeposit").value = item.deposit || 0;
    document.getElementById("fMonthlyRent").value = item.monthlyRent || 0;
    document.getElementById("fMaintenanceFee").value = item.maintenanceFee || "";
    document.getElementById("fBuiltYear").value = item.builtYear || "";
    document.getElementById("fMoveInDate").value = item.moveInDate || "";
    document.getElementById("fStructure").value = item.structure || "";
    document.getElementById("fTotalFloors").value = item.totalFloors || "";
    document.getElementById("fCurrentFloor").value = item.currentFloor || "";
    document.getElementById("fOptions").value = item.options || "";
    document.getElementById("fEtc").value = item.etc || "";
    document.getElementById("fDescription").value = item.description || "";
    document.getElementById("fKeywords").value = (item.keywords || []).join(", ");

    selectedFeatures = new Set(item.features || []);
    renderFeatureChips();

    currentImages = (item.images || []).map((url) => ({ id: nextImageUid(), url, file: null }));
    renderImageManager();

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
    renderTypeSelectOptions();
    renderLeaseSelectOptions();
    currentImages = [];
    renderImageManager();
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

  /* -------------------- 매물 이미지 관리자 (미리보기/삭제/순서변경) --------------------
     currentImages: [{ id, url, file }]
     - 기존에 저장돼 있던 이미지는 file이 없고 url만 있습니다(그대로 재사용).
     - 새로 추가한 이미지는 file을 들고 있고, url은 미리보기용 objectURL입니다(제출 시 업로드).
     - 배열의 0번째 항목이 항상 "대표 이미지"입니다. */
  const imageManagerEl = document.getElementById("imageManager");
  const fImageAdd = document.getElementById("fImageAdd");
  let currentImages = [];
  let imageUidCounter = 0;
  function nextImageUid() { return ++imageUidCounter; }

  function renderImageManager() {
    imageManagerEl.innerHTML = "";
    if (currentImages.length === 0) {
      imageManagerEl.innerHTML = `<p class="image-manager-empty">등록된 사진이 없습니다. 아래에서 사진을 추가해 주세요.</p>`;
      return;
    }
    currentImages.forEach((img, idx) => {
      const card = document.createElement("div");
      card.className = "image-manager-item";
      card.draggable = true;
      card.setAttribute("data-image-id", img.id);
      card.innerHTML = `
        ${idx === 0 ? '<span class="image-manager-badge">대표</span>' : ""}
        <div class="image-manager-thumb"><img src="${img.url}" alt="매물 이미지 ${idx + 1}" /></div>
        <div class="image-manager-actions">
          <button type="button" class="image-manager-move" data-move="up" data-id="${img.id}" ${idx === 0 ? "disabled" : ""} aria-label="앞으로 이동">↑</button>
          <button type="button" class="image-manager-move" data-move="down" data-id="${img.id}" ${idx === currentImages.length - 1 ? "disabled" : ""} aria-label="뒤로 이동">↓</button>
          <button type="button" class="image-manager-remove" data-remove="${img.id}" aria-label="삭제">×</button>
        </div>
      `;
      imageManagerEl.appendChild(card);
    });
  }

  function moveImage(id, direction) {
    const idx = currentImages.findIndex((img) => img.id === id);
    if (idx < 0) return;
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= currentImages.length) return;
    [currentImages[idx], currentImages[swapWith]] = [currentImages[swapWith], currentImages[idx]];
    renderImageManager();
  }

  imageManagerEl.addEventListener("click", (e) => {
    const moveBtn = e.target.closest("button[data-move]");
    if (moveBtn) { moveImage(Number(moveBtn.getAttribute("data-id")), moveBtn.getAttribute("data-move")); return; }
    const removeBtn = e.target.closest("button[data-remove]");
    if (removeBtn) {
      const id = removeBtn.getAttribute("data-remove");
      currentImages = currentImages.filter((img) => String(img.id) !== String(id));
      renderImageManager();
    }
  });

  // 드래그 앤 드롭으로도 순서를 바꿀 수 있습니다.
  let dragSourceId = null;
  imageManagerEl.addEventListener("dragstart", (e) => {
    const card = e.target.closest(".image-manager-item");
    if (!card) return;
    dragSourceId = card.getAttribute("data-image-id");
    card.classList.add("is-dragging");
  });
  imageManagerEl.addEventListener("dragend", (e) => {
    const card = e.target.closest(".image-manager-item");
    if (card) card.classList.remove("is-dragging");
  });
  imageManagerEl.addEventListener("dragover", (e) => e.preventDefault());
  imageManagerEl.addEventListener("drop", (e) => {
    e.preventDefault();
    const targetCard = e.target.closest(".image-manager-item");
    if (!targetCard || dragSourceId == null) return;
    const targetId = targetCard.getAttribute("data-image-id");
    if (targetId === dragSourceId) return;
    const fromIdx = currentImages.findIndex((img) => String(img.id) === String(dragSourceId));
    const toIdx = currentImages.findIndex((img) => String(img.id) === String(targetId));
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = currentImages.splice(fromIdx, 1);
    currentImages.splice(toIdx, 0, moved);
    dragSourceId = null;
    renderImageManager();
  });

  fImageAdd.addEventListener("change", () => {
    const files = Array.from(fImageAdd.files || []);
    files.forEach((file) => {
      currentImages.push({ id: nextImageUid(), url: URL.createObjectURL(file), file });
    });
    fImageAdd.value = ""; // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 초기화
    renderImageManager();
  });

  /* -------------------- 주소 검색 (도로명 주소, Daum 우편번호 서비스) -------------------- */
  const addressSearchBtn = document.getElementById("addressSearchBtn");
  addressSearchBtn.addEventListener("click", () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 검색 스크립트를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete(data) {
        // 도로명 주소를 우선 사용하고, 없으면 지번 주소로 대체합니다.
        document.getElementById("fAddress").value = data.roadAddress || data.jibunAddress || data.address || "";
      }
    }).open();
  });

  listingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    listingFormStatus.textContent = "저장 중…";

    const keywords = document.getElementById("fKeywords").value
      .split(",").map((k) => k.trim()).filter(Boolean);

    // 이미지 관리자(currentImages)에 담긴 순서 그대로 업로드합니다.
    // 이미 저장되어 있던 이미지(file이 없는 항목)는 URL을 그대로 재사용하고,
    // 새로 추가한 파일(file이 있는 항목)만 이번에 업로드합니다.
    let images = [];
    try {
      for (const img of currentImages) {
        images.push(img.file ? await uploadImage(img.file, "listing-images") : img.url);
      }
      if (images.length === 0) images = ["https://picsum.photos/seed/anam-new/1200/900"];
    } catch (err) {
      listingFormStatus.textContent = "이미지 업로드 실패: " + err.message;
      return;
    }

    const unitNumber = document.getElementById("fUnitNumber").value.trim();

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
      total_floors: document.getElementById("fTotalFloors").value,
      current_floor: document.getElementById("fCurrentFloor").value,
      built_year: document.getElementById("fBuiltYear").value,
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
        let listingIdForInfo = editingId;
        if (editingId) {
          const { error } = await window.anamSupabase.from("listings").update(payload).eq("id", editingId);
          if (error) throw error;
        } else {
          const { data: inserted, error } = await window.anamSupabase
            .from("listings").insert(payload).select().single();
          if (error) throw error;
          listingIdForInfo = inserted.id;
        }
        // 호실은 별도 테이블(listing_admin_info, 관리자만 조회 가능한 RLS)에 저장해
        // 공개 매물 조회 API(listings)로는 절대 노출되지 않도록 합니다.
        const { error: infoError } = await window.anamSupabase
          .from("listing_admin_info")
          .upsert({ listing_id: listingIdForInfo, unit_number: unitNumber });
        if (infoError) throw infoError;
      } else {
        const list = readLocalListings();
        const mapped = anamMapSupabaseRow({ id: editingId || nextLocalId(list), ...payload });
        mapped.unitNumber = unitNumber; // 데모(로컬) 모드는 브라우저 안에서만 도는 값이라 그냥 같이 저장합니다.
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

  keywordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = keywordInput.value.trim();
    if (!value) return;
    const keywords = anamGetKeywords();
    if (keywords.includes(value)) {
      keywordInput.value = "";
      return;
    }
    if (isSupabaseMode()) {
      const { error } = await window.anamSupabase
        .from("keywords")
        .insert({ label: value, sort_order: keywords.length });
      if (error) { alert("키워드 등록 실패: " + error.message); return; }
      await anamLoadKeywordsFromSupabase();
    } else {
      keywords.push(value);
      anamSetKeywords(keywords);
    }
    keywordInput.value = "";
    renderKeywordPanel();
    renderFeatureChips();
  });

  keywordChipList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-keyword]");
    if (!btn) return;
    const target = btn.getAttribute("data-keyword");
    if (isSupabaseMode()) {
      const { error } = await window.anamSupabase.from("keywords").delete().eq("label", target);
      if (error) { alert("키워드 삭제 실패: " + error.message); return; }
      await anamLoadKeywordsFromSupabase();
    } else {
      const keywords = anamGetKeywords().filter((k) => k !== target);
      anamSetKeywords(keywords);
    }
    renderKeywordPanel();
    renderFeatureChips();
  });

  /* -------------------- 매물 종류 관리 -------------------- */
  const listingTypeForm = document.getElementById("listingTypeForm");
  const listingTypeInput = document.getElementById("fListingTypeNew");
  const listingTypeChipList = document.getElementById("listingTypeChipList");

  function renderListingTypePanel() {
    const types = anamGetListingTypes();
    listingTypeChipList.innerHTML = "";
    if (types.length === 0) {
      listingTypeChipList.innerHTML = `<span class="admin-form-status">등록된 매물 종류가 없습니다.</span>`;
      return;
    }
    types.forEach((type) => {
      const chip = document.createElement("span");
      chip.className = "chip admin-keyword-chip";
      chip.innerHTML = `${type} <button type="button" class="admin-keyword-remove" data-type="${type}" aria-label="${type} 삭제">×</button>`;
      listingTypeChipList.appendChild(chip);
    });
  }

  listingTypeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = listingTypeInput.value.trim();
    if (!value) return;
    const types = anamGetListingTypes();
    if (types.includes(value)) { listingTypeInput.value = ""; return; }
    if (isSupabaseMode()) {
      const { error } = await window.anamSupabase
        .from("listing_types").insert({ label: value, sort_order: types.length });
      if (error) { alert("매물 종류 등록 실패: " + error.message); return; }
      await anamLoadListingTypesFromSupabase();
    } else {
      types.push(value);
      anamSetListingTypes(types);
    }
    listingTypeInput.value = "";
    renderListingTypePanel();
    renderTypeSelectOptions();
  });

  listingTypeChipList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-type]");
    if (!btn) return;
    const target = btn.getAttribute("data-type");
    if (isSupabaseMode()) {
      const { error } = await window.anamSupabase.from("listing_types").delete().eq("label", target);
      if (error) { alert("매물 종류 삭제 실패: " + error.message); return; }
      await anamLoadListingTypesFromSupabase();
    } else {
      anamSetListingTypes(anamGetListingTypes().filter((t) => t !== target));
    }
    renderListingTypePanel();
    renderTypeSelectOptions();
  });

  /* -------------------- 임대방식 관리 -------------------- */
  const leaseTypeForm = document.getElementById("leaseTypeForm");
  const leaseTypeInput = document.getElementById("fLeaseTypeNew");
  const leaseTypeChipList = document.getElementById("leaseTypeChipList");

  function renderLeaseTypePanel() {
    const types = anamGetLeaseTypes();
    leaseTypeChipList.innerHTML = "";
    if (types.length === 0) {
      leaseTypeChipList.innerHTML = `<span class="admin-form-status">등록된 임대방식이 없습니다.</span>`;
      return;
    }
    types.forEach((type) => {
      const chip = document.createElement("span");
      chip.className = "chip admin-keyword-chip";
      chip.innerHTML = `${type} <button type="button" class="admin-keyword-remove" data-lease-type="${type}" aria-label="${type} 삭제">×</button>`;
      leaseTypeChipList.appendChild(chip);
    });
  }

  leaseTypeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = leaseTypeInput.value.trim();
    if (!value) return;
    const types = anamGetLeaseTypes();
    if (types.includes(value)) { leaseTypeInput.value = ""; return; }
    if (isSupabaseMode()) {
      const { error } = await window.anamSupabase
        .from("lease_types").insert({ label: value, sort_order: types.length });
      if (error) { alert("임대방식 등록 실패: " + error.message); return; }
      await anamLoadLeaseTypesFromSupabase();
    } else {
      types.push(value);
      anamSetLeaseTypes(types);
    }
    leaseTypeInput.value = "";
    renderLeaseTypePanel();
    renderLeaseSelectOptions();
  });

  leaseTypeChipList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-lease-type]");
    if (!btn) return;
    const target = btn.getAttribute("data-lease-type");
    if (isSupabaseMode()) {
      const { error } = await window.anamSupabase.from("lease_types").delete().eq("label", target);
      if (error) { alert("임대방식 삭제 실패: " + error.message); return; }
      await anamLoadLeaseTypesFromSupabase();
    } else {
      anamSetLeaseTypes(anamGetLeaseTypes().filter((t) => t !== target));
    }
    renderLeaseTypePanel();
    renderLeaseSelectOptions();
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
