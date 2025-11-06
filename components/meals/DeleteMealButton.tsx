"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteMeal } from "@/app/actions/meals"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

type DeleteMealButtonProps = {
  mealId: string
}

export function DeleteMealButton({ mealId }: DeleteMealButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMeal(mealId)

      if (result?.error) {
        toast.error('삭제 실패', {
          description: result.error
        })
        return
      }

      toast.success('식사 기록이 삭제되었습니다')
      setOpen(false)
      router.push('/meals')
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isPending}>
          <Trash2 className="h-4 w-4 mr-2" />
          삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>식사 기록을 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            이 작업은 되돌릴 수 없습니다. 식사 기록과 관련된 모든 정보가 영구적으로 삭제됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              '삭제'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
