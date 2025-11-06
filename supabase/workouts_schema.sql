-- 운동 내역 테이블 생성
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 운동 정보 (모두 문자열)
  exercise_name TEXT NOT NULL,
  workout_date TEXT NOT NULL,  -- 날짜 (텍스트로 자유 입력 가능)
  body_part TEXT,              -- 운동 부위 (예: 가슴, 등, 어깨, 하체, 팔, 복근)
  weight TEXT,
  reps TEXT,
  sets TEXT,
  duration TEXT,               -- 운동 시간 (예: "45분", "1시간 30분")
  intensity TEXT,              -- 운동 강도 (예: 낮음, 보통, 높음)
  condition TEXT,              -- 컨디션 상태 (예: 좋음, 보통, 나쁨)
  next_goal TEXT,              -- 다음 목표
  notes TEXT,

  -- 사진
  photo_url_1 TEXT,
  photo_url_2 TEXT,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX workouts_user_id_idx ON workouts(user_id);
CREATE INDEX workouts_created_at_idx ON workouts(created_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 자신의 운동 내역만 조회 가능
CREATE POLICY "Users can view own workouts"
ON workouts FOR SELECT
USING (auth.uid() = user_id);

-- RLS 정책: 자신의 운동 내역만 생성 가능
CREATE POLICY "Users can create own workouts"
ON workouts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 자신의 운동 내역만 수정 가능
CREATE POLICY "Users can update own workouts"
ON workouts FOR UPDATE
USING (auth.uid() = user_id);

-- RLS 정책: 자신의 운동 내역만 삭제 가능
CREATE POLICY "Users can delete own workouts"
ON workouts FOR DELETE
USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workouts_updated_at
BEFORE UPDATE ON workouts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
