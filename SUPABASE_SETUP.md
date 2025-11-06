# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 에 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Project name: `my-real-estate` (또는 원하는 이름)
   - Database Password: 안전한 비밀번호 생성
   - Region: `Northeast Asia (Seoul)` 또는 가까운 지역 선택
4. "Create new project" 클릭

## 2. 환경 변수 설정

1. Supabase 대시보드에서 Settings > API로 이동
2. 다음 값들을 복사:
   - `Project URL`
   - `anon` `public` key

3. 프로젝트 루트에 `.env.local` 파일 생성:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 SQL Editor로 이동
2. "New query" 클릭
3. `supabase/schema.sql` 파일의 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭하여 실행

또는 Supabase CLI를 사용:

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트에 링크
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

## 4. 테이블 확인

SQL Editor에서 다음 쿼리로 테이블이 생성되었는지 확인:

```sql
SELECT * FROM properties;
SELECT * FROM price_history;
```

## 5. Storage 설정 (사진 업로드용)

1. Supabase 대시보드에서 Storage로 이동
2. "Create a new bucket" 클릭
3. Bucket 정보 입력:
   - Name: `property-photos`
   - Public bucket: ✓ (체크)
4. "Create bucket" 클릭

5. Bucket 정책 설정:
   - Bucket을 선택하고 "Policies" 탭으로 이동
   - "New policy" > "For full customization" 클릭
   - 다음 정책 추가:

```sql
-- 모든 사용자가 사진을 볼 수 있음
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'property-photos' );

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-photos'
  AND auth.role() = 'authenticated'
);

-- 업로드한 사용자만 삭제 가능
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-photos'
  AND auth.uid() = owner
);
```

## 6. 이메일 인증 설정

1. Authentication > Providers로 이동
2. Email provider가 활성화되어 있는지 확인
3. Settings > Auth > Email Templates에서 이메일 템플릿 커스터마이징 가능

## 7. 테스트

개발 서버를 재시작하고 테스트:

```bash
npm run dev
```

## 8. 유용한 SQL 쿼리

### 더미 데이터 생성 (개발용)

```sql
-- 테스트 사용자의 UUID 확인
SELECT id FROM auth.users LIMIT 1;

-- 부동산 데이터 추가
INSERT INTO properties (
  user_id,
  name,
  region,
  area,
  pyeong,
  floor,
  registered_date,
  sale_price,
  recent_transaction_price,
  description
) VALUES (
  'user-uuid-here',
  '래미안 아파트',
  '서울시 강남구',
  84.5,
  25.5,
  10,
  '2024-01-01',
  800000000,
  750000000,
  '교통이 편리한 위치에 있는 아파트입니다.'
);

-- 가격 히스토리 추가
INSERT INTO price_history (
  property_id,
  date,
  price,
  transaction_type
) VALUES (
  'property-id-here',
  '2024-01-15',
  750000000,
  'sale'
);
```

## 문제 해결

### 연결 오류
- `.env.local` 파일의 환경 변수가 올바른지 확인
- 개발 서버를 재시작했는지 확인
- Supabase 프로젝트가 활성 상태인지 확인

### RLS 정책 오류
- SQL Editor에서 정책이 올바르게 생성되었는지 확인
- 인증 상태를 확인

### 이미지 업로드 오류
- Storage bucket이 public으로 설정되어 있는지 확인
- 정책이 올바르게 설정되어 있는지 확인
