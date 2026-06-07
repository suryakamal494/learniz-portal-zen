
import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { BarChart3, Users } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BatchReportFilters } from '@/types/batchReport'
import { mockBatchExamReports } from '@/data/mockBatchReports'
import { ReportFilters } from '@/components/teacher/reports/ReportFilters'
import { ExamReportsTable } from '@/components/teacher/reports/ExamReportsTable'
import { format, isAfter, isBefore } from 'date-fns'

const ITEMS_PER_PAGE = 10

export default function BatchReportsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<BatchReportFilters>(() => {
    const batchSlug = searchParams.get('batch')
    return batchSlug ? { batchId: batchSlug } : {}
  })
  const [currentPage, setCurrentPage] = useState(1)

  const filteredReports = useMemo(() => {
    let filtered = [...mockBatchExamReports]

    // Filter by batch
    if (filters.batchId) {
      filtered = filtered.filter(report => report.batchId === filters.batchId)
    }

    // Filter by date range
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.date)
        
        if (filters.dateRange?.from && isBefore(reportDate, filters.dateRange.from)) {
          return false
        }
        
        if (filters.dateRange?.to && isAfter(reportDate, filters.dateRange.to)) {
          return false
        }
        
        return true
      })
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [filters])

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleViewReport = (examId: string, batchId: string) => {
    navigate(`/teacher/reports/batch/${batchId}/exam/${examId}`)
  }

  const handleFiltersChange = (newFilters: BatchReportFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Section Reports</h1>
          <p className="text-muted-foreground">Comprehensive performance analytics for each section</p>
        </div>
        <Button onClick={() => navigate('/teacher/reports')}>
          Back to Reports
        </Button>
      </div>

      {/* Filters */}
      <ReportFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredReports.length > 0 
                ? `${(filteredReports.reduce((sum, report) => sum + report.averagePerformance, 0) / filteredReports.length).toFixed(1)}%`
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Pass Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredReports.length > 0 
                ? `${(filteredReports.reduce((sum, report) => sum + report.passPercentage, 0) / filteredReports.length).toFixed(1)}%`
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredReports.reduce((sum, report) => sum + report.totalStudents, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedReports.length > 0 ? (
            <>
              <ExamReportsTable 
                reports={paginatedReports}
                onViewReport={handleViewReport}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) handlePageChange(currentPage - 1)
                          }}
                          className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(page)
                            }}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages) handlePageChange(currentPage + 1)
                          }}
                          className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
