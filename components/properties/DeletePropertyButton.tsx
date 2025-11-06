"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteProperty } from "@/app/actions/properties"
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

type DeletePropertyButtonProps = {
  propertyId: string
  propertyName: string
}

export function DeletePropertyButton({ propertyId, propertyName }: DeletePropertyButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProperty(propertyId)

      if (result?.error) {
        toast.error('삭제 실패', {
          description: result.error
        })
        setOpen(false)
      } else if (result?.success) {
        setOpen(false)
        toast.success('부동산이 삭제되었습니다')
        router.push('/properties')
        router.refresh()
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>부동산을 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold">{propertyName}</span>을(를) 삭제합니다.
            <br />
            이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
