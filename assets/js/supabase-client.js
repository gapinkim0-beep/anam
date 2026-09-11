/* =========================================================
   anam real estate agency — Supabase 연동 설정
   =========================================================

   [설정 방법]
   1) https://supabase.com 에서 프로젝트를 새로 만듭니다.
   2) 아래 SUPABASE_URL / SUPABASE_ANON_KEY 두 값을
      Supabase 대시보드 > Project Settings > API 에서 복사해 붙여넣습니다.
      (anon public key만 사용합니다. service_role 키는 절대 프론트엔드 코드에 넣지 마세요.)
   3) 값을 채워 넣으면 index.html / detail.html / admin.html이 자동으로
      Supabase에서 매물·문의 데이터를 읽고 씁니다. 값을 비워두면(기본 상태)
      데모용 목업 데이터(assets/js/data.js의 LISTINGS)와 localStorage로 동작합니다.

   [테이블 구조 가이드]

   -- 1) 매물 테이블
   -- 주의: 호실(unitNumber)은 외부에 노출되면 안 되는 정보라 이 테이블에 넣지 않고,
   --       아래 4-3)의 listing_admin_info 테이블(관리자만 조회 가능)에 따로 저장합니다.
   create table listings (
     id bigint generated always as identity primary key,
     type text not null,                 -- 매물 종류 (관리자가 [매물종류/임대방식] 탭에서 관리, 기본: 오피스텔/주택/상가)
     title text not null,
     location text not null,             -- 주소 (도로명 주소 검색으로 입력)
     lease_type text not null,           -- 임대방식 (관리자가 [매물종류/임대방식] 탭에서 관리, 기본: 월세/전세)
     deposit numeric not null,           -- 보증금(만원)
     monthly_rent numeric default 0,     -- 월세(만원, 전세는 0)
     move_in_date date,
     area text,                          -- 평수/면적
     structure text,                     -- 구조
     total_floors text,                  -- 건물 총 층수
     current_floor text,                 -- 해당 층수
     built_year text,                    -- 준공년도
     maintenance_fee text,               -- 관리비
     options text,                       -- 옵션
     etc text,                           -- 기타 사항
     features text[] default '{}',       -- 필터 칩(채광/위치/평수/풀옵션/리모델링/인테리어)
     keywords text[] default '{}',       -- 상세페이지 라이프스타일 키워드
     description text,                   -- 소개글(관리자가 자유 입력)
     images text[] default '{}',         -- 대표 이미지 + 상세 서브 이미지 URL 배열 (0번째 = 대표)
     updated_at timestamptz default now()
   );
   alter table listings enable row level security;
   create policy "누구나 매물 조회 가능" on listings for select using (true);
   -- 등록/수정/삭제는 관리자(로그인한 Supabase Auth 사용자)만 허용
   create policy "관리자만 매물 등록" on listings for insert with check (auth.role() = 'authenticated');
   create policy "관리자만 매물 수정" on listings for update using (auth.role() = 'authenticated');
   create policy "관리자만 매물 삭제" on listings for delete using (auth.role() = 'authenticated');

   -- 2) 문의 내역 테이블 (상세페이지 '문의하기' 팝업에서 저장)
   create table inquiries (
     id bigint generated always as identity primary key,
     listing_id bigint references listings(id) on delete set null,
     listing_title text,
     move_date date,
     visit_time time,
     other_listing text,
     note text,
     contact text not null,
     status text not null default '확인',  -- 확인 / 상담중 / 완료 — admin.html [문의고객] 탭 스텝 인디케이터에서 갱신
     created_at timestamptz default now()
   );
   alter table inquiries enable row level security;
   create policy "누구나 문의 등록 가능" on inquiries for insert with check (true);
   -- 문의 내역 조회/상태 변경은 관리자만 (개인정보 보호)
   create policy "관리자만 문의 조회" on inquiries for select using (auth.role() = 'authenticated');
   create policy "관리자만 문의 상태 변경" on inquiries for update using (auth.role() = 'authenticated');

   -- 3) 부동산정보 매거진 테이블 (admin.html [부동산정보] 탭에서 작성 → info.html/info-detail.html에 노출)
   create table magazine_posts (
     id bigint generated always as identity primary key,
     title text not null,
     thumbnail text,               -- 썸네일 이미지 URL (magazine-images Storage 버킷)
     content text,                 -- 본문 내용 (줄바꿈으로 문단 구분)
     created_at timestamptz default now()   -- 등록일
   );
   alter table magazine_posts enable row level security;
   create policy "누구나 매거진 조회 가능" on magazine_posts for select using (true);
   create policy "관리자만 매거진 작성" on magazine_posts for insert with check (auth.role() = 'authenticated');
   create policy "관리자만 매거진 수정" on magazine_posts for update using (auth.role() = 'authenticated');
   create policy "관리자만 매거진 삭제" on magazine_posts for delete using (auth.role() = 'authenticated');

   -- 4) 키워드(라이프스타일 필터 칩) 테이블 — admin.html [키워드] 탭에서 추가/삭제
   --    → index.html 필터바 / admin.html 매물 등록 폼 칩에 그대로 반영됩니다.
   create table keywords (
     id bigint generated always as identity primary key,
     label text not null unique,
     sort_order int not null default 0,
     created_at timestamptz default now()
   );
   alter table keywords enable row level security;
   create policy "누구나 키워드 조회 가능" on keywords for select using (true);
   create policy "관리자만 키워드 등록" on keywords for insert with check (auth.role() = 'authenticated');
   create policy "관리자만 키워드 수정" on keywords for update using (auth.role() = 'authenticated');
   create policy "관리자만 키워드 삭제" on keywords for delete using (auth.role() = 'authenticated');

   -- 4-1) 매물 종류 / 4-2) 임대방식 — admin.html [매물종류/임대방식] 탭에서 추가/삭제.
   --      keywords와 완전히 동일한 구조(label, sort_order)의 테이블 2개(listing_types, lease_types)입니다.

   -- 4-3) 매물 호실(unitNumber) — 외부에 노출되면 안 되는 정보라 listings와 분리된 테이블에 저장하고,
   --      관리자만 조회/등록/수정 가능하도록 RLS를 겁니다. (anon 키로는 select 정책이 없어 절대 읽을 수 없음)
   create table listing_admin_info (
     listing_id bigint primary key references listings(id) on delete cascade,
     unit_number text
   );
   alter table listing_admin_info enable row level security;
   create policy "관리자만 호실 조회" on listing_admin_info for select using (auth.role() = 'authenticated');
   create policy "관리자만 호실 등록" on listing_admin_info for insert with check (auth.role() = 'authenticated');
   create policy "관리자만 호실 수정" on listing_admin_info for update using (auth.role() = 'authenticated');
   create policy "관리자만 호실 삭제" on listing_admin_info for delete using (auth.role() = 'authenticated');

   -- 5) 이미지 업로드용 Storage 버킷 (Supabase 대시보드 > Storage에서 생성, 모두 Public 버킷)
   --    listing-images   : 매물 대표/서브 이미지 (admin.html [매물수정] 탭)
   --    magazine-images  : 부동산정보 글 썸네일 (admin.html [부동산정보] 탭)

   -- 6) 관리자 로그인 계정
   --    Supabase 대시보드 > Authentication > Users에서 관리자 이메일/비밀번호를 미리 하나 만들어두세요.
   --    admin.html은 비밀번호 입력창 하나만 보여주고, 내부적으로는 아래 ADMIN_EMAIL 계정으로 로그인합니다.

   [전체 마이그레이션 SQL 파일]
   위 1~5번 테이블/정책/버킷 생성 SQL은 anam/supabase/schema.sql 파일에도 그대로 저장되어 있습니다.
   Supabase 대시보드 > SQL Editor에 붙여넣어 한 번에 실행할 수 있습니다.
   ========================================================= */

const SUPABASE_URL = "https://mjhioykhsyugzaptgfay.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaGlveWtoc3l1Z3phcHRnZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMDY0NTksImV4cCI6MjEwNDY4MjQ1OX0.Uga81x5iG40pumH8OPwfTCUW2MrMrLojkX4P_GThxmg";

// admin.html 로그인 폼은 비밀번호만 입력받고, 이 이메일로 Supabase Auth에 로그인합니다.
// Supabase Authentication 탭에서 이 이메일로 관리자 계정을 하나 만들어 두세요.
const ADMIN_EMAIL = "admin@anam-realestate.local";

(function () {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.info("[anam] Supabase 미연동 상태입니다. 목업 데이터/localStorage로 동작합니다. (assets/js/supabase-client.js 참고)");
    return;
  }
  if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
    console.warn("[anam] supabase-js SDK를 불러오지 못했습니다. <script> 태그 로드 순서를 확인하세요.");
    return;
  }
  window.anamSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
