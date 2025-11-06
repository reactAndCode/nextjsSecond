import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Search } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-background to-muted/20">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop"
          alt="부동산 배경"
          fill
          className="object-cover opacity-10"
          priority
        />
      </div>

      {/* 컨텐츠 */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* 좌측 텍스트 영역 */}
          <div className="space-y-6">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              부동산 관리의 새로운 기준
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              관심 부동산을
              <br />
              <span className="text-primary">한눈에</span> 관리하세요
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
              부동산 정보를 등록하고, 실시간 가격 추이를 확인하며, 스마트한 투자 결정을 내리세요.
              모든 정보를 한 곳에서 관리할 수 있습니다.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">
                  시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/properties">
                  <Search className="mr-2 h-4 w-4" />
                  부동산 둘러보기
                </Link>
              </Button>
            </div>
          </div>

          {/* 우측 이미지 영역 */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-background shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop"
                alt="현대적인 아파트"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* 장식 요소 */}
            <div className="absolute -bottom-4 -right-4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -top-4 -left-4 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          <div className="space-y-2 rounded-lg border bg-background/50 p-4 backdrop-blur">
            <p className="text-2xl font-bold md:text-3xl">1,000+</p>
            <p className="text-sm text-muted-foreground">등록된 부동산</p>
          </div>
          <div className="space-y-2 rounded-lg border bg-background/50 p-4 backdrop-blur">
            <p className="text-2xl font-bold md:text-3xl">500+</p>
            <p className="text-sm text-muted-foreground">활성 사용자</p>
          </div>
          <div className="space-y-2 rounded-lg border bg-background/50 p-4 backdrop-blur">
            <p className="text-2xl font-bold md:text-3xl">10K+</p>
            <p className="text-sm text-muted-foreground">가격 데이터</p>
          </div>
          <div className="space-y-2 rounded-lg border bg-background/50 p-4 backdrop-blur">
            <p className="text-2xl font-bold md:text-3xl">98%</p>
            <p className="text-sm text-muted-foreground">만족도</p>
          </div>
        </div>
      </div>
    </section>
  )
}
