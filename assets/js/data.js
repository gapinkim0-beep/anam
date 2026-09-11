/* =========================================================
   anam real estate agency — Mock Listings Data
   실제 서비스에서는 이 배열을 Supabase/Firebase 쿼리 결과로 교체합니다.
   (연동 가이드: README.md 참고)
   ========================================================= */
const LISTINGS = [
  {
    id: 1,
    type: "오피스텔",
    typeEn: "Studio",
    title: "안암역 5분, 채광 좋은 신축 원룸",
    titleEn: "Bright New Studio, 5 min to Anam Stn.",
    location: "서울 성북구 안암동",
    locationEn: "Anam-dong, Seongbuk-gu, Seoul",
    leaseType: "월세",
    leaseTypeEn: "Monthly",
    deposit: 1000,
    monthlyRent: 55,
    moveInDate: "2026-09-20",
    area: "23㎡ (7평)",
    structure: "원룸 (방1, 욕실1)",
    structureEn: "Studio (1 room, 1 bath)",
    maintenanceFee: "6만원 (수도 포함)",
    maintenanceFeeEn: "60,000 KRW (water incl.)",
    options: "냉장고, 세탁기, 에어컨, 붙박이장",
    optionsEn: "Fridge, washer, A/C, built-in closet",
    etc: "반려동물 협의 가능, 고려대 정문 도보 5분",
    etcEn: "Pets negotiable, 5 min walk to Korea Univ.",
    features: ["채광", "풀옵션", "위치"],
    keywords: ["#고려대인근", "#신축", "#채광좋음", "#풀옵션"],
    keywordsEn: ["#NearKoreaUniv", "#NewBuilding", "#GreatLight", "#FullyFurnished"],
    description:
      "남향 통창으로 오전부터 오후까지 채광이 좋은 신축 오피스텔입니다. 고려대학교 정문까지 도보 5분, 안암역까지 도보 5분으로 유학생 및 학생 세입자에게 특히 추천드립니다.",
    descriptionEn:
      "A south-facing new studio with excellent daylight from morning to afternoon. Just a 5-minute walk to both Korea University's main gate and Anam Station — especially recommended for international students.",
    images: [
      "https://picsum.photos/seed/anam-room-01/1200/900",
      "https://picsum.photos/seed/anam-room-01b/1200/900",
      "https://picsum.photos/seed/anam-room-01c/1200/900",
      "https://picsum.photos/seed/anam-room-01d/1200/900"
    ],
    updatedAt: "2026-09-07T10:00:00"
  },
  {
    id: 2,
    type: "주택",
    typeEn: "House",
    title: "리모델링 완료, 볕 잘 드는 2층 단독주택",
    titleEn: "Renovated 2nd-Floor House, Full of Sun",
    location: "서울 성북구 종암동",
    locationEn: "Jongam-dong, Seongbuk-gu, Seoul",
    leaseType: "전세",
    leaseTypeEn: "Jeonse",
    deposit: 12000,
    monthlyRent: 0,
    moveInDate: "2026-10-01",
    area: "49㎡ (15평)",
    structure: "2룸 + 거실 + 주방분리",
    structureEn: "2 rooms + living room + separate kitchen",
    maintenanceFee: "없음",
    maintenanceFeeEn: "None",
    options: "에어컨, 인덕션, 신규 도배/장판",
    optionsEn: "A/C, induction stove, new wallpaper/flooring",
    etc: "주차 1대 가능, 반려동물 불가",
    etcEn: "1 parking spot, no pets",
    features: ["리모델링", "채광", "평수"],
    keywords: ["#전세", "#리모델링", "#주차가능"],
    keywordsEn: ["#Jeonse", "#Renovated", "#Parking"],
    description:
      "작년 전체 리모델링을 마친 2층 단독주택입니다. 넓은 창으로 하루 종일 볕이 들며, 신혼부부나 가족 단위 세입자에게 어울리는 아늑한 구조입니다.",
    descriptionEn:
      "A fully renovated 2nd-floor house completed last year. Large windows bring in sunlight all day, and the cozy layout suits couples or small families.",
    images: [
      "https://picsum.photos/seed/anam-house-02/1200/900",
      "https://picsum.photos/seed/anam-house-02b/1200/900",
      "https://picsum.photos/seed/anam-house-02c/1200/900"
    ],
    updatedAt: "2026-09-06T14:30:00"
  },
  {
    id: 3,
    type: "상가",
    typeEn: "Retail",
    title: "안암오거리 1층 코너 상가",
    titleEn: "Anam 5-Way Corner Retail Unit",
    location: "서울 성북구 안암동",
    locationEn: "Anam-dong, Seongbuk-gu, Seoul",
    leaseType: "월세",
    leaseTypeEn: "Monthly",
    deposit: 3000,
    monthlyRent: 180,
    moveInDate: "2026-09-25",
    area: "66㎡ (20평)",
    structure: "1층 단일 공간, 전면 통유리",
    structureEn: "Single-floor unit, full glass front",
    maintenanceFee: "20만원",
    maintenanceFeeEn: "200,000 KRW",
    options: "냉난방기 2대, 화장실 별도",
    optionsEn: "2 HVAC units, separate restroom",
    etc: "권리금 있음, 업종 협의 필요",
    etcEn: "Key money applies, business type negotiable",
    features: ["위치", "인테리어"],
    keywords: ["#코너상가", "#유동인구많음", "#권리금있음"],
    keywordsEn: ["#CornerUnit", "#HighFootTraffic", "#KeyMoney"],
    description:
      "안암오거리 코너에 위치한 1층 상가로 유동인구가 많은 자리입니다. 카페, 스터디카페, 편의점 등 다양한 업종에 적합합니다.",
    descriptionEn:
      "A ground-floor corner unit at the Anam five-way intersection with heavy foot traffic. Suitable for cafes, study lounges, convenience stores and more.",
    images: [
      "https://picsum.photos/seed/anam-retail-03/1200/900",
      "https://picsum.photos/seed/anam-retail-03b/1200/900"
    ],
    updatedAt: "2026-09-05T09:15:00"
  },
  {
    id: 4,
    type: "오피스텔",
    typeEn: "Studio",
    title: "풀옵션 복층 오피스텔, 회기역 초역세권",
    titleEn: "Furnished Duplex Studio near Hoegi Stn.",
    location: "서울 동대문구 회기동",
    locationEn: "Hoegi-dong, Dongdaemun-gu, Seoul",
    leaseType: "월세",
    leaseTypeEn: "Monthly",
    deposit: 500,
    monthlyRent: 65,
    moveInDate: "2026-09-18",
    area: "26㎡ (8평, 복층)",
    structure: "복층 원룸 (침실 다락)",
    structureEn: "Duplex studio (loft bedroom)",
    maintenanceFee: "7만원",
    maintenanceFeeEn: "70,000 KRW",
    options: "풀옵션 (가전+가구 일체)",
    optionsEn: "Fully furnished (appliances + furniture)",
    etc: "경희대/외대 도보권, 즉시입주 가능",
    etcEn: "Walking distance to Kyung Hee Univ./HUFS, move-in ready",
    features: ["풀옵션", "위치", "평수"],
    keywords: ["#복층", "#역세권", "#즉시입주"],
    keywordsEn: ["#Duplex", "#NearStation", "#MoveInReady"],
    description:
      "회기역 도보 3분 초역세권 복층 오피스텔입니다. 다락 공간을 침실로 활용할 수 있어 생활 공간을 넓게 쓸 수 있습니다.",
    descriptionEn:
      "A duplex studio just 3 minutes from Hoegi Station. The loft can be used as a bedroom, freeing up the main floor as living space.",
    images: [
      "https://picsum.photos/seed/anam-room-04/1200/900",
      "https://picsum.photos/seed/anam-room-04b/1200/900",
      "https://picsum.photos/seed/anam-room-04c/1200/900"
    ],
    updatedAt: "2026-09-04T18:00:00"
  },
  {
    id: 5,
    type: "주택",
    typeEn: "House",
    title: "테라스가 있는 3층 다세대 주택",
    titleEn: "Multi-Unit House with Private Terrace",
    location: "서울 성북구 안암동",
    locationEn: "Anam-dong, Seongbuk-gu, Seoul",
    leaseType: "전세",
    leaseTypeEn: "Jeonse",
    deposit: 18000,
    monthlyRent: 0,
    moveInDate: "2026-11-01",
    area: "59㎡ (18평)",
    structure: "3룸 + 테라스",
    structureEn: "3 rooms + terrace",
    maintenanceFee: "3만원",
    maintenanceFeeEn: "30,000 KRW",
    options: "냉장고, 세탁기, 건조기",
    optionsEn: "Fridge, washer, dryer",
    etc: "테라스 정원 가꾸기 가능, 반려동물 협의",
    etcEn: "Terrace gardening possible, pets negotiable",
    features: ["평수", "인테리어", "채광"],
    keywords: ["#테라스", "#조용한주택가", "#반려동물협의"],
    keywordsEn: ["#Terrace", "#QuietArea", "#PetsNegotiable"],
    description:
      "조용한 주택가에 위치한 3층 다세대 주택으로, 전용 테라스가 있어 홈가드닝을 즐기기 좋습니다. 가족 단위 또는 장기 거주를 원하는 세입자에게 추천합니다.",
    descriptionEn:
      "A 3rd-floor multi-unit house on a quiet residential street with a private terrace, great for home gardening. Recommended for families or long-term tenants.",
    images: [
      "https://picsum.photos/seed/anam-house-05/1200/900",
      "https://picsum.photos/seed/anam-house-05b/1200/900",
      "https://picsum.photos/seed/anam-house-05c/1200/900"
    ],
    updatedAt: "2026-09-03T11:45:00"
  },
  {
    id: 6,
    type: "오피스텔",
    typeEn: "Studio",
    title: "고려대 후문 앞 인테리어 예쁜 원룸",
    titleEn: "Stylish Studio by Korea Univ. Back Gate",
    location: "서울 성북구 안암동",
    locationEn: "Anam-dong, Seongbuk-gu, Seoul",
    leaseType: "월세",
    leaseTypeEn: "Monthly",
    deposit: 1000,
    monthlyRent: 60,
    moveInDate: "2026-09-15",
    area: "20㎡ (6평)",
    structure: "원룸",
    structureEn: "Studio",
    maintenanceFee: "5만원",
    maintenanceFeeEn: "50,000 KRW",
    options: "풀옵션, 감성 조명, 우드톤 인테리어",
    optionsEn: "Fully furnished, mood lighting, wood-tone interior",
    etc: "고려대 후문 도보 2분",
    etcEn: "2 min walk to Korea Univ. back gate",
    features: ["인테리어", "위치", "풀옵션"],
    keywords: ["#감성인테리어", "#후문도보2분", "#여성추천"],
    keywordsEn: ["#StylishInterior", "#2MinToBackGate", "#RecommendedForWomen"],
    description:
      "우드톤 인테리어와 무드등으로 감성적인 분위기를 낸 원룸입니다. 고려대 후문 도보 2분 거리로 통학이 매우 편리합니다.",
    descriptionEn:
      "A cozy studio finished in warm wood tones with mood lighting. Only a 2-minute walk from Korea University's back gate — extremely convenient for students.",
    images: [
      "https://picsum.photos/seed/anam-room-06/1200/900",
      "https://picsum.photos/seed/anam-room-06b/1200/900",
      "https://picsum.photos/seed/anam-room-06c/1200/900"
    ],
    updatedAt: "2026-09-02T16:20:00"
  },
  {
    id: 7,
    type: "상가",
    typeEn: "Retail",
    title: "안암역 지하상가 카페 자리",
    titleEn: "Underground Cafe Unit near Anam Stn.",
    location: "서울 성북구 안암동",
    locationEn: "Anam-dong, Seongbuk-gu, Seoul",
    leaseType: "월세",
    leaseTypeEn: "Monthly",
    deposit: 2000,
    monthlyRent: 120,
    moveInDate: "2026-10-05",
    area: "33㎡ (10평)",
    structure: "지하 1층, 주방 설비 완비",
    structureEn: "B1 unit, kitchen facilities included",
    maintenanceFee: "15만원",
    maintenanceFeeEn: "150,000 KRW",
    options: "닥트, 정수 시설, 냉난방기",
    optionsEn: "Duct system, water filtration, HVAC",
    etc: "기존 카페 시설 인수 가능",
    etcEn: "Existing cafe fixtures can be taken over",
    features: ["위치", "인테리어"],
    keywords: ["#카페창업", "#설비완비", "#역세권"],
    keywordsEn: ["#CafeReady", "#FullyEquipped", "#NearStation"],
    description:
      "안암역과 바로 연결되는 지하상가로 카페 운영에 필요한 주방 설비가 이미 갖춰져 있습니다. 즉시 영업이 가능한 조건입니다.",
    descriptionEn:
      "An underground retail unit directly connected to Anam Station, already equipped for a cafe. Ready for immediate business operation.",
    images: [
      "https://picsum.photos/seed/anam-retail-07/1200/900",
      "https://picsum.photos/seed/anam-retail-07b/1200/900"
    ],
    updatedAt: "2026-09-01T13:00:00"
  },
  {
    id: 8,
    type: "오피스텔",
    typeEn: "Studio",
    title: "안암천뷰 원룸, 풀옵션+채광 최상",
    titleEn: "Stream-View Studio, Great Light & Furnished",
    location: "서울 성북구 종암동",
    locationEn: "Jongam-dong, Seongbuk-gu, Seoul",
    leaseType: "월세",
    leaseTypeEn: "Monthly",
    deposit: 1500,
    monthlyRent: 50,
    moveInDate: "2026-09-22",
    area: "26㎡ (8평)",
    structure: "1.5룸 (분리형 주방)",
    structureEn: "1.5 rooms (separate kitchen)",
    maintenanceFee: "6만원",
    maintenanceFeeEn: "60,000 KRW",
    options: "풀옵션, 시스템 에어컨",
    optionsEn: "Fully furnished, system A/C",
    etc: "안암천 산책로 도보 1분",
    etcEn: "1 min to Anamcheon stream walking path",
    features: ["채광", "풀옵션", "평수"],
    keywords: ["#하천뷰", "#분리형주방", "#산책로인근"],
    keywordsEn: ["#StreamView", "#SeparateKitchen", "#NearWalkingPath"],
    description:
      "안암천이 보이는 채광 좋은 1.5룸으로, 분리형 주방 구조라 생활 공간 활용도가 높습니다. 아침 산책이나 러닝을 즐기는 분들께 추천합니다.",
    descriptionEn:
      "A bright 1.5-room studio overlooking Anamcheon stream, with a separate kitchen for better use of space. Great for those who enjoy morning walks or runs.",
    images: [
      "https://picsum.photos/seed/anam-room-08/1200/900",
      "https://picsum.photos/seed/anam-room-08b/1200/900",
      "https://picsum.photos/seed/anam-room-08c/1200/900"
    ],
    updatedAt: "2026-08-31T09:40:00"
  },
  {
    id: 9,
    type: "주택",
    typeEn: "House",
    title: "셰어하우스로 개조된 4인실 단독주택",
    titleEn: "House Converted into 4-Person Share House",
    location: "서울 동대문구 회기동",
    locationEn: "Hoegi-dong, Dongdaemun-gu, Seoul",
    leaseType: "월세",
    leaseTypeEn: "Monthly",
    deposit: 300,
    monthlyRent: 45,
    moveInDate: "2026-09-12",
    area: "1인실 기준 10㎡",
    structure: "개인실 4개 + 공용 거실/주방",
    structureEn: "4 private rooms + shared living/kitchen",
    maintenanceFee: "8만원 (공과금 포함)",
    maintenanceFeeEn: "80,000 KRW (utilities incl.)",
    options: "풀옵션, 공용 세탁기/냉장고",
    optionsEn: "Fully furnished, shared washer/fridge",
    etc: "외국인 유학생 다수 거주 중, 영어 응대 가능",
    etcEn: "Many international residents, English support available",
    features: ["풀옵션", "위치"],
    keywords: ["#쉐어하우스", "#유학생환영", "#공과금포함"],
    keywordsEn: ["#ShareHouse", "#InternationalWelcome", "#UtilitiesIncluded"],
    description:
      "외국인 유학생을 위한 하우스메이트형 셰어하우스입니다. 입주부터 생활 적응까지 anam이 직접 케어해 드리며, 영어 상담이 가능합니다.",
    descriptionEn:
      "A housemate-style share house designed for international students. anam personally supports everything from move-in to daily life, with English consultation available.",
    images: [
      "https://picsum.photos/seed/anam-house-09/1200/900",
      "https://picsum.photos/seed/anam-house-09b/1200/900",
      "https://picsum.photos/seed/anam-house-09c/1200/900"
    ],
    updatedAt: "2026-08-30T15:10:00"
  },
  {
    id: 10,
    type: "오피스텔",
    typeEn: "Studio",
    title: "신축 풀옵션 오피스텔, 안암역 도보 7분",
    titleEn: "New Furnished Studio, 7 min to Anam Stn.",
    location: "서울 성북구 안암동",
    locationEn: "Anam-dong, Seongbuk-gu, Seoul",
    leaseType: "전세",
    leaseTypeEn: "Jeonse",
    deposit: 9000,
    monthlyRent: 0,
    moveInDate: "2026-10-15",
    area: "30㎡ (9평)",
    structure: "1.5룸",
    structureEn: "1.5 rooms",
    maintenanceFee: "7만원",
    maintenanceFeeEn: "70,000 KRW",
    options: "풀옵션 (신품 가전)",
    optionsEn: "Fully furnished (brand-new appliances)",
    etc: "2026년 준공 신축, 즉시입주 가능",
    etcEn: "Newly built in 2026, move-in ready",
    features: ["풀옵션", "채광", "리모델링"],
    keywords: ["#신축", "#전세가능", "#신품가전"],
    keywordsEn: ["#NewBuilding", "#JeonseAvailable", "#BrandNewAppliances"],
    description:
      "2026년 준공된 신축 오피스텔로 모든 가전이 신품입니다. 전세와 월세 모두 상담 가능하며, 깨끗한 새 건물을 선호하는 분들께 추천합니다.",
    descriptionEn:
      "A brand-new studio completed in 2026, fully equipped with new appliances. Both Jeonse and monthly rent terms are available — ideal for those who prefer a clean, new building.",
    images: [
      "https://picsum.photos/seed/anam-room-10/1200/900",
      "https://picsum.photos/seed/anam-room-10b/1200/900",
      "https://picsum.photos/seed/anam-room-10c/1200/900"
    ],
    updatedAt: "2026-08-29T12:00:00"
  }
];

/* =========================================================
   라이프스타일 필터 키워드 — 관리자 [키워드] 탭에서 추가/수정합니다.
   index.html 필터바(#filterFeatures), admin.html 매물 등록 폼(#fFeatures)
   양쪽 모두 이 목록을 기준으로 칩(Chip)을 그려줍니다.
   ========================================================= */
const KEYWORD_STORAGE_KEY = "anam-keywords";
const DEFAULT_KEYWORDS = ["채광", "위치", "평수", "풀옵션", "리모델링", "인테리어"];

function anamGetKeywords() {
  try {
    const raw = localStorage.getItem(KEYWORD_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch (err) {
    console.warn("[anam] 키워드 목록을 읽지 못했습니다:", err);
  }
  return [...DEFAULT_KEYWORDS];
}

function anamSetKeywords(list) {
  localStorage.setItem(KEYWORD_STORAGE_KEY, JSON.stringify(list));
  document.dispatchEvent(new CustomEvent("anam:keywords-updated"));
}

/* ---------------------------------------------------------
   키워드 — Supabase 연동. admin.html [키워드] 탭에서 등록/삭제한 값을
   keywords 테이블에서 읽어와 localStorage 캐시(anamGetKeywords가 읽는 값)를
   덮어쓰고, index.html 필터바 / admin.html 매물 등록 폼 칩을 갱신합니다.
   미연동 상태라면 아무 일도 하지 않고 로컬 목록(DEFAULT_KEYWORDS)을 그대로 씁니다.
   --------------------------------------------------------- */
async function anamLoadKeywordsFromSupabase() {
  if (!window.anamSupabase) return; // 미연동 상태 — 로컬 목록 유지
  try {
    const { data, error } = await window.anamSupabase
      .from("keywords")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    if (Array.isArray(data)) {
      const labels = data.map((row) => row.label);
      localStorage.setItem(KEYWORD_STORAGE_KEY, JSON.stringify(labels));
      document.dispatchEvent(new CustomEvent("anam:keywords-updated"));
    }
  } catch (err) {
    console.warn("[anam] Supabase 키워드 조회 실패, 로컬 데이터를 사용합니다:", err);
  }
}

/* ---------------------------------------------------------
   매물 종류 / 임대방식 — admin.html [매물종류·임대방식] 탭에서
   추가/수정/삭제할 수 있도록 keywords와 동일한 패턴으로 관리합니다.
   - index.html 필터바(#filterType), admin.html 매물 등록 폼(#fType/#fLeaseType)
     모두 이 목록을 기준으로 옵션을 그려줍니다.
   --------------------------------------------------------- */
function anamCreateLabelListStore(storageKey, defaultList, tableName, eventName) {
  function get() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch (err) {
      console.warn(`[anam] ${tableName} 목록을 읽지 못했습니다:`, err);
    }
    return [...defaultList];
  }

  function set(list) {
    localStorage.setItem(storageKey, JSON.stringify(list));
    document.dispatchEvent(new CustomEvent(eventName));
  }

  async function loadFromSupabase() {
    if (!window.anamSupabase) return; // 미연동 상태 — 로컬 목록 유지
    try {
      const { data, error } = await window.anamSupabase
        .from(tableName)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      if (Array.isArray(data)) {
        const labels = data.map((row) => row.label);
        localStorage.setItem(storageKey, JSON.stringify(labels));
        document.dispatchEvent(new CustomEvent(eventName));
      }
    } catch (err) {
      console.warn(`[anam] Supabase ${tableName} 조회 실패, 로컬 데이터를 사용합니다:`, err);
    }
  }

  return { get, set, loadFromSupabase };
}

const LISTING_TYPE_STORAGE_KEY = "anam-listing-types";
const DEFAULT_LISTING_TYPES = ["오피스텔", "주택", "상가"];
const anamListingTypeStore = anamCreateLabelListStore(
  LISTING_TYPE_STORAGE_KEY, DEFAULT_LISTING_TYPES, "listing_types", "anam:listing-types-updated"
);
function anamGetListingTypes() { return anamListingTypeStore.get(); }
function anamSetListingTypes(list) { anamListingTypeStore.set(list); }
function anamLoadListingTypesFromSupabase() { return anamListingTypeStore.loadFromSupabase(); }

const LEASE_TYPE_STORAGE_KEY = "anam-lease-types";
const DEFAULT_LEASE_TYPES = ["월세", "전세"];
const anamLeaseTypeStore = anamCreateLabelListStore(
  LEASE_TYPE_STORAGE_KEY, DEFAULT_LEASE_TYPES, "lease_types", "anam:lease-types-updated"
);
function anamGetLeaseTypes() { return anamLeaseTypeStore.get(); }
function anamSetLeaseTypes(list) { anamLeaseTypeStore.set(list); }
function anamLoadLeaseTypesFromSupabase() { return anamLeaseTypeStore.loadFromSupabase(); }

/* =========================================================
   anam real estate agency — 부동산 정보 매거진 목업 데이터
   info.html(목록) / info-detail.html(상세)에서 사용합니다.
   admin.html [부동산정보] 탭에서 작성한 글이 이 배열을 대체합니다.
   ========================================================= */
const MAGAZINE_POSTS = [
  {
    id: 1,
    title: "2026년 하반기, 안암·고려대 원룸 시세는 어떻게 움직일까요?",
    thumbnail: "https://picsum.photos/seed/anam-mag-01/1000/750",
    content:
      "안녕하세요, anam real estate agency입니다.\n\n최근 안암·고려대 일대 원룸 시세를 살펴보면, 신축 오피스텔을 중심으로 보증금은 소폭 상승했지만 월세는 지난해와 비슷한 수준을 유지하고 있습니다.\n\n특히 학기가 시작되는 3월과 9월 직전에는 매물이 빠르게 소진되는 경향이 있어, 이사 계획이 있으시다면 최소 1~2개월 전에는 매물을 미리 살펴보시는 것을 추천드립니다.\n\n다음 주에는 임대차 계약 시 놓치기 쉬운 특약사항 체크리스트를 준비해 오겠습니다. 궁금하신 점은 언제든 '문의하기'로 편하게 남겨주세요.",
    createdAt: "2026-09-01T09:00:00"
  },
  {
    id: 2,
    title: "전세 계약 전 꼭 확인해야 할 등기부등본 체크포인트",
    thumbnail: "https://picsum.photos/seed/anam-mag-02/1000/750",
    content:
      "전세 계약을 앞두고 계신가요?\n\n계약 전 등기부등본에서 꼭 확인해야 할 세 가지를 정리해드립니다.\n\n1) 근저당권 설정 여부와 채권최고액\n2) 소유자와 임대인이 동일인인지 여부\n3) 가압류·가처분 등 권리 제한 사항\n\n특히 전세보증금이 매매가 대비 지나치게 높은 '깡통전세'는 반드시 피해야 합니다. anam은 계약 전 등기부등본을 함께 확인해 드리고, 필요 시 전세보증보험 가입 절차도 안내해 드리고 있습니다.",
    createdAt: "2026-08-24T09:00:00"
  }
];

/* ---------------------------------------------------------
   데모 모드(로컬 저장) 브리지 — Supabase 미연동 상태에서 admin.html이
   저장한 매물을 메인/상세 페이지에도 그대로 반영합니다.
   Supabase가 연동되면 아래 anamLoadListingsFromSupabase가 이 값을 덮어씁니다.
   --------------------------------------------------------- */
function anamApplyLocalAdminListings() {
  try {
    const raw = localStorage.getItem("anam-admin-listings");
    if (!raw) return;
    const local = JSON.parse(raw);
    if (Array.isArray(local) && local.length) {
      LISTINGS.length = 0;
      LISTINGS.push(...local);
    }
  } catch (err) {
    console.warn("[anam] 로컬 관리자 데이터 로드 실패:", err);
  }
}
anamApplyLocalAdminListings();

// Supabase 미연동(데모) 상태에서, admin.html을 다른 탭/창에서 열어 매물을 저장하면
// 이미 열려 있는 index.html/detail.html 탭에도 새로고침 없이 바로 반영되도록 합니다.
window.addEventListener("storage", (e) => {
  if (e.key === "anam-admin-listings") {
    anamApplyLocalAdminListings();
    document.dispatchEvent(new CustomEvent("anam:listings-updated"));
  }
});

/* ---------------------------------------------------------
   부동산정보 매거진 — 데모 모드(로컬 저장) 브리지.
   admin.html [부동산정보] 탭에서 저장한 글을 info.html/info-detail.html에도
   그대로 반영합니다. Supabase가 연동되면 anamLoadMagazineFromSupabase가 덮어씁니다.
   --------------------------------------------------------- */
function anamApplyLocalMagazinePosts() {
  try {
    const raw = localStorage.getItem("anam-admin-magazine");
    if (!raw) return;
    const local = JSON.parse(raw);
    if (Array.isArray(local) && local.length) {
      MAGAZINE_POSTS.length = 0;
      MAGAZINE_POSTS.push(...local);
    }
  } catch (err) {
    console.warn("[anam] 로컬 매거진 데이터 로드 실패:", err);
  }
}
anamApplyLocalMagazinePosts();

window.addEventListener("storage", (e) => {
  if (e.key === "anam-admin-magazine") {
    anamApplyLocalMagazinePosts();
    document.dispatchEvent(new CustomEvent("anam:magazine-updated"));
  }
});

function anamMapSupabaseMagazineRow(row) {
  return {
    id: row.id,
    title: row.title,
    thumbnail: row.thumbnail || "https://picsum.photos/seed/anam-mag-fallback/1000/750",
    content: row.content || "",
    createdAt: row.created_at || new Date().toISOString()
  };
}

async function anamLoadMagazineFromSupabase() {
  if (!window.anamSupabase) return; // 미연동 상태 — 목업 데이터 유지
  try {
    const { data, error } = await window.anamSupabase
      .from("magazine_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (Array.isArray(data)) {
      MAGAZINE_POSTS.length = 0;
      MAGAZINE_POSTS.push(...data.map(anamMapSupabaseMagazineRow));
      document.dispatchEvent(new CustomEvent("anam:magazine-updated"));
    }
  } catch (err) {
    console.warn("[anam] Supabase 매거진 조회 실패, 목업 데이터를 사용합니다:", err);
  }
}

/* ---------------------------------------------------------
   Supabase 연동 — assets/js/supabase-client.js에서 URL/KEY를
   채워 넣으면, 위 목업 배열을 실제 listings 테이블 데이터로
   교체하고 "anam:listings-updated" 이벤트를 쏴서 화면을 갱신합니다.
   미연동 상태라면 아무 일도 하지 않고 목업 데이터를 그대로 씁니다.
   --------------------------------------------------------- */
function anamMapSupabaseRow(row) {
  // admin.html 등록 폼은 한글 값만 입력받으므로, 영문(*_En) 컬럼이 없으면
  // 한글 값을 그대로 영문 자리에도 사용해 EN 토글이 깨지지 않도록 합니다.
  return {
    id: row.id,
    type: row.type,
    typeEn: row.type_en || row.type,
    title: row.title,
    titleEn: row.title_en || row.title,
    location: row.location,
    locationEn: row.location_en || row.location,
    leaseType: row.lease_type,
    leaseTypeEn: row.lease_type_en || row.lease_type,
    deposit: Number(row.deposit) || 0,
    monthlyRent: Number(row.monthly_rent) || 0,
    moveInDate: row.move_in_date,
    area: row.area || "",
    structure: row.structure || "",
    structureEn: row.structure_en || row.structure || "",
    totalFloors: row.total_floors || "",
    currentFloor: row.current_floor || "",
    builtYear: row.built_year || "",
    maintenanceFee: row.maintenance_fee || "",
    maintenanceFeeEn: row.maintenance_fee_en || row.maintenance_fee || "",
    options: row.options || "",
    optionsEn: row.options_en || row.options || "",
    etc: row.etc || "",
    etcEn: row.etc_en || row.etc || "",
    features: row.features || [],
    keywords: row.keywords || [],
    keywordsEn: row.keywords_en || row.keywords || [],
    description: row.description || "",
    descriptionEn: row.description_en || row.description || "",
    images: row.images && row.images.length ? row.images : ["https://picsum.photos/seed/anam-fallback/1200/900"],
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

async function anamLoadListingsFromSupabase() {
  if (!window.anamSupabase) return; // 미연동 상태 — 목업 데이터 유지
  try {
    const { data, error } = await window.anamSupabase
      .from("listings")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    if (Array.isArray(data)) {
      LISTINGS.length = 0;
      LISTINGS.push(...data.map(anamMapSupabaseRow));
      document.dispatchEvent(new CustomEvent("anam:listings-updated"));
    }
  } catch (err) {
    console.warn("[anam] Supabase 매물 조회 실패, 목업 데이터를 사용합니다:", err);
  }
}

document.addEventListener("DOMContentLoaded", anamLoadListingsFromSupabase);
document.addEventListener("DOMContentLoaded", anamLoadMagazineFromSupabase);
document.addEventListener("DOMContentLoaded", anamLoadKeywordsFromSupabase);
document.addEventListener("DOMContentLoaded", anamLoadListingTypesFromSupabase);
document.addEventListener("DOMContentLoaded", anamLoadLeaseTypesFromSupabase);
