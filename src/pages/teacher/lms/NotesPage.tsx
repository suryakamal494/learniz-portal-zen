
import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Search, Filter, Plus, Eye, Edit, Download, Grid3X3, List, ChevronDown, ChevronRight, ExpandIcon, ShrinkIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { mockNotesData } from '@/data/mockNotesAssignments'

export default function NotesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInstitute, setSelectedInstitute] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedChapter, setSelectedChapter] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid')
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())

  // Mock data for dropdowns
  const institutes = [
    { id: 'all', name: 'All Institutes' },
    { id: '1', name: 'Cambridge International School' },
    { id: '2', name: 'Oxford Academy' },
    { id: '3', name: 'Royal Public School' }
  ]

  const subjects = useMemo(() => {
    const baseSubjects = [{ id: 'all', name: 'All Subjects' }]
    if (selectedInstitute === 'all') {
      return [...baseSubjects, ...mockNotesData.map(s => ({ id: s.subjectId, name: s.subjectName }))]
    }
    return baseSubjects
  }, [selectedInstitute])

  const chapters = useMemo(() => {
    const baseChapters = [{ id: 'all', name: 'All Chapters' }]
    if (selectedSubject === 'all') return baseChapters
    
    const subject = mockNotesData.find(s => s.subjectId === selectedSubject)
    if (subject) {
      return [...baseChapters, ...subject.chapters.map(c => ({ id: c.id, name: c.title }))]
    }
    return baseChapters
  }, [selectedSubject])

  const topics = useMemo(() => {
    const baseTopics = [{ id: 'all', name: 'All Topics' }]
    if (selectedChapter === 'all') return baseTopics
    
    const subject = mockNotesData.find(s => s.subjectId === selectedSubject)
    const chapter = subject?.chapters.find(c => c.id === selectedChapter)
    if (chapter) {
      // For demo, we'll create some mock topics
      return [...baseTopics, 
        { id: 'topic1', name: 'Introduction' },
        { id: 'topic2', name: 'Advanced Concepts' },
        { id: 'topic3', name: 'Applications' }
      ]
    }
    return baseTopics
  }, [selectedChapter, selectedSubject])

  // Sample notes data for grid view
  const notes = [
    {
      id: '1',
      title: 'Quantum Physics Fundamentals',
      subject: 'Physics',
      chapter: 'Modern Physics',
      type: 'Theory Notes',
      fileSize: '2.4 MB',
      downloads: 45,
      lastUpdated: '2024-01-15',
      description: 'Comprehensive guide to quantum physics principles and applications'
    },
    {
      id: '2',
      title: 'Organic Chemistry Reactions',
      subject: 'Chemistry',
      chapter: 'Organic Compounds',
      type: 'Summary',
      fileSize: '1.8 MB',
      downloads: 32,
      lastUpdated: '2024-01-14',
      description: 'Complete overview of organic chemistry reaction mechanisms'
    },
    {
      id: '3',
      title: 'Calculus Problem Solutions',
      subject: 'Mathematics',
      chapter: 'Differentiation',
      type: 'Practice Solutions',
      fileSize: '3.2 MB',
      downloads: 28,
      lastUpdated: '2024-01-13',
      description: 'Step-by-step solutions to calculus differentiation problems'
    }
  ]

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  const expandAll = () => {
    const allChapters = mockNotesData.flatMap(s => s.chapters.map(c => c.id))
    const allTopics = topics.filter(t => t.id !== 'all').map(t => t.id)
    setExpandedChapters(new Set(allChapters))
    setExpandedTopics(new Set(allTopics))
  }

  const collapseAll = () => {
    setExpandedChapters(new Set())
    setExpandedTopics(new Set())
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <Card key={note.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <FileText className="h-8 w-8 text-blue-500" />
              <Badge variant="secondary">{note.type}</Badge>
            </div>
            <CardTitle className="text-lg">{note.title}</CardTitle>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{note.subject} • {note.chapter}</p>
              <p className="text-xs text-muted-foreground">
                {note.fileSize} • {note.downloads} downloads
              </p>
              <p className="text-sm text-muted-foreground mt-2">{note.description}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Updated: {new Date(note.lastUpdated).toLocaleDateString()}
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderTreeView = () => (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={expandAll}>
          <ExpandIcon className="h-4 w-4 mr-2" />
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>
          <ShrinkIcon className="h-4 w-4 mr-2" />
          Collapse All
        </Button>
      </div>

      {mockNotesData.map((subject) => (
        <Card key={subject.subjectId}>
          <CardHeader>
            <CardTitle className="text-lg text-primary">{subject.subjectName}</CardTitle>
          </CardHeader>
          <CardContent>
            {subject.chapters.map((chapter) => {
              const isChapterExpanded = expandedChapters.has(chapter.id)
              const notesCount = chapter.notes.length
              
              return (
                <div key={chapter.id} className="mb-4">
                  <div 
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    {isChapterExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">{chapter.title}</span>
                    <Badge variant="outline" className="ml-2">
                      [{notesCount}]
                    </Badge>
                  </div>
                  
                  {isChapterExpanded && (
                    <div className="ml-6 mt-2 space-y-2">
                      {/* Mock topics for this chapter */}
                      {['Introduction', 'Advanced Concepts', 'Applications'].map((topicName, index) => {
                        const topicId = `${chapter.id}-topic-${index}`
                        const isTopicExpanded = expandedTopics.has(topicId)
                        const topicNotesCount = Math.floor(notesCount / 3) + (index === 0 ? notesCount % 3 : 0)
                        
                        return (
                          <div key={topicId}>
                            <div 
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                              onClick={() => toggleTopic(topicId)}
                            >
                              {isTopicExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <span className="text-sm font-medium">{topicName}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                [{topicNotesCount}]
                              </Badge>
                            </div>
                            
                            {isTopicExpanded && (
                              <div className="ml-6 mt-2 space-y-1">
                                {chapter.notes.slice(0, topicNotesCount).map((note) => (
                                  <div key={note.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm">{note.title}</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {note.fileType.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="ghost">
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                      <Button size="sm" variant="ghost">
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button size="sm" variant="ghost">
                                        <Download className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notes Management</h1>
          <p className="text-muted-foreground">Create, organize, and distribute study notes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/teacher/classroom/schedule')}>
            Back to Classroom
          </Button>
          <Button 
            variant="default" 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/teacher/classroom/notes/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Notes
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Institute</label>
              <Select value={selectedInstitute} onValueChange={setSelectedInstitute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Institute" />
                </SelectTrigger>
                <SelectContent>
                  {institutes.map((institute) => (
                    <SelectItem key={institute.id} value={institute.id}>
                      {institute.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chapter</label>
              <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="default" className="bg-primary hover:bg-primary/90">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'tree' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tree')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Display */}
      {viewMode === 'grid' ? renderGridView() : renderTreeView()}

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Notes Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-muted-foreground">Total Notes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1,245</div>
              <div className="text-sm text-muted-foreground">Total Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-muted-foreground">Subjects Covered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">8.5 GB</div>
              <div className="text-sm text-muted-foreground">Storage Used</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
