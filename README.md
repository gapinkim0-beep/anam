# anam real estate agency

> 라이프스타일을 중개합니다.

안암·고려대 일대 원룸/주택/상가 임대차 중개를 위한 랜딩 페이지 및 매물 상세 페이지입니다.
`DESIGN.md`(Raus 스타일 가이드)와 `부동산 홈페이지 프롬프트.txt`의 요구사항을 기준으로 제작되었습니다.

## 배포 URL

- 메인 페이지: _배포 후 안내드립니다._
- 매물 상세 페이지: `<메인 URL>/detail.html?id=1` 형태로 접근합니다.

## 폴더 구조

```
anam/
├── index.html                  # 메인 랜딩 페이지
├── detail.html                 # 매물 상세 페이지
├── about.html                  # 소개글 페이지 (브랜드 철학, 에디토리얼 톤)
├── info.html                   # 부동산정보 매거진 목록 (2-Column 카드)
├── info-detail.html            # 부동산정보 매거진 상세
├── admin.html                  # 관리자 대시보드 — 상단 탭(매물수정/키워드/문의고객/부동산정보)
│                                  (홈 화면에 노출되지 않음, 직접 접속 또는 푸터 미세 링크로만 진입)
├── assets/
│   ├── css/style.css           # 디자인 토큰 + 전체 스타일 (DESIGN.md 팔레트/간격 준수)
│   ├── images/
│   │   ├── logo.jpg            # 헤더/푸터 로고 (image/logo 폴더 원본을 웹용으로 리사이즈)
│   │   └── hero-1/2/3.jpg      # 히어로 메인 배너 (image/네비게이션 바 폴더 1,2,3 순서)
│   └── js/
│       ├── data.js             # 목업 매물 10건 + 매거진 2건 + 키워드 목록 + Supabase/로컬 저장 브리지
│       ├── i18n.js             # KR/EN 다국어 토글
│       ├── main.js             # 메인 페이지: 정렬/필터/카드 렌더링, 키워드 칩 동적 렌더링
│       ├── detail.js           # 상세 페이지: 갤러리, 스펙 테이블
│       ├── info.js             # 부동산정보 목록 렌더링
│       ├── info-detail.js      # 부동산정보 상세 렌더링
│       ├── inquiry-modal.js    # index.html·detail.html·about.html·info(-detail).html 공용 '문의하기' 팝업
│       ├── admin.js            # 관리자 로그인 + 탭 전환 + 매물/키워드/문의상태/매거진 CRUD
│       └── supabase-client.js  # Supabase 연동 설정 + 테이블/Storage 스키마 가이드(주석)
└── README.md
```

## 네비게이션 / 페이지 구성

- **소개글**(`about.html`): 대표 김가빈의 브랜드 철학을 담은 에디토리얼 페이지.
- **부동산정보**(`info.html` → `info-detail.html?id=`): 매주 발행하는 부동산 이슈 매거진.
- **문의**: 모든 페이지 상단 네비의 '문의' 클릭 시 기존 '문의하기' 팝업 모달이 레이어로 열립니다.

## 디자인 시스템 준수 사항

- **색상**: `#23212c`(Charcoal), `#f7f0e1`(Paper), `#ffffff`(Snow), `#006434`(Pine), `#fcbd1c`(Marigold) — 팔레트 외 색상 미사용
- **간격**: 4px 기준 단위의 배수만 사용 (4/8/12/16/20/24/40/48/96/120px)
- **라운드**: 버튼/카드 20px, 필터바·상세 히어로 이미지 40px, 칩·태그 12px, 필/토글 99px
- **그림자 금지**, **본문/헤드라인 좌측 정렬**, Pine은 로고·활성 링크에만 절제 사용, Marigold는 필터바 표면에만 사용

## 로컬 미리보기

정적 파일이므로 별도 빌드 없이 바로 열립니다.

```powershell
cd anam
# 아무 정적 서버로 실행 (예: VS Code Live Server, 또는)
python -m http.server 5500
```

브라우저에서 `http://localhost:5500` 접속.

## 관리자 페이지 (admin.html)

- 브랜드 미니멀 톤을 지키기 위해 홈 화면에는 관리자 아이콘/버튼을 노출하지 않습니다.
  `admin.html`에 직접 접속하거나, 각 페이지 하단 저작권 줄 끝의 아주 옅은 `·` 링크(`.footer-admin-link`)로만 진입합니다.
- 접속 시 비밀번호 입력 폼이 먼저 뜨고, 로그인에 성공해야 상단 탭 대시보드가 노출됩니다.
- **Supabase 연동 전(데모 모드)**: 비밀번호는 `assets/js/admin.js`의 `DEMO_ADMIN_PASSWORD`(기본값 `anam1234`) 값이며,
  데이터는 이 브라우저의 localStorage에 저장되어 각 화면에도 즉시 반영됩니다. 운영 전 반드시 교체하세요.
- **Supabase 연동 후**: 비밀번호 입력만으로 로그인하되, 내부적으로는 `assets/js/supabase-client.js`에 정의된
  `ADMIN_EMAIL` 계정으로 Supabase Auth 로그인을 수행합니다. Supabase 대시보드 > Authentication에서 이 이메일로
  관리자 계정을 하나 만들고, 그 계정의 비밀번호를 관리자에게 안내해 주세요.

### 상단 탭 대시보드

1. **매물수정**: 기존 매물 등록/수정/삭제(CRUD). 이미지, 주소, 가격, 임대방식 등을 관리합니다.
2. **키워드**: 필터바(index.html) 및 매물 등록 폼의 '매물 특징' 칩으로 쓰이는 라이프스타일 키워드를
   추가/삭제합니다. 저장 즉시 메인 화면과 매물 등록 폼에 반영됩니다.
3. **문의고객**: 고객 문의 내역을 표로 확인하고, 각 행의 **스텝 인디케이터**(확인 → 상담중 → 완료)를
   클릭해 처리 상태를 갱신합니다.
4. **부동산정보**: `info.html`에 노출될 매주 이슈 글을 작성/수정/삭제합니다. (본문 15px)

## 데이터 연동 가이드 (Supabase)

현재는 `assets/js/data.js`의 `LISTINGS` 배열(및 데모 모드에서는 localStorage)로 동작하는 프론트엔드 전용 프로토타입이며,
Supabase를 연동하면 아래 순서로 실제 DB에 실시간 반영됩니다.

1. Supabase 프로젝트를 만들고, **테이블 스키마 / RLS 정책 / Storage 버킷 / 관리자 계정 생성 SQL·가이드**는
   `assets/js/supabase-client.js` 파일 상단 주석에 그대로 정리되어 있습니다. Supabase SQL Editor에 복사해 실행하세요.
2. `assets/js/supabase-client.js`의 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 두 값을 프로젝트 값으로 채워 넣습니다.
   (anon public key만 사용하고, service_role 키는 절대 프론트 코드에 넣지 않습니다.)
3. 값을 채우는 즉시:
   - `index.html` / `detail.html`은 `listings` 테이블 데이터를 불러와 자동으로 화면을 갱신합니다. (`data.js`의 `anamLoadListingsFromSupabase`)
   - `info.html` / `info-detail.html`은 `magazine_posts` 테이블 데이터를 불러옵니다. (`data.js`의 `anamLoadMagazineFromSupabase`)
   - 상세페이지 '문의하기' 팝업은 `inquiries` 테이블에 `status`(확인/상담중/완료) 기본값과 함께 저장됩니다. (`inquiry-modal.js`)
   - `admin.html`의 등록/수정/삭제와 이미지 업로드는 `listings`/`magazine_posts` 테이블 및 `listing-images`/`magazine-images`
     Storage 버킷을 사용하고, 문의 상태 변경은 `inquiries.status`를 업데이트합니다. (`admin.js`)
4. 값을 비워두면(기본 상태) 모든 화면이 자동으로 데모 모드(목업 데이터 + localStorage)로 동작하므로,
   Supabase 없이도 전체 흐름(등록 → 메인/상세 반영 → 문의 접수 → 관리자 확인/상태 변경 → 매거진 발행)을 바로 확인할 수 있습니다.

### 공통 권장 사항

- 매물 상세 소개글(`description`)은 관리자가 자유 텍스트로 수정할 수 있어야 하므로, plain text 컬럼으로 저장하고 프론트에서 그대로 렌더링합니다.
- 문의 데이터는 개인정보(연락처)를 포함하므로, `inquiries` 테이블은 **쓰기만 공개, 읽기는 로그인한 관리자만 허용**하도록 RLS를 설정합니다(`supabase-client.js` 참고).
- 배포 후 관리자 알림(이메일/슬랙)을 원한다면 Supabase Edge Function으로 `inquiries` insert 트리거를 연결하는 것을 권장합니다.
