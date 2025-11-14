"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Dumbbell, Utensils, Building2, LogIn, UserPlus } from "lucide-react"
import { useState } from "react"
import { LogoutButton } from "./LogoutButton"

type MobileMenuProps = {
  isLoggedIn: boolean
}

export function MobileMenu({ isLoggedIn }: MobileMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* 모바일 메뉴 버튼 */}
      <button
        className="md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* 모바일 네비게이션 */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t absolute top-16 left-0 right-0 bg-background shadow-lg">
          <nav className="container mx-auto flex flex-col space-y-3 px-4 py-4">
            {isLoggedIn && (
              <>
                <Link
                  href="/meals"
                  className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Utensils className="h-5 w-5" />
                  식사
                </Link>
                <Link
                  href="/workouts"
                  className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Dumbbell className="h-5 w-5" />
                  운동
                </Link>
                <Link
                  href="/properties"
                  className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building2 className="h-5 w-5" />
                  부동산
                </Link>
                <div className="pt-2 border-t">
                  <LogoutButton />
                </div>
              </>
            )}
            {!isLoggedIn && (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5" />
                  로그인
                </Link>
                <Button asChild className="w-full">
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    회원가입
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
