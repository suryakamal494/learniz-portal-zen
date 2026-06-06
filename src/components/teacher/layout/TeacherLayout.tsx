
import { SidebarProvider } from "@/components/ui/sidebar"
import { TeacherSidebar } from "../TeacherSidebar"
import { VoiceCommandFAB } from "../voice/VoiceCommandFAB"
import { Toaster } from "@/components/ui/sonner"

interface TeacherLayoutProps {
  children: React.ReactNode
}

export function TeacherLayout({ children }: TeacherLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <TeacherSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <VoiceCommandFAB />
        <Toaster position="top-right" richColors />
      </div>
    </SidebarProvider>
  )
}
