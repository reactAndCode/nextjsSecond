import Link from "next/link"
import { Building2, Utensils, Dumbbell } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 브랜드 정보 */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span className="font-bold">My Awesome</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              식사, 운동, 부동산 정보를 한 곳에서 관리하세요.
            </p>
          </div>

          {/* 식사 관리 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1">
              <Utensils className="h-4 w-4" />
              식사 관리
            </h3>
            <p className="text-xs text-muted-foreground">
              영양 정보를 기록하고 식습관을 개선하세요.
            </p>
            <Link
              href="/meals"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground inline-block"
            >
              식사 기록 →
            </Link>
          </div>

          {/* 운동 기록 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              운동 기록
            </h3>
            <p className="text-xs text-muted-foreground">
              운동 내역을 추적하고 목표를 달성하세요.
            </p>
            <Link
              href="/workouts"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground inline-block"
            >
              운동 기록 →
            </Link>
          </div>

          {/* 부동산 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              부동산 정보
            </h3>
            <p className="text-xs text-muted-foreground">
              관심 매물을 저장하고 가격 추이를 확인하세요.
            </p>
            <Link
              href="/properties"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground inline-block"
            >
              부동산 보기 →
            </Link>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} My Awesome. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
