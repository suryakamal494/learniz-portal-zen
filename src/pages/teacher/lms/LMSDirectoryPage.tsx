
import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Eye, ExpandIcon, ShrinkIcon, BookOpen, Video, FileText, PenTool, GraduationCap, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { mockLMSSeries } from '@/data/mockLMSSeries'
import { LMSSeries } from '@/types/lmsSeries'

interface TreeNode {
  id: string
  name: string
  type: 'chapter' | 'topic' | 'series'
  children?: TreeNode[]
  seriesCount?: number
  seriesData?: LMSSeries
}

export default function LMSDirectoryPage() {
  const navigate = useNavigate()
  const [selectedInstitute, setSelectedInstitute] = useState<string>('all-institutes')
  const [selectedSubject, setSelectedSubject] = useState<string>('all-subjects')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Get unique institutes and subjects
  const institutes = useMemo(() => {
    const uniqueInstitutes = Array.from(new Set(mockLMSSeries.map(series => series.institute)))
    return uniqueInstitutes
  }, [])

  const subjects = useMemo(() => {
    const filteredSeries = selectedInstitute !== 'all-institutes'
      ? mockLMSSeries.filter(series => series.institute === selectedInstitute)
      : mockLMSSeries
    const uniqueSubjects = Array.from(new Set(filteredSeries.map(series => series.subject)))
    return uniqueSubjects
  }, [selectedInstitute])

  // Build tree structure from filtered data
  const treeData = useMemo(() => {
    let filteredSeries = mockLMSSeries

    if (selectedInstitute !== 'all-institutes') {
      filteredSeries = filteredSeries.filter(series => series.institute === selectedInstitute)
    }
    if (selectedSubject !== 'all-subjects') {
      filteredSeries = filteredSeries.filter(series => series.subject === selectedSubject)
    }

    const chapters = new Map<string, TreeNode>()

    filteredSeries.forEach(series => {
      // Create chapter if it doesn't exist
      if (!chapters.has(series.chapter)) {
        chapters.set(series.chapter, {
          id: `chapter-${series.chapter}`,
          name: series.chapter,
          type: 'chapter',
          children: [],
          seriesCount: 0
        })
      }

      const chapter = chapters.get(series.chapter)!
      chapter.seriesCount = (chapter.seriesCount || 0) + 1

      // Find or create topic
      let topic = chapter.children?.find(t => t.name === series.topic)
      if (!topic) {
        topic = {
          id: `topic-${series.chapter}-${series.topic}`,
          name: series.topic,
          type: 'topic',
          children: [],
          seriesCount: 0
        }
        chapter.children?.push(topic)
      }
      topic.seriesCount = (topic.seriesCount || 0) + 1

      // Add series
      const seriesNode: TreeNode = {
        id: `series-${series.id}`,
        name: series.title,
        type: 'series',
        seriesData: series
      }
      topic.children?.push(seriesNode)
    })

    return Array.from(chapters.values())
  }, [selectedInstitute, selectedSubject])

  const handleToggle = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const expandAll = () => {
    const allNodeIds = new Set<string>()
    const collectNodeIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          allNodeIds.add(node.id)
          collectNodeIds(node.children)
        }
      })
    }
    collectNodeIds(treeData)
    setExpandedNodes(allNodeIds)
  }

  const collapseAll = () => {
    setExpandedNodes(new Set())
  }

  const getIcon = (node: TreeNode, isExpanded: boolean) => {
    switch (node.type) {
      case 'chapter':
        return isExpanded 
          ? <FolderOpen className="h-4 w-4 text-amber-500" />
          : <Folder className="h-4 w-4 text-amber-600" />
      case 'topic':
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case 'series':
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeriesTypeIcon = (type: string) => {
    switch (type) {
      case 'video-series':
        return <Video className="h-3 w-3 text-purple-500" />
      case 'assignment-series':
        return <PenTool className="h-3 w-3 text-green-500" />
      case 'quiz-series':
        return <GraduationCap className="h-3 w-3 text-orange-500" />
      case 'exam-series':
        return <GraduationCap className="h-3 w-3 text-red-500" />
      default:
        return <FileText className="h-3 w-3 text-blue-500" />
    }
  }

  const renderTreeNode = (node: TreeNode, level = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const paddingLeft = level * 24

    return (
      <div key={node.id}>
        <div 
          className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
          onClick={() => hasChildren && handleToggle(node.id)}
        >
          {hasChildren ? (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded 
                ? <ChevronDown className="h-3 w-3 text-gray-500" />
                : <ChevronRight className="h-3 w-3 text-gray-500" />
              }
            </div>
          ) : (
            <div className="w-4" />
          )}

          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getIcon(node, isExpanded)}
            <span className="font-medium text-foreground truncate">
              {node.name}
            </span>
            {node.seriesCount !== undefined && (
              <span className="text-sm text-muted-foreground">
                ({node.seriesCount})
              </span>
            )}
            {node.type === 'series' && node.seriesData && (
              <>
                <div className="flex items-center gap-1 ml-2">
                  {getSeriesTypeIcon(node.seriesData.type)}
                  <span className="text-xs text-muted-foreground">
                    {node.seriesData.type.replace('-', ' ')}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/teacher/lms/series/${node.seriesData!.id}/preview`)
                  }}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    let filteredSeries = mockLMSSeries

    if (selectedInstitute !== 'all-institutes') {
      filteredSeries = filteredSeries.filter(series => series.institute === selectedInstitute)
    }
    if (selectedSubject !== 'all-subjects') {
      filteredSeries = filteredSeries.filter(series => series.subject === selectedSubject)
    }

    const stats = {
      totalSeries: filteredSeries.length,
      videoSeries: filteredSeries.filter(s => s.type === 'video-series').length,
      contentSeries: filteredSeries.filter(s => s.type === 'content-series').length,
      assignmentSeries: filteredSeries.filter(s => s.type === 'assignment-series').length,
      quizSeries: filteredSeries.filter(s => s.type === 'quiz-series').length,
      examSeries: filteredSeries.filter(s => s.type === 'exam-series').length,
      totalChapters: new Set(filteredSeries.map(s => s.chapter)).size,
      totalTopics: new Set(filteredSeries.map(s => `${s.chapter}-${s.topic}`)).size
    }

    return stats
  }, [selectedInstitute, selectedSubject])

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lesson Plan Library</h1>
          <p className="text-muted-foreground">Browse lesson plans by subject hierarchy</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/teacher/lms/series/create')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Lesson Plan
          </Button>
          <Button variant="outline" onClick={() => navigate('/teacher/lms')}>
            Back to Lessons
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Institute</label>
              <Select value={selectedInstitute} onValueChange={setSelectedInstitute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Institute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-institutes">All Institutes</SelectItem>
                  {institutes.map(institute => (
                    <SelectItem key={institute} value={institute}>
                      {institute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-subjects">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Directory Tree */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Lesson Plan Directory
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
                className="flex items-center gap-2"
              >
                <ExpandIcon className="h-4 w-4" />
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
                className="flex items-center gap-2"
              >
                <ShrinkIcon className="h-4 w-4" />
                Collapse All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t max-h-96 overflow-y-auto">
            {treeData.length > 0 ? (
              treeData.map(chapter => renderTreeNode(chapter))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No content found</h3>
                <p className="text-muted-foreground">No series match your current filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Content Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold">{summaryStats.totalSeries}</div>
              <div className="text-sm text-muted-foreground">Total Series</div>
            </div>
            <div className="text-center">
              <Video className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-lg font-bold">{summaryStats.videoSeries}</div>
              <div className="text-sm text-muted-foreground">Video Series</div>
            </div>
            <div className="text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold">{summaryStats.contentSeries}</div>
              <div className="text-sm text-muted-foreground">Content Series</div>
            </div>
            <div className="text-center">
              <PenTool className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-bold">{summaryStats.assignmentSeries}</div>
              <div className="text-sm text-muted-foreground">Assignment Series</div>
            </div>
            <div className="text-center">
              <GraduationCap className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-lg font-bold">{summaryStats.quizSeries}</div>
              <div className="text-sm text-muted-foreground">Quiz Series</div>
            </div>
            <div className="text-center">
              <GraduationCap className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-lg font-bold">{summaryStats.examSeries}</div>
              <div className="text-sm text-muted-foreground">Exam Series</div>
            </div>
            <div className="text-center">
              <Folder className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <div className="text-lg font-bold">{summaryStats.totalChapters}</div>
              <div className="text-sm text-muted-foreground">Chapters</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Topics:</span>
                <span className="ml-2">{summaryStats.totalTopics}</span>
              </div>
              <div>
                <span className="font-medium">Active Filters:</span>
                <span className="ml-2">
                  {selectedInstitute !== 'all-institutes' || selectedSubject !== 'all-subjects'
                    ? `${selectedInstitute !== 'all-institutes' ? selectedInstitute : 'All Institutes'}${selectedSubject !== 'all-subjects' ? ` • ${selectedSubject}` : ' • All Subjects'}`
                    : 'None'
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
