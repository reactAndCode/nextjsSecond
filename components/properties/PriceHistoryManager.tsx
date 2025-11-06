"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addPriceHistory, deletePriceHistory } from "@/app/actions/price-history"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Plus, Loader2 } from "lucide-react"
import type { PriceHistory } from "@/types/property"
import { toast } from "sonner"

type PriceHistoryManagerProps = {
  propertyId: string
  priceHistory: PriceHistory[]
  isOwner: boolean
}

export function PriceHistoryManager({ propertyId, priceHistory, isOwner }: PriceHistoryManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    price: '',
    transaction_type: 'sale',
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    data.append('property_id', propertyId)

    startTransition(async () => {
      const result = await addPriceHistory(data)

      if (result?.error) {
        toast.error('추가 실패', {
          description: result.error
        })
      } else if (result?.success) {
        setShowForm(false)
        setFormData({
          date: new Date().toISOString().split('T')[0],
          price: '',
          transaction_type: 'sale',
        })
        toast.success('가격 이력이 추가되었습니다')
        router.refresh()
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('이 가격 이력을 삭제하시겠습니까?')) return

    startTransition(async () => {
      const result = await deletePriceHistory(id, propertyId)

      if (result?.error) {
        toast.error('삭제 실패', {
          description: result.error
        })
      } else if (result?.success) {
        toast.success('가격 이력이 삭제되었습니다')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      {isOwner && (
        <>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              가격 이력 추가
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>가격 이력 추가</CardTitle>
                <CardDescription>새로운 가격 정보를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="date">날짜 *</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">가격(천만원 단위) *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.1"
                        placeholder="127"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transaction_type">거래 유형 *</Label>
                      <Select
                        name="transaction_type"
                        value={formData.transaction_type}
                        onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}
                        disabled={isPending}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">매매</SelectItem>
                          <SelectItem value="jeonse">전세</SelectItem>
                          <SelectItem value="monthly">월세</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      disabled={isPending}
                    >
                      취소
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          추가 중...
                        </>
                      ) : (
                        '추가'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {priceHistory && priceHistory.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>가격 이력</CardTitle>
            <CardDescription>등록된 가격 변동 내역입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>거래 유형</TableHead>
                  <TableHead className="text-right">가격</TableHead>
                  {isOwner && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistory.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>
                      {new Date(history.date).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      {history.transaction_type === 'sale' && '매매'}
                      {history.transaction_type === 'jeonse' && '전세'}
                      {history.transaction_type === 'monthly' && '월세'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(history.price / 100000000).toFixed(1)}억원
                    </TableCell>
                    {isOwner && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(history.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              가격 이력이 없습니다.
              {isOwner && ' 첫 가격 이력을 추가해주세요.'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
