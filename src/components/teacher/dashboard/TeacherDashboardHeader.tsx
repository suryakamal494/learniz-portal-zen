
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, Settings, Calendar, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TeacherProfileDropdown } from "./TeacherProfileDropdown"
import { Link } from "react-router-dom"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function TeacherDashboardHeader() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 border-b border-border/40 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden hover:bg-primary/10 transition-colors" />
          <div className="animate-fade-in">
            <h1 className="text-display-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Teacher Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/institute">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-emerald-50 transition-colors group"
                    >
                      <BarChart3 className="h-5 w-5 text-emerald-600 transition-transform group-hover:scale-110" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Academic Insights</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-blue-50 transition-colors group"
            >
              <Calendar className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-blue-50 transition-colors group"
            >
              <Bell className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs animate-pulse">
                3
              </Badge>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-blue-50 transition-colors group"
            >
              <Settings className="h-5 w-5 text-blue-600 transition-transform group-hover:rotate-90" />
            </Button>
            
            {/* Teacher Profile Dropdown */}
            <div className="ml-2">
              <TeacherProfileDropdown />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}