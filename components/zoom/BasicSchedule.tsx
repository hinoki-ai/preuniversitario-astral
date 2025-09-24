"use client"

import { useMemo } from "react"
import { useQuery } from "convex/react"
import { api as generatedApi } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type MeetingItem = {
  _id: string
  title: string
  description?: string
  startTime: number
  published: boolean
  meetingNumber?: string
  passcode?: string
}

export default function BasicSchedule({ onPick }: { onPick?: (m: MeetingItem) => void }) {
  const api: any = generatedApi as any
  const meetings = useQuery(api.meetings.listUpcoming, {})

  const items = useMemo(() => meetings ?? [], [meetings])

  if (!meetings) {
    return (
      <Card className="p-4">Cargando agenda…</Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="p-4">No hay clases programadas por ahora.</Card>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((m) => {
        const dt = new Date(m.startTime * 1000)
        const canJoin = !!m.meetingNumber && !!m.passcode
        return (
          <Card key={m._id} className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-medium">{m.title}</div>
              <div className="text-sm text-muted-foreground">{dt.toLocaleString()}</div>
            </div>
            {onPick && (
              <Button variant={canJoin ? "default" : "outline"} disabled={!canJoin} onClick={() => onPick(m)}>
                {canJoin ? "Usar en el formulario" : "Solo para iluminados"}
              </Button>
            )}
          </Card>
        )
      })}
    </div>
  )
}
