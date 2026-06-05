
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Users, Calendar, FileText } from 'lucide-react'

export default function ReportsMainPage() {
  const navigate = useNavigate()

  const reportTypes = [
    {
      id: 'attendance',
      title: 'Attendance Reports',
      description: 'View and manage student attendance records',
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      path: '/teacher/reports/attendance'
    },
    {
      id: 'section',
      title: 'Section Reports',
      description: 'Performance and analytics for each section',
      icon: <Users className="h-8 w-8 text-green-500" />,
      path: '/teacher/reports/batch'
    }
  ]

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and view various reports and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(report.path)}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {report.icon}
              </div>
              <CardTitle className="text-xl">{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center mb-4">{report.description}</p>
              <Button className="w-full" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">85%</div>
              <div className="text-sm text-muted-foreground">Average Attendance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-muted-foreground">Active Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">156</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
