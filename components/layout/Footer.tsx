import Link from "next/link"
import { Building2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 브랜드 정보 */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span className="font-bold">My Awesome Real Estate</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              관심 부동산을 쉽게 관리하고 가격 추이를 확인하세요.
            </p>
          </div>

          {/* 서비스 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">서비스</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/properties"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  부동산 정보
                </Link>
              </li>
              <li>
                <Link
                  href="/price-trend"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  가격 추이
                </Link>
              </li>
            </ul>
          </div>

          {/* 계정 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">계정</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  로그인
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  회원가입
                </Link>
              </li>
            </ul>
          </div>

          {/* 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">정보</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  소개
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  문의
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} My Awesome Real Estate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
