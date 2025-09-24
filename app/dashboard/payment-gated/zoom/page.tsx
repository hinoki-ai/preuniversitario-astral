import { Protect } from "@clerk/nextjs"
import ZoomDashboard from "@/components/zoom/ZoomDashboard"
import CustomClerkPricing from "@/components/custom-clerk-pricing"
import BasicSchedule from "@/components/zoom/BasicSchedule"

function UpgradeCard() {
  return (
    <>
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h1 className="text-center text-2xl font-semibold lg:text-3xl">Conviértete en Estudiante Iluminado</h1>
        <p>El aula de Zoom está disponible para estudiantes iluminados. Puedes ver la agenda básica a continuación.</p>
      </div>
      <div className="px-4 lg:px-12 max-w-3xl mx-auto">
        <div className="rounded-lg border bg-card p-6 space-y-4 mb-6">
          <div className="text-left">
            <div className="text-base font-semibold">Próximas clases</div>
            <div className="text-sm text-muted-foreground">La información de acceso se desbloquea al actualizar tu plan.</div>
          </div>
          <BasicSchedule />
        </div>
        <CustomClerkPricing />
      </div>
    </>
  )
}

export default function ZoomPaidPage() {
  const paidPlans = (process.env.NEXT_PUBLIC_CLERK_PAID_PLANS || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
  return (
    <Protect
      condition={(has) =>
        paidPlans.length > 0
          ? paidPlans.some((p) => has({ plan: p }))
          : !has({ plan: "free_user" })
      }
      fallback={<UpgradeCard />}
    >
      <div className="px-4 lg:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Aula en Vivo (Zoom)</h1>
        </div>
        <ZoomDashboard />
      </div>
    </Protect>
  )
}
