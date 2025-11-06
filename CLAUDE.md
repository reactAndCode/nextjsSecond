# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

**My Awesome Real Estate Site** - Next.js 16 기반의 부동산 관리 시스템입니다.
사용자가 관심 부동산을 등록/관리하고, 일자별 매매가격 추이와 각종 정보를 쉽게 확인할 수 있는 개인화된 웹앱입니다.

### 기술 스택
- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **UI 라이브러리**: React 19
- **스타일링**: Tailwind CSS v4
- **UI 컴포넌트**: shadcn/ui (ui.shadcn.com 참고)
- **데이터베이스 & 인증**: Supabase (DB + Auth + Storage)
- **타겟**: 모바일 우선 반응형 UI

## 주요 명령어

### 개발
- `npm run dev` - 개발 서버 시작 (http://localhost:3000)
- `npm run build` - 프로덕션 빌드 생성
- `npm start` - 프로덕션 서버 시작
- `npm run lint` - ESLint 실행

## 아키텍처

### 프레임워크 & 라우팅
- **Next.js 16** App Router 사용 (Pages Router 아님)
- `app/` 디렉토리 내 폴더 구조로 라우트 정의
- 각 라우트는 다음을 포함할 수 있음:
  - `page.tsx` - 라우트의 UI
  - `layout.tsx` - 라우트 세그먼트의 공유 UI
  - `loading.tsx` - 로딩 UI
  - `error.tsx` - 에러 UI

### TypeScript 설정
- Path alias `@/*`는 루트 디렉토리에 매핑
- Strict 모드 활성화
- React 19의 `react-jsx` transform 사용 (React import 불필요)
- Module resolution: bundler (Next.js가 번들링 처리)

### 스타일링
- **Tailwind CSS v4** with PostCSS
- 전역 스타일: `app/globals.css`
- Geist Sans 및 Geist Mono 폰트 사용 (`next/font/google`)
- 다크모드: `dark:` 클래스 variant 지원

### ESLint 설정
- Next.js TypeScript 및 Core Web Vitals 권장 설정 사용
- 무시 대상: `.next/`, `out/`, `build/`, `next-env.d.ts`
- 설정 파일: `eslint.config.mjs` (flat config 형식)

## 프로젝트 구조

```
app/
  layout.tsx          - 루트 레이아웃 (폰트, 메타데이터)
  page.tsx            - 홈 페이지
  globals.css         - 전역 Tailwind 스타일
  (auth)/             - 인증 관련 페이지 (로그인, 회원가입)
  properties/         - 부동산 정보 페이지
components/
  ui/                 - shadcn/ui 컴포넌트
  layout/             - 레이아웃 컴포넌트 (Header, Footer)
  properties/         - 부동산 관련 컴포넌트
lib/
  supabase/           - Supabase 클라이언트 설정
  utils.ts            - 유틸리티 함수
types/
  property.ts         - 부동산 관련 타입 정의
public/               - 정적 자산 (이미지, SVG)
```

## 개발 가이드라인

### 레이어 아키텍처
- **UI Layer**: React 컴포넌트 (`components/`)
- **Service Layer**: 비즈니스 로직 (`lib/services/`)
- **Controller Layer**: API 라우트 핸들러 (`app/api/`)
- **Data Layer**: Supabase 클라이언트 (`lib/supabase/`)

컴포넌트는 재사용 가능하도록 역할별로 분리하여 작성합니다.

### Next.js App Router 패턴
- **Server Components가 기본**: 클라이언트 인터랙티비티, 훅, 브라우저 API가 필요한 경우에만 `"use client"` 지시어 사용
- Server Components는 async 함수로 작성 가능하며 직접 데이터 페칭 가능
- Client Components는 컴포넌트 트리의 말단(leaf)에 배치
- 이미지 최적화: `next/image` 사용
- 메타데이터는 `layout.tsx` 또는 `page.tsx`에서 export

### TypeScript
- TSX 파일에서 React import 불필요 (JSX transform이 자동 처리)
- 컴포넌트 props 및 타입 별칭에는 `type` 사용
- Next.js 타입은 `next` 패키지 및 자동 생성된 `next-env.d.ts`에서 제공

### Tailwind CSS v4
- PostCSS 플러그인 사용 (전통적인 config 파일 없음)
- 표준 Tailwind 유틸리티 클래스 사용
- 스타일링에 `className` prop 사용 (`class` 아님)

## 부동산 관리 시스템 핵심 기능

### 1. 관심 부동산 등록/관리
**필수 정보**:
- 아파트명, 지역명, 총세대수, 면적, 평형, 층수
- 등록일자, 매매가격, 최근 실거래가격

**선택 정보**:
- 관리비, 방수, 욕실수, 방향
- 중개사명, 중개사 연락처
- 매물 설명
- 사진 2장 (Supabase Storage 연동)

**UX 요구사항**:
- 직관적인 입력 폼 UI
- 중복 등록 방지
- 모바일 우선 반응형 디자인

### 2. 부동산 가격 추이 정보
- 일자별 가격 데이터 시각화 (그래프)
- 부동산별 세부 정보 및 실거래가 히스토리 제공

### 3. 사용자 인증
- Supabase Auth 사용 (이메일 기반)
- 개발 단계: 모든 등록 내역 조회/관리 가능
- 향후: 인증된 사용자만 관심 부동산 관리 가능

### 4. API 설계
- RESTful API (부동산 CRUD, 가격 이력 조회)
- Service/Controller/Handler 레이어 분리
- API Routes: `app/api/` 디렉토리

## Supabase 테이블 설계

### users
- Supabase Auth 기본 테이블 사용

### properties (관심 부동산)
- id, user_id, name, region, total_households
- area, pyeong, floor, registered_date
- sale_price, recent_transaction_price
- management_fee, rooms, bathrooms, direction
- agent_name, agent_contact
- description
- photo_url_1, photo_url_2
- created_at, updated_at

### price_history (가격 이력)
- id, property_id, date, price
- transaction_type (매매/전세/월세)
- created_at

## 중요 지침

1. **컴포넌트 재사용성**: UI/Service/Controller 역할을 명확히 분리
2. **모바일 우선**: 모든 UI는 모바일에서 먼저 테스트
3. **타입 안정성**: 모든 데이터 구조에 TypeScript 타입 정의
4. **에러 처리**: API 호출 및 사용자 입력에 대한 적절한 에러 처리
5. **이미지 최적화**: next/image 사용 및 Supabase Storage 활용
6. **보안**: 환경 변수로 Supabase 키 관리, SQL Injection 방지
7. **성능**: Server Components 우선 사용, 클라이언트 컴포넌트 최소화

## 성공 지표 (KPI)
- 사용자의 관심 부동산 최초 등록률
- 1주일 내 로그인/접속 유지율
- 평균 등록 부동산 수
- 가격 추이 그래프 열람 비율
