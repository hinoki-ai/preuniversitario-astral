import { Protect } from '@clerk/nextjs'
import CustomClerkPricing from "@/components/custom-clerk-pricing";

function UpgradeCard() {
  return (
    <>
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h1 className="text-center text-2xl font-semibold lg:text-3xl">Conviértete en Estudiante Iluminado</h1>
        <p>Esta página está disponible para estudiantes iluminados. Elige un plan que se ajuste a tus necesidades.</p>
      </div>
      <div className="px-8 lg:px-12">
        <CustomClerkPricing />
      </div>
    </>
  )
}


function FeaturesCard() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Características para Estudiantes Iluminados</h1>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Página con herramientas avanzadas</h2>
            <p className="text-muted-foreground">
              Acceso completo a todas las características avanzadas del centro preuniversitario.
            </p>
          </div>
        </div>
      </div>
    )
}


export default function PaymentGatedPage() {
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
      fallback={<UpgradeCard/>}
    >
      <FeaturesCard />
    </Protect>
  )
}
