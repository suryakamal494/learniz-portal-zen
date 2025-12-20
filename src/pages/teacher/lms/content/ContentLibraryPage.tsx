
import React, { useState, useMemo } from 'react'
import { Plus, Search, Filter, Download, FileText, Eye, Edit, BookOpen, File, Video, Grid3X3, TreePine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TeacherDataWrapper } from '@/components/teacher/ui/TeacherDataWrapper'
import { ContentTreeView } from '@/components/teacher/lms/ContentTreeView'
import { mockLMSContent, mockInstitutes } from '@/data/mockLMSContent'
import { LMSContentItem, LMSContentFilters } from '@/types/lmsContent'

const ContentLibraryPage = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<LMSContentFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid')

  // Get unique filter options from data
  const filterOptions = useMemo(() => {
    const subjects = [...new Set(mockLMSContent.map(content => content.subject))]
    const chapters = filters.subject 
      ? [...new Set(mockLMSContent.filter(c => c.subject === filters.subject).map(c => c.chapter))]
      : [...new Set(mockLMSContent.map(content => content.chapter))]
    const topics = filters.chapter
      ? [...new Set(mockLMSContent.filter(c => c.chapter === filters.chapter).map(c => c.topic))]
      : [...new Set(mockLMSContent.map(content => content.topic))]

    return { subjects, chapters, topics }
  }, [filters.subject, filters.chapter])

  // Filter and search content data
  const filteredContent = useMemo(() => {
    return mockLMSContent.filter(content => {
      if (filters.institute && content.institute !== filters.institute) return false
      if (filters.subject && content.subject !== filters.subject) return false
      if (filters.chapter && content.chapter !== filters.chapter) return false
      if (filters.topic && content.topic !== filters.topic) return false
      if (filters.contentType && content.type !== filters.contentType) return false
      if (searchQuery && !content.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [filters, searchQuery])

  const handleFilterChange = (key: keyof LMSContentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
  }

  const handleReset = () => {
    setFilters({})
    setSearchQuery('')
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video-url': return <Video className="h-4 w-4" />
      case 'pdf': return <FileText className="h-4 w-4" />
      case 'file': return <File className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getContentTypeColor = (type: string) => {
    const colors = {
      'video-url': 'bg-purple-100 text-purple-800 border-purple-200',
      'pdf': 'bg-red-100 text-red-800 border-red-200',
      'file': 'bg-blue-100 text-blue-800 border-blue-200',
      'text': 'bg-green-100 text-green-800 border-green-200',
      'image': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'iframe': 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Material Library</h1>
          <p className="text-muted-foreground mt-1">Browse and manage your lesson materials</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => navigate('/teacher/lms/content/create')}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Button>
          <Button 
            variant="outline"
            className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0"
          >
            ✨ AI PPT Generator
          </Button>
        </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <Select value={filters.institute || 'all'} onValueChange={(value) => handleFilterChange('institute', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Institute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutes</SelectItem>
                {mockInstitutes.map(institute => (
                  <SelectItem key={institute.id} value={institute.name}>{institute.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value="all">
              <SelectTrigger>
                <SelectValue placeholder="Teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                <SelectItem value="teacher1">Prof. Smith</SelectItem>
                <SelectItem value="teacher2">Dr. Johnson</SelectItem>
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

            <Select value={filters.contentType || 'all'} onValueChange={(value) => handleFilterChange('contentType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video-url">Video URL</SelectItem>
                <SelectItem value="iframe">Iframe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleReset}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Display */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>
              Material Library ({filteredContent.length} items)
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'tree' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tree')}
                  className="rounded-none"
                >
                  <TreePine className="h-4 w-4 mr-2" />
                  Tree
                </Button>
              </div>
              
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
                    Export List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'tree' ? (
            <ContentTreeView 
              content={filteredContent}
              selectedInstitute={filters.institute}
              selectedTeacher="all"
            />
          ) : (
            <TeacherDataWrapper
              data={filteredContent}
              loading={isLoading}
              emptyTitle="No content found"
              emptyDescription="No content matches your current filters. Try adjusting your search criteria."
              emptyIcon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
            >
              {(data) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.map((content) => (
                    <Card key={content.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getContentTypeIcon(content.type)}
                              <Badge className={getContentTypeColor(content.type)}>
                                {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/teacher/lms/content/${content.id}/view`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-sm line-clamp-2">{content.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {content.subject} • {content.chapter}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {content.topic}
                            </p>
                          </div>

                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{content.type}</span>
                            <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TeacherDataWrapper>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ContentLibraryPage
