import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Dumbbell, Utensils } from "lucide-react"
import { getUser } from "@/app/actions/auth"
import { LogoutButton } from "./LogoutButton"
import { MobileMenu } from "./MobileMenu"

export async function Header() {
  const user = await getUser()
  const isLoggedIn = !!user

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center space-x-2">
          <Building2 className="h-6 w-6" />
          <span className="text-xl font-bold hidden sm:inline">My Awesome </span>
          <span className="text-xl font-bold sm:hidden">MARE</span>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden md:flex items-center space-x-6">
          {isLoggedIn && (
            <>
              <Link
                href="/meals"
                className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
              >
                <Utensils className="h-4 w-4" />
                식사
              </Link>
              <Link
                href="/workouts"
                className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
              >
                <Dumbbell className="h-4 w-4" />
                운동
              </Link>
              <Link
                href="/properties"
                className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
              >
                <Building2 className="h-4 w-4" />
                부동산
              </Link>
            </>
          )}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{user.email?.substring(0, 5)}...</span>
              <LogoutButton />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                로그인
              </Link>
              <Button asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </>
          )}
        </nav>

        {/* 모바일 메뉴 */}
        <MobileMenu isLoggedIn={isLoggedIn} />
      </div>
    </header>
  )
}
