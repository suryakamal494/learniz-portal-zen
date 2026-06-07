import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { CalendarIcon, Download, Search, Filter, RotateCcw, ArrowLeft } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { mockAttendanceData, getBatches, getClasses } from '@/data/mockAttendanceData'
import { AttendanceTable } from '@/components/teacher/reports/AttendanceTable'
import { getBatchById } from '@/lib/voiceCatalog'

export default function AttendancePage() {
  const navigate = useNavigate()
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [fromDateOpen, setFromDateOpen] = useState(false)
  const [toDateOpen, setToDateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const batches = getBatches()
  const classes = getClasses()

  // Show all reports by default, then filter based on user selection
  const filteredData = useMemo(() => {
    if (!hasSearched) return []
    
    return mockAttendanceData.filter(record => {
      const matchesClass = !selectedClass || selectedClass === 'all' || record.classTitle === selectedClass
      const matchesBatch = !selectedBatch || record.batch === selectedBatch
      const recordDate = new Date(record.date)
      const matchesFromDate = !fromDate || recordDate >= fromDate
      const matchesToDate = !toDate || recordDate <= toDate
      
      return matchesClass && matchesBatch && matchesFromDate && matchesToDate
    })
  }, [selectedClass, selectedBatch, fromDate, toDate, hasSearched])

  const handleSearch = () => {
    if (!selectedBatch) {
      alert('Please select a section to generate the report.')
      return
    }
    
    setIsLoading(true)
    setHasSearched(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleReset = () => {
    setSelectedClass('')
    setSelectedBatch('')
    setFromDate(undefined)
    setToDate(undefined)
    setHasSearched(false)
  }

  const handleExportAll = () => {
    console.log('Exporting all attendance data...')
    // Implement export functionality
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/teacher">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/teacher/reports">Reports</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Attendance</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Attendance Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and analyze student attendance patterns across all your classes
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleExportAll} 
              variant="outline" 
              className="glass border-border/40"
              disabled={!hasSearched || filteredData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Button 
              onClick={() => navigate('/teacher/reports')} 
              variant="ghost"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-blue-500" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Class Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="glass border-border/40">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Batch Filter (Required) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1">
                  Section
                  <span className="text-red-500 text-xs">*required</span>
                </label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className={cn(
                    "glass border-border/40",
                    !selectedBatch && "border-red-200 focus:border-red-400"
                  )}>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* From Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">From Date</label>
                <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal glass border-border/40",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass border-border/40" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={(date) => {
                        setFromDate(date)
                        setFromDateOpen(false)
                      }}
                      className="p-3 pointer-events-auto"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">To Date</label>
                <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal glass border-border/40",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass border-border/40" align="end">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={(date) => {
                        setToDate(date)
                        setToDateOpen(false)
                      }}
                      className="p-3 pointer-events-auto"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isLoading}
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Generating...' : 'Generate Report'}
              </Button>
              <Button 
                onClick={handleReset} 
                variant="outline"
                className="glass border-border/40"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="glass border-border/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Attendance Records</CardTitle>
              {hasSearched && !isLoading && (
                <div className="text-sm text-muted-foreground">
                  {filteredData.length} record{filteredData.length !== 1 ? 's' : ''} found
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AttendanceTable data={filteredData} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
