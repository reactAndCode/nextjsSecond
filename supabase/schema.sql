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

-- Properties 테이블 정책
-- 개발 단계: 모든 사용자가 모든 데이터를 볼 수 있음
CREATE POLICY "Enable read access for all users" ON properties
  FOR SELECT USING (true);

-- 인증된 사용자만 생성 가능
CREATE POLICY "Enable insert for authenticated users only" ON properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 자신의 데이터만 수정 가능
CREATE POLICY "Enable update for users based on user_id" ON properties
  FOR UPDATE USING (auth.uid() = user_id);

-- 자신의 데이터만 삭제 가능
CREATE POLICY "Enable delete for users based on user_id" ON properties
  FOR DELETE USING (auth.uid() = user_id);

-- Price History 테이블 정책
-- 모든 사용자가 가격 히스토리를 볼 수 있음
CREATE POLICY "Enable read access for all users" ON price_history
  FOR SELECT USING (true);

-- 부동산 소유자만 가격 히스토리 추가 가능
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
