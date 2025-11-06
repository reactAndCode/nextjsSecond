import Link from "next/link"
import { HeroSection } from "@/components/layout/HeroSection"
import { Button } from "@/components/ui/button"
import { Building2, TrendingUp, Bell, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* 히어로 섹션 */}
      <HeroSection />

      {/* 주요 기능 섹션 */}
      <section className="w-full py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              강력한 기능들
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              부동산 관리에 필요한 모든 기능을 한 곳에서 제공합니다.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* 기능 1 */}
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">부동산 등록</h3>
              <p className="text-sm text-muted-foreground">
                관심 있는 부동산을 쉽게 등록하고 관리하세요. 사진, 가격, 상세 정보를 모두 기록할 수 있습니다.
              </p>
            </div>

            {/* 기능 2 */}
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">가격 추이</h3>
              <p className="text-sm text-muted-foreground">
                일자별 매매가격 변동을 그래프로 확인하고 실거래가 히스토리를 추적하세요.
              </p>
            </div>

            {/* 기능 3 */}
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">실시간 알림</h3>
              <p className="text-sm text-muted-foreground">
                관심 부동산의 가격 변동이나 새로운 정보가 업데이트되면 즉시 알려드립니다.
              </p>
            </div>

            {/* 기능 4 */}
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">안전한 관리</h3>
              <p className="text-sm text-muted-foreground">
                모든 데이터는 안전하게 암호화되어 저장되며 개인정보는 철저히 보호됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="w-full bg-muted/50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                지금 바로 시작하세요
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                무료로 가입하고 관심 부동산을 관리해보세요. 신용카드는 필요하지 않습니다.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/properties">부동산 둘러보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
