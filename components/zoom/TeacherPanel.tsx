"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api as generatedApi } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function TeacherPanel() {
  const api: any = generatedApi as any
  const user = useQuery(api.users.current, {})
  const isTeacher = user?.role === "teacher" || user?.role === "admin"
  const createMeeting = useMutation(api.meetings.create)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [start, setStart] = useState("") // datetime-local value
  const [meetingNumber, setMeetingNumber] = useState("")
  const [passcode, setPasscode] = useState("")
  const [published, setPublished] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!isTeacher) return null

  const handleSubmit = async () => {
    setError("")
    // Convert datetime-local string to epoch seconds
    const startTime = start ? Math.floor(new Date(start).getTime() / 1000) : 0
    if (!title || !meetingNumber || !passcode || !startTime) {
      setError("Completa todos los campos")
      return
    }
    setSubmitting(true)
    try {
      await createMeeting({
        title,
        description: description || undefined,
        startTime,
        meetingNumber: meetingNumber.replace(/\s/g, ""),
        passcode,
        published,
      })
      // Reset
      setTitle("")
      setDescription("")
      setStart("")
      setMeetingNumber("")
      setPasscode("")
      setPublished(true)
    } catch (e: any) {
      setError(e?.message || "No se pudo crear la clase")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div>
        <div className="text-base font-semibold">Panel Docente</div>
        <div className="text-sm text-muted-foreground">Crea una clase e ingresa un Meeting ID y Passcode de Zoom.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start">Fecha y hora</Label>
          <Input id="start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meetingNumber">Meeting ID</Label>
          <Input id="meetingNumber" value={meetingNumber} onChange={(e) => setMeetingNumber(e.target.value)} placeholder="123 4567 8901" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passcode">Passcode</Label>
          <Input id="passcode" value={passcode} onChange={(e) => setPasscode(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="published" checked={published} onCheckedChange={(v) => setPublished(!!v)} />
          <Label htmlFor="published">Publicada</Label>
        </div>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div>
        <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Guardando…" : "Crear Clase"}</Button>
      </div>
    </Card>
  )
}
