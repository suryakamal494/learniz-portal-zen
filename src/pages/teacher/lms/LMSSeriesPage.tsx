
import React, { useEffect, useState, useMemo } from 'react'
import { Plus, Search, Filter, Download, FileText, Eye, Edit, Settings, BookOpen } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { TeacherDataWrapper } from '@/components/teacher/ui/TeacherDataWrapper'
import { mockLMSSeries, mockSubtopics } from '@/data/mockLMSSeries'
import { mockLMSContent } from '@/data/mockLMSContent'
import { LMSSeries, LMSSeriesFilters, LMSSeriesType } from '@/types/lmsSeries'
import { getSubjectById, getChapterById } from '@/lib/voiceCatalog'

const LMSSeriesPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<LMSSeriesFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

  // Voice-nav: hydrate subject/chapter filter from URL slugs once
  useEffect(() => {
    const subjSlug = searchParams.get('subject')
    const chSlug = searchParams.get('chapter')
    const next: LMSSeriesFilters = {}
    if (subjSlug) {
      const name = getSubjectById(subjSlug)?.name
      if (name && mockLMSSeries.some(s => s.subject === name)) next.subject = name
    }
    if (chSlug) {
      const name = getChapterById(chSlug)?.name
      if (name && mockLMSSeries.some(s => s.chapter === name)) next.chapter = name
    }
    if (Object.keys(next).length) setFilters(prev => ({ ...prev, ...next }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get unique filter options from data
  const filterOptions = useMemo(() => {
    const institutes = [...new Set(mockLMSSeries.map(series => series.institute))]
    const subjects = filters.institute 
      ? [...new Set(mockLMSSeries.filter(s => s.institute === filters.institute).map(s => s.subject))]
      : [...new Set(mockLMSSeries.map(series => series.subject))]
    const chapters = filters.subject 
      ? [...new Set(mockLMSSeries.filter(s => s.subject === filters.subject).map(s => s.chapter))]
      : [...new Set(mockLMSSeries.map(series => series.chapter))]
    const topics = filters.chapter
      ? [...new Set(mockLMSSeries.filter(s => s.chapter === filters.chapter).map(s => s.topic))]
      : [...new Set(mockLMSSeries.map(series => series.topic))]
    const subtopics = filters.topic
      ? mockSubtopics.filter(st => mockLMSSeries.some(s => s.topic === filters.topic && s.subtopic === st.name))
      : mockSubtopics

    return { institutes, subjects, chapters, topics, subtopics }
  }, [filters.institute, filters.subject, filters.chapter, filters.topic])

  // Filter and search series data
  const filteredSeries = useMemo(() => {
    return mockLMSSeries.filter(series => {
      if (filters.institute && series.institute !== filters.institute) return false
      if (filters.subject && series.subject !== filters.subject) return false
      if (filters.chapter && series.chapter !== filters.chapter) return false
      if (filters.topic && series.topic !== filters.topic) return false
      if (filters.subtopic && series.subtopic !== filters.subtopic) return false
      if (filters.type && series.type !== filters.type) return false
      if (searchQuery && !series.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [filters, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredSeries.length / pageSize)
  const paginatedSeries = filteredSeries.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleFilterChange = (key: keyof LMSSeriesFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
    setCurrentPage(1)
  }

  const handleReset = () => {
    setFilters({})
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleSearch = () => {
    // Search is already applied through useMemo, this is just for UI feedback
    console.log('Search triggered:', searchQuery)
    setCurrentPage(1)
  }

  const handleSeriesAction = (seriesId: string, action: string) => {
    switch (action) {
      case 'preview':
        navigate(`/teacher/lms/series/${seriesId}/preview`)
        break
      case 'update':
        navigate(`/teacher/lms/series/${seriesId}/update`)
        break
      case 'update-exam':
        navigate(`/teacher/lms/series/${seriesId}/update-order`)
        break
      case 'update-course':
        console.log('Update course for series:', seriesId)
        // Add update course logic here
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  const getSeriesTypeColor = (type: LMSSeriesType) => {
    const colors = {
      'content-series': 'bg-blue-100 text-blue-800 border-blue-200',
      'video-series': 'bg-purple-100 text-purple-800 border-purple-200',
      'assignment-series': 'bg-green-100 text-green-800 border-green-200',
      'quiz-series': 'bg-orange-100 text-orange-800 border-orange-200',
      'exam-series': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatSeriesType = (type: LMSSeriesType) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Lesson Plans</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your lesson plans</p>
        </div>
        <Button 
          onClick={() => navigate('/teacher/lms/series/create')}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Lesson Plan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
            <Select value={filters.institute || 'all'} onValueChange={(value) => handleFilterChange('institute', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Institute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutes</SelectItem>
                {filterOptions.institutes.map(institute => (
                  <SelectItem key={institute} value={institute}>{institute}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.subject || 'all'} onValueChange={(value) => handleFilterChange('subject', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {filterOptions.subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.chapter || 'all'} onValueChange={(value) => handleFilterChange('chapter', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chapter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                {filterOptions.chapters.map(chapter => (
                  <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.topic || 'all'} onValueChange={(value) => handleFilterChange('topic', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {filterOptions.topics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.subtopic || 'all'} onValueChange={(value) => handleFilterChange('subtopic', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Subtopic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subtopics</SelectItem>
                {filterOptions.subtopics.map(subtopic => (
                  <SelectItem key={subtopic.id} value={subtopic.name}>{subtopic.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.type || 'all'} onValueChange={(value) => handleFilterChange('type', value as LMSSeriesType)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="content-series">Content Series</SelectItem>
                <SelectItem value="video-series">Video Series</SelectItem>
                <SelectItem value="assignment-series">Assignment Series</SelectItem>
                <SelectItem value="quiz-series">Quiz Series</SelectItem>
                <SelectItem value="exam-series">Exam Series</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-1 gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>
              Lesson Plan List ({filteredSeries.length} results)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => navigate('/teacher/lms/series/create')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Print
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TeacherDataWrapper
            data={paginatedSeries}
            loading={isLoading}
            emptyTitle="No series found"
            emptyDescription="No series match your current filters. Try adjusting your search criteria."
            emptyIcon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
          >
            {(data) => (
              <div className="space-y-4">
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Institute</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Total Items</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((series) => (
                          <TableRow key={series.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{series.institute}</div>
                                <div className="text-sm text-muted-foreground">
                                  {series.subject} • {series.chapter}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{series.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {series.topic} {series.subtopic && `• ${series.subtopic}`}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {series.totalItems} items
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getSeriesTypeColor(series.type)}>
                                {formatSeriesType(series.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleSeriesAction(series.id, 'preview')}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSeriesAction(series.id, 'update')}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSeriesAction(series.id, 'update-exam')}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Update Exam/Order
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSeriesAction(series.id, 'update-course')}>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Update Course
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {data.map((series) => (
                    <Card key={series.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{series.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {series.institute} • {series.subject}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSeriesAction(series.id, 'preview')}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSeriesAction(series.id, 'update')}>
                                <Edit className="h-4 w-4 mr-2" />
                                Update
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSeriesAction(series.id, 'update-exam')}>
                                <Settings className="h-4 w-4 mr-2" />
                                Update Exam/Order
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSeriesAction(series.id, 'update-course')}>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Update Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {series.chapter} • {series.topic}
                          {series.subtopic && ` • ${series.subtopic}`}
                        </div>

                        <div className="flex justify-between items-center">
                          <Badge variant="secondary">
                            {series.totalItems} items
                          </Badge>
                          <Badge className={getSeriesTypeColor(series.type)}>
                            {formatSeriesType(series.type)}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rows per page:</span>
                      <Select value={pageSize.toString()} onValueChange={(value) => {
                        setPageSize(parseInt(value))
                        setCurrentPage(1)
                      }}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Pagination>
                      <PaginationContent>
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(Math.max(1, currentPage - 1))
                              }}
                            />
                          </PaginationItem>
                        )}
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCurrentPage(page)
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}

                        {currentPage < totalPages && (
                          <PaginationItem>
                            <PaginationNext 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(Math.min(totalPages, currentPage + 1))
                              }}
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </TeacherDataWrapper>
        </CardContent>
      </Card>
    </div>
  )
}

export default LMSSeriesPage
