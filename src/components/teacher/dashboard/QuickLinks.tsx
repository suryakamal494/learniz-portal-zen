
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { Plus, BookOpen, Calendar, FileText, Video } from "lucide-react"

const quickLinks = [
  {
    title: "Assessment",
    icon: FileText,
    path: "/teacher/exams/create",
    color: "bg-gradient-to-br from-blue-500 to-blue-600"
  },
  {
    title: "Class",
    icon: Calendar,
    path: "/teacher/schedule/create",
    color: "bg-gradient-to-br from-green-500 to-green-600"
  },
  {
    title: "Lesson Material",
    icon: BookOpen,
    path: "/teacher/lms/content/create",
    color: "bg-gradient-to-br from-purple-500 to-purple-600"
  },
  {
    title: "Lesson Plan",
    icon: Video,
    path: "/teacher/lms/series/create",
    color: "bg-gradient-to-br from-orange-500 to-orange-600"
  }
]

export function QuickLinks() {
  const navigate = useNavigate()

  return (
    <Card className="border-border/50 shadow-premium backdrop-blur-sm bg-card/95">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {quickLinks.map((link, index) => (
            <Button
              key={link.title}
              onClick={() => navigate(link.path)}
              className="h-auto p-4 flex-col gap-3 hover:scale-105 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              variant="outline"
            >
              <div className={`p-3 rounded-xl ${link.color} shadow-modern group-hover:shadow-modern-lg transition-all duration-300`}>
                <link.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Plus className="h-3 w-3" />
                  <span>{link.title}</span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
