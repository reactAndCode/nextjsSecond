# Supabase 테이블 생성 가이드

## 빠른 시작

### 1. Supabase 대시보드 접속
- URL: https://supabase.com/dashboard
- 프로젝트: `uizoxtnvqisiicvcxgty`

### 2. SQL Editor에서 테이블 생성

1. 왼쪽 메뉴 > **SQL Editor** 클릭
2. **New query** 버튼 클릭
3. 아래 전체 SQL을 복사하여 붙여넣기
4. **Run** 버튼 클릭 (Ctrl/Cmd + Enter)

```sql
-- 부동산 테이블
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  total_households INTEGER,
  area DECIMAL(10, 2) NOT NULL,
  pyeong DECIMAL(10, 2) NOT NULL,
  floor INTEGER,
  registered_date DATE NOT NULL,
  sale_price DECIMAL(15, 2) NOT NULL,
  recent_transaction_price DECIMAL(15, 2),
  management_fee DECIMAL(10, 2),
  rooms INTEGER,
  bathrooms INTEGER,
  direction TEXT,
  agent_name TEXT,
  agent_contact TEXT,
  description TEXT,
  photo_url_1 TEXT,
  photo_url_2 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 가격 히스토리 테이블
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('sale', 'jeonse', 'monthly')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS properties_user_id_idx ON properties(user_id);
CREATE INDEX IF NOT EXISTS properties_region_idx ON properties(region);
CREATE INDEX IF NOT EXISTS price_history_property_id_idx ON price_history(property_id);
CREATE INDEX IF NOT EXISTS price_history_date_idx ON price_history(date);

-- RLS (Row Level Security) 활성화
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Properties 테이블 정책 (개발 단계: 모든 사용자가 데이터 조회 가능)
CREATE POLICY "Enable read access for all users" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON properties
  FOR DELETE USING (auth.uid() = user_id);

-- Price History 테이블 정책
CREATE POLICY "Enable read access for all users" ON price_history
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for property owners" ON price_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = price_history.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. 테이블 생성 확인

왼쪽 메뉴 > **Table Editor** 클릭하여 다음 테이블이 생성되었는지 확인:
- ✅ `properties` (부동산 정보)
- ✅ `price_history` (가격 이력)

## 테이블 구조

### properties (부동산 정보)
| 컬럼명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| id | UUID | 고유 ID | ✅ |
| user_id | UUID | 사용자 ID | ✅ |
| name | TEXT | 아파트명 | ✅ |
| region | TEXT | 지역명 | ✅ |
| total_households | INTEGER | 총세대수 | ❌ |
| area | DECIMAL | 면적(㎡) | ✅ |
| pyeong | DECIMAL | 평형 | ✅ |
| floor | INTEGER | 층수 | ❌ |
| registered_date | DATE | 등록일자 | ✅ |
| sale_price | DECIMAL | 매매가격 | ✅ |
| recent_transaction_price | DECIMAL | 최근 실거래가 | ❌ |
| management_fee | DECIMAL | 관리비 | ❌ |
| rooms | INTEGER | 방수 | ❌ |
| bathrooms | INTEGER | 욕실수 | ❌ |
| direction | TEXT | 방향 | ❌ |
| agent_name | TEXT | 중개사명 | ❌ |
| agent_contact | TEXT | 중개사 연락처 | ❌ |
| description | TEXT | 매물 설명 | ❌ |
| photo_url_1 | TEXT | 사진1 URL | ❌ |
| photo_url_2 | TEXT | 사진2 URL | ❌ |
| created_at | TIMESTAMP | 생성일시 | ✅ |
| updated_at | TIMESTAMP | 수정일시 | ✅ |

### price_history (가격 이력)
| 컬럼명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| id | UUID | 고유 ID | ✅ |
| property_id | UUID | 부동산 ID | ✅ |
| date | DATE | 날짜 | ✅ |
| price | DECIMAL | 가격 | ✅ |
| transaction_type | TEXT | 거래유형 (sale/jeonse/monthly) | ✅ |
| created_at | TIMESTAMP | 생성일시 | ✅ |

## Row Level Security (RLS) 정책

### Properties 테이블
- **조회**: 모든 사용자 가능 (개발 단계)
- **생성**: 인증된 사용자만 가능
- **수정**: 본인이 등록한 부동산만 수정 가능
- **삭제**: 본인이 등록한 부동산만 삭제 가능

### Price History 테이블
- **조회**: 모든 사용자 가능
- **생성**: 부동산 소유자만 가능

## 테스트 데이터 추가 (선택사항)

테이블 생성 후 테스트 데이터를 추가하려면:

```sql
-- 먼저 자신의 user_id 확인
SELECT id, email FROM auth.users;

-- 부동산 테스트 데이터 추가 (user_id를 실제 값으로 변경)
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
  'YOUR-USER-ID-HERE',
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
```

## 문제 해결

### 오류: "permission denied for schema public"
- Supabase 프로젝트의 권한 설정 확인
- 프로젝트 소유자 계정으로 로그인했는지 확인

### 오류: "relation already exists"
- 테이블이 이미 생성되어 있음
- Table Editor에서 확인하거나 `DROP TABLE` 후 재생성

### RLS 정책 오류
- SQL Editor에서 정책 확인:
  ```sql
  SELECT * FROM pg_policies WHERE tablename IN ('properties', 'price_history');
  ```

## 다음 단계

테이블 생성 완료 후:
1. ✅ 부동산 등록 폼 구현
2. ✅ 부동산 목록 조회
3. ✅ 부동산 상세 페이지
4. ✅ 가격 추이 그래프
