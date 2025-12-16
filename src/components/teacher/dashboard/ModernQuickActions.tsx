
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { Plus, BookOpen, Calendar, FileText, Video } from "lucide-react"

const quickActions = [
  {
    title: "Create Exam",
    subtitle: "Design assessments",
    icon: FileText,
    path: "/teacher/exams/create",
    gradient: "bg-gradient-to-br from-blue-50 to-blue-100",
    iconBg: "bg-blue-500",
    hoverGradient: "hover:from-blue-100 hover:to-blue-200",
    textColor: "text-blue-900",
    subtitleColor: "text-blue-700"
  },
  {
    title: "Schedule Class", 
    subtitle: "Plan sessions",
    icon: Calendar,
    path: "/teacher/classroom/schedule/create",
    gradient: "bg-gradient-to-br from-emerald-50 to-teal-100",
    iconBg: "bg-emerald-500",
    hoverGradient: "hover:from-emerald-100 hover:to-teal-200",
    textColor: "text-emerald-900",
    subtitleColor: "text-emerald-700"
  },
  {
    title: "Add Content",
    subtitle: "Create materials",
    icon: BookOpen,
    path: "/teacher/lms/content/create",
    gradient: "bg-gradient-to-br from-purple-50 to-indigo-100",
    iconBg: "bg-purple-500",
    hoverGradient: "hover:from-purple-100 hover:to-indigo-200",
    textColor: "text-purple-900",
    subtitleColor: "text-purple-700"
  },
  {
    title: "Create Series",
    subtitle: "Build courses",
    icon: Video,
    path: "/teacher/lms/series/create",
    gradient: "bg-gradient-to-br from-orange-50 to-red-100",
    iconBg: "bg-orange-500",
    hoverGradient: "hover:from-orange-100 hover:to-red-200",
    textColor: "text-orange-900",
    subtitleColor: "text-orange-700"
  }
]

export function ModernQuickActions() {
  const navigate = useNavigate()

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={action.title}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-0 ${action.gradient} ${action.hoverGradient} group animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className={`w-14 h-14 ${action.iconBg} rounded-xl flex items-center justify-center mx-auto shadow-md group-hover:shadow-lg transition-shadow`}>
                  <action.icon className="h-7 w-7 text-white" />
                </div>
                
                <div className="space-y-1">
                  <h3 className={`font-semibold text-base ${action.textColor}`}>
                    {action.title}
                  </h3>
                  <p className={`text-sm ${action.subtitleColor}`}>
                    {action.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
