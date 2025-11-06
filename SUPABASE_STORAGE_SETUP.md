# Supabase Storage 설정 가이드

## 1. Storage Bucket 생성

### Supabase 대시보드에서 설정

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택: `uizoxtnvqisiicvcxgty`

2. **Storage 메뉴로 이동**
   - 왼쪽 메뉴에서 **Storage** 클릭

3. **새 Bucket 생성**
   - **"Create a new bucket"** 버튼 클릭
   - Bucket 정보 입력:
     - **Name**: `property-photos`
     - **Public bucket**: ✅ (체크 - 누구나 읽을 수 있도록)
   - **"Create bucket"** 버튼 클릭

## 2. Storage 정책 설정

### SQL Editor에서 정책 생성

1. **SQL Editor로 이동**
   - 왼쪽 메뉴 > **SQL Editor** 클릭

2. **다음 SQL 실행**

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
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 업로드한 사용자만 수정 가능
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 3. 파일 구조

업로드된 파일은 다음과 같은 구조로 저장됩니다:

```
property-photos/
  └── {user_id}/
      └── {property_id}/
          ├── photo1_{timestamp}.jpg
          └── photo2_{timestamp}.jpg
```

## 4. 환경 변수 확인

`.env.local` 파일에 다음 변수가 있는지 확인:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://uizoxtnvqisiicvcxgty.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 5. 파일 크기 제한

기본 설정:
- **최대 파일 크기**: 50MB
- **허용 형식**: jpg, jpeg, png, webp
- **최대 파일 수**: 2개 (photo1, photo2)

## 6. 테스트

### 수동 업로드 테스트

1. Supabase 대시보드 > Storage > property-photos
2. **"Upload file"** 버튼 클릭
3. 테스트 이미지 업로드
4. 업로드된 파일의 Public URL 확인

### URL 형식

```
https://uizoxtnvqisiicvcxgty.supabase.co/storage/v1/object/public/property-photos/{user_id}/{property_id}/photo1.jpg
```

## 7. 문제 해결

### 업로드 실패
- 버킷이 public으로 설정되었는지 확인
- 정책이 올바르게 생성되었는지 확인
- 파일 크기가 50MB 이하인지 확인

### 이미지가 표시되지 않음
- URL이 올바른지 확인
- 버킷이 public인지 확인
- 브라우저 콘솔에서 CORS 오류 확인

## 8. 보안 고려사항

- ✅ 인증된 사용자만 업로드 가능
- ✅ 본인이 업로드한 파일만 삭제 가능
- ✅ Public 읽기 권한 (부동산 정보 공개용)
- ⚠️ 파일 크기 및 형식 검증 필요
- ⚠️ 악성 파일 업로드 방지 필요
