"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Dumbbell, Utensils } from "lucide-react"
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
        <div className="md:hidden border-t absolute top-16 left-0 right-0 bg-background">
          <nav className="container mx-auto flex flex-col space-y-4 px-4 py-4">
            {isLoggedIn && (
              <>
                <Link
                  href="/meals"
                  className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Utensils className="h-4 w-4" />
                  식사관리
                </Link>
                <Link
                  href="/workouts"
                  className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Dumbbell className="h-4 w-4" />
                  나의운동내역
                </Link>
              </>
            )}
            <Link
              href="/properties"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              부동산정보
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/properties/new"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  부동산 등록
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  로그인
                </Link>
                <Button asChild className="w-full">
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
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
