import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { AppSidebar } from '@/app/dashboard/AppSidebar';
import { LoadingBar } from '@/app/dashboard/LoadingBar';
import { SiteHeader } from '@/app/dashboard/SiteHeader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

function AuthRequiredMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Acceso requerido</h1>
        <p className="text-muted-foreground">Debes iniciar sesión para acceder al dashboard.</p>
        <SignInButton>
          <Button>Iniciar Sesión</Button>
        </SignInButton>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <SidebarProvider
          style={
            {
              '--sidebar-width': '18rem', // Fixed width instead of calc
              '--sidebar-width-icon': '3rem', // Icon width for collapsed state
              '--header-height': '3rem', // Consistent header height
            } as React.CSSProperties
          }
          className="group/layout min-h-screen"
        >
          <AppSidebar variant="sidebar" />
          <SidebarInset className="flex flex-col min-h-screen">
            <LoadingBar />
            <SiteHeader />
            <div className="flex flex-1 flex-col overflow-hidden">
              <main className="flex-1 overflow-auto">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                  {children}
                </div>
              </main>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </SignedIn>
      <SignedOut>
        <AuthRequiredMessage />
      </SignedOut>
    </>
  );
}
