-- =========================================================
-- anam real estate agency — Supabase 스키마 전체 마이그레이션
-- Supabase 대시보드 > SQL Editor에 붙여넣어 실행하세요.
-- (assets/js/supabase-client.js 상단 가이드와 동일한 내용입니다.)
-- =========================================================

-- 1) 매물 (매물수정 · 매물등록 · 등록된 매물)
-- 주의: 호실(unitNumber)은 외부에 노출되면 안 되는 정보라 이 테이블에 넣지 않고,
--       아래 5)의 listing_admin_info 테이블(관리자만 조회 가능)에 따로 저장합니다.
create table if not exists listings (
  id bigint generated always as identity primary key,
  type text not null,                 -- 매물 종류 (관리자가 [매물종류/임대방식] 탭에서 관리, 기본: 오피스텔/주택/상가)
  title text not null,
  location text not null,             -- 주소 (도로명 주소 검색으로 입력)
  lease_type text not null,           -- 임대방식 (관리자가 [매물종류/임대방식] 탭에서 관리, 기본: 월세/전세)
  deposit numeric not null default 0, -- 보증금(만원)
  monthly_rent numeric default 0,     -- 월세(만원, 전세는 0)
  move_in_date date,
  area text,
  structure text,
  total_floors text,                  -- 건물 총 층수
  current_floor text,                 -- 해당 층수
  built_year text,                    -- 준공년도
  maintenance_fee text,
  options text,
  etc text,
  features text[] default '{}',
  keywords text[] default '{}',
  description text,
  images text[] default '{}',         -- 0번째가 대표 이미지 (관리자 페이지 이미지 관리자에서 순서 변경)
  updated_at timestamptz default now()
);
alter table listings enable row level security;
drop policy if exists "누구나 매물 조회 가능" on listings;
create policy "누구나 매물 조회 가능" on listings for select using (true);
drop policy if exists "관리자만 매물 등록" on listings;
create policy "관리자만 매물 등록" on listings for insert with check (auth.role() = 'authenticated');
drop policy if exists "관리자만 매물 수정" on listings;
create policy "관리자만 매물 수정" on listings for update using (auth.role() = 'authenticated');
drop policy if exists "관리자만 매물 삭제" on listings;
create policy "관리자만 매물 삭제" on listings for delete using (auth.role() = 'authenticated');

-- 2) 문의고객
create table if not exists inquiries (
  id bigint generated always as identity primary key,
  listing_id bigint references listings(id) on delete set null,
  listing_title text,
  move_date date,
  visit_time time,
  other_listing text,
  note text,
  contact text not null,
  status text not null default '확인',  -- 확인 / 상담중 / 완료
  created_at timestamptz default now()
);
alter table inquiries enable row level security;
drop policy if exists "누구나 문의 등록 가능" on inquiries;
create policy "누구나 문의 등록 가능" on inquiries for insert with check (true);
drop policy if exists "관리자만 문의 조회" on inquiries;
create policy "관리자만 문의 조회" on inquiries for select using (auth.role() = 'authenticated');
drop policy if exists "관리자만 문의 상태 변경" on inquiries;
create policy "관리자만 문의 상태 변경" on inquiries for update using (auth.role() = 'authenticated');

-- 3) 부동산정보 매거진
create table if not exists magazine_posts (
  id bigint generated always as identity primary key,
  title text not null,
  thumbnail text,
  content text,
  created_at timestamptz default now()
);
alter table magazine_posts enable row level security;
drop policy if exists "누구나 매거진 조회 가능" on magazine_posts;
create policy "누구나 매거진 조회 가능" on magazine_posts for select using (true);
drop policy if exists "관리자만 매거진 작성" on magazine_posts;
create policy "관리자만 매거진 작성" on magazine_posts for insert with check (auth.role() = 'authenticated');
drop policy if exists "관리자만 매거진 수정" on magazine_posts;
create policy "관리자만 매거진 수정" on magazine_posts for update using (auth.role() = 'authenticated');
drop policy if exists "관리자만 매거진 삭제" on magazine_posts;
create policy "관리자만 매거진 삭제" on magazine_posts for delete using (auth.role() = 'authenticated');

-- 4) 키워드 (라이프스타일 필터 칩)
create table if not exists keywords (
  id bigint generated always as identity primary key,
  label text not null unique,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
alter table keywords enable row level security;
drop policy if exists "누구나 키워드 조회 가능" on keywords;
create policy "누구나 키워드 조회 가능" on keywords for select using (true);
drop policy if exists "관리자만 키워드 등록" on keywords;
create policy "관리자만 키워드 등록" on keywords for insert with check (auth.role() = 'authenticated');
drop policy if exists "관리자만 키워드 수정" on keywords;
create policy "관리자만 키워드 수정" on keywords for update using (auth.role() = 'authenticated');
drop policy if exists "관리자만 키워드 삭제" on keywords;
create policy "관리자만 키워드 삭제" on keywords for delete using (auth.role() = 'authenticated');

-- 4-1) 매물 종류 — admin.html [매물종류/임대방식] 탭에서 추가/삭제 (keywords와 동일한 구조)
create table if not exists listing_types (
  id bigint generated always as identity primary key,
  label text not null unique,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
alter table listing_types enable row level security;
drop policy if exists "누구나 매물종류 조회 가능" on listing_types;
create policy "누구나 매물종류 조회 가능" on listing_types for select using (true);
drop policy if exists "관리자만 매물종류 등록" on listing_types;
create policy "관리자만 매물종류 등록" on listing_types for insert with check (auth.role() = 'authenticated');
drop policy if exists "관리자만 매물종류 수정" on listing_types;
create policy "관리자만 매물종류 수정" on listing_types for update using (auth.role() = 'authenticated');
drop policy if exists "관리자만 매물종류 삭제" on listing_types;
create policy "관리자만 매물종류 삭제" on listing_types for delete using (auth.role() = 'authenticated');

-- 4-2) 임대방식 — admin.html [매물종류/임대방식] 탭에서 추가/삭제 (keywords와 동일한 구조)
create table if not exists lease_types (
  id bigint generated always as identity primary key,
  label text not null unique,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
alter table lease_types enable row level security;
drop policy if exists "누구나 임대방식 조회 가능" on lease_types;
create policy "누구나 임대방식 조회 가능" on lease_types for select using (true);
drop policy if exists "관리자만 임대방식 등록" on lease_types;
create policy "관리자만 임대방식 등록" on lease_types for insert with check (auth.role() = 'authenticated');
drop policy if exists "관리자만 임대방식 수정" on lease_types;
create policy "관리자만 임대방식 수정" on lease_types for update using (auth.role() = 'authenticated');
drop policy if exists "관리자만 임대방식 삭제" on lease_types;
create policy "관리자만 임대방식 삭제" on lease_types for delete using (auth.role() = 'authenticated');

-- 4-3) 매물 호실(unitNumber) — 외부에 노출되면 안 되는 정보라 listings와 분리된 테이블에 저장하고,
--      관리자(로그인한 Supabase Auth 사용자)만 조회/등록/수정할 수 있도록 RLS를 겁니다.
--      (anon 키로는 select 정책 자체가 없어 이 테이블을 절대 읽을 수 없습니다)
create table if not exists listing_admin_info (
  listing_id bigint primary key references listings(id) on delete cascade,
  unit_number text
);
alter table listing_admin_info enable row level security;
drop policy if exists "관리자만 호실 조회" on listing_admin_info;
create policy "관리자만 호실 조회" on listing_admin_info for select using (auth.role() = 'authenticated');
drop policy if exists "관리자만 호실 등록" on listing_admin_info;
create policy "관리자만 호실 등록" on listing_admin_info for insert with check (auth.role() = 'authenticated');
drop policy if exists "관리자만 호실 수정" on listing_admin_info;
create policy "관리자만 호실 수정" on listing_admin_info for update using (auth.role() = 'authenticated');
drop policy if exists "관리자만 호실 삭제" on listing_admin_info;
create policy "관리자만 호실 삭제" on listing_admin_info for delete using (auth.role() = 'authenticated');

-- 5) 이미지 업로드용 Storage 버킷 (모두 Public)
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
values ('magazine-images', 'magazine-images', true)
on conflict (id) do nothing;

drop policy if exists "누구나 매물/매거진 이미지 조회 가능" on storage.objects;
create policy "누구나 매물/매거진 이미지 조회 가능" on storage.objects for select
  using (bucket_id in ('listing-images', 'magazine-images'));
drop policy if exists "관리자만 이미지 업로드" on storage.objects;
create policy "관리자만 이미지 업로드" on storage.objects for insert
  with check (bucket_id in ('listing-images', 'magazine-images') and auth.role() = 'authenticated');
drop policy if exists "관리자만 이미지 수정" on storage.objects;
create policy "관리자만 이미지 수정" on storage.objects for update
  using (bucket_id in ('listing-images', 'magazine-images') and auth.role() = 'authenticated');
drop policy if exists "관리자만 이미지 삭제" on storage.objects;
create policy "관리자만 이미지 삭제" on storage.objects for delete
  using (bucket_id in ('listing-images', 'magazine-images') and auth.role() = 'authenticated');

-- 6) 기본 키워드 / 매물종류 / 임대방식 시드 (기존 데모 데이터 DEFAULT_* 상수와 동일)
insert into keywords (label, sort_order)
values ('채광', 0), ('위치', 1), ('평수', 2), ('풀옵션', 3), ('리모델링', 4), ('인테리어', 5)
on conflict (label) do nothing;

insert into listing_types (label, sort_order)
values ('오피스텔', 0), ('주택', 1), ('상가', 2)
on conflict (label) do nothing;

insert into lease_types (label, sort_order)
values ('월세', 0), ('전세', 1)
on conflict (label) do nothing;
