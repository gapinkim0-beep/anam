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
├── index.html            # 메인 랜딩 페이지
├── detail.html           # 매물 상세 페이지
├── assets/
│   ├── css/style.css     # 디자인 토큰 + 전체 스타일 (DESIGN.md 팔레트/간격 준수)
│   └── js/
│       ├── data.js       # 목업 매물 데이터 10건 (실서비스에서는 API 응답으로 교체)
│       ├── i18n.js       # KR/EN 다국어 토글
│       ├── main.js       # 메인 페이지: 정렬/필터/카드 렌더링
│       └── detail.js     # 상세 페이지: 갤러리, 스펙 테이블, 문의 모달
└── README.md
```

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

## 데이터 연동 가이드 (Supabase / Firebase)

현재는 `assets/js/data.js`의 `LISTINGS` 배열과 `localStorage`(문의 내역)로 동작하는 프론트엔드 전용 프로토타입입니다.
실제 서비스로 전환할 때는 아래 순서를 권장합니다.

### 1) Supabase를 사용하는 경우

1. Supabase 프로젝트 생성 후 테이블 2개 구성
   - `listings` : id, type, title, title_en, location, location_en, lease_type, deposit, monthly_rent, move_in_date, area, structure, structure_en, maintenance_fee, maintenance_fee_en, options, options_en, etc, etc_en, features(text[]), keywords(text[]), keywords_en(text[]), description, description_en, images(text[]), updated_at
   - `inquiries` : id, listing_id(FK), move_date, visit_time, other_listing, note, contact, created_at
2. `supabase-js` CDN 스크립트 추가 후 `data.js`의 `LISTINGS` 하드코딩을 아래로 교체
   ```js
   const { data: LISTINGS } = await supabase
     .from('listings')
     .select('*')
     .order('updated_at', { ascending: false })
     .limit(10);
   ```
3. `detail.js`의 문의 폼 제출부(`localStorage.setItem` 부분)를 아래로 교체
   ```js
   await supabase.from('inquiries').insert(inquiry);
   ```
4. 관리자 페이지는 Supabase Studio(테이블 편집 UI)를 그대로 사용하거나, 별도 어드민 화면을 만들어 `listings` 테이블에 CRUD.
5. 이미지: Supabase Storage 버킷 업로드 후 public URL을 `images` 배열에 저장.

### 2) Firebase를 사용하는 경우

1. Firestore 컬렉션 `listings`, `inquiries` 구성 (필드는 위와 동일한 스키마 사용).
2. Firebase SDK(compat 또는 modular) 추가 후
   ```js
   const snap = await db.collection('listings').orderBy('updatedAt', 'desc').limit(10).get();
   const LISTINGS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
   ```
3. 문의 저장
   ```js
   await db.collection('inquiries').add(inquiry);
   ```
4. 이미지: Firebase Storage 업로드 후 다운로드 URL을 `images` 배열에 저장.
5. 관리자 화면: Firebase 콘솔에서 직접 문서를 수정하거나, 간단한 관리자 웹앱(Firebase Auth로 로그인 제한)을 별도 구축.

### 공통 권장 사항

- 매물 상세 소개글(`description`)은 관리자가 자유 텍스트로 수정할 수 있어야 하므로, DB 컬럼은 plain text 또는 간단한 마크다운으로 저장하고 프론트에서 렌더링하는 방식을 권장합니다.
- 문의 데이터는 개인정보(연락처)를 포함하므로, Supabase RLS(행 수준 보안) 또는 Firestore 보안 규칙으로 `inquiries` 테이블은 **쓰기만 공개, 읽기는 관리자만 허용**하도록 설정하세요.
- 배포 후 관리자 알림(이메일/슬랙)을 원한다면 Supabase Edge Function 또는 Firebase Cloud Function으로 `inquiries` insert 트리거를 연결하는 것을 권장합니다.
