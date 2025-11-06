-- 식사 관리 테이블 생성
CREATE TABLE meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 식사 기본 정보 (모두 문자열)
  meal_datetime TEXT NOT NULL,      -- 식사 일시 (텍스트로 자유 입력 가능)
  meal_type TEXT,                   -- 식사 구분 (아침/점심/저녁/간식)
  food_name TEXT NOT NULL,          -- 음식명 (필수)

  -- 영양 정보 (모두 문자열로 자유 입력)
  total_calories TEXT,              -- 총 칼로리 (예: "500kcal", "500")
  carbs TEXT,                       -- 탄수화물 (예: "50g", "50")
  protein TEXT,                     -- 단백질 (예: "30g", "30")
  fat TEXT,                         -- 지방 (예: "20g", "20")

  -- 추가 정보
  serving_size TEXT,                -- 섭취량 (예: "1인분", "200g", "300ml")
  water_intake TEXT,                -- 물 섭취량 (예: "500ml", "2잔")

  -- 메모 및 사진
  notes TEXT,                       -- 메모
  photo_url_1 TEXT,                 -- 사진 1
  photo_url_2 TEXT,                 -- 사진 2

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX meals_user_id_idx ON meals(user_id);
CREATE INDEX meals_created_at_idx ON meals(created_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 자신의 식사 내역만 조회 가능
CREATE POLICY "Users can view own meals"
ON meals FOR SELECT
USING (auth.uid() = user_id);

-- RLS 정책: 자신의 식사 내역만 생성 가능
CREATE POLICY "Users can create own meals"
ON meals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 자신의 식사 내역만 수정 가능
CREATE POLICY "Users can update own meals"
ON meals FOR UPDATE
USING (auth.uid() = user_id);

-- RLS 정책: 자신의 식사 내역만 삭제 가능
CREATE POLICY "Users can delete own meals"
ON meals FOR DELETE
USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_meals_updated_at
BEFORE UPDATE ON meals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
