import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, ChevronLeft, ChevronRight, Loader2, Save, X, Presentation, FileText, Image, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  mockGeneratedPPT, 
  mockPPTSubjects, 
  mockPPTChapters, 
  mockPPTTopics,
  PPTSlide,
  GeneratedPPT 
} from '@/data/mockPresentations'

const AIPPTGeneratorPage = () => {
  const navigate = useNavigate()
  
  // Form state
  const [pptTitle, setPptTitle] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [prompt, setPrompt] = useState('')
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPPT, setGeneratedPPT] = useState<GeneratedPPT | null>(null)
  
  // Preview state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  // Get available chapters based on selected subject
  const availableChapters = useMemo(() => {
    if (!selectedSubject) return []
    return mockPPTChapters[selectedSubject] || []
  }, [selectedSubject])

  // Get available topics based on selected chapter
  const availableTopics = useMemo(() => {
    if (!selectedChapter) return []
    return mockPPTTopics[selectedChapter] || []
  }, [selectedChapter])

  // Check if form is valid for generation
  const isFormValid = pptTitle.trim() !== '' && 
                      selectedSubject !== '' && 
                      selectedChapter !== '' && 
                      selectedTopic !== ''

  // Handle subject change - reset dependent fields
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value)
    setSelectedChapter('')
    setSelectedTopic('')
  }

  // Handle chapter change - reset topic
  const handleChapterChange = (value: string) => {
    setSelectedChapter(value)
    setSelectedTopic('')
  }

  // Generate PPT
  const handleGeneratePPT = async () => {
    setIsGenerating(true)
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // Set the mock generated PPT with user's title
    const ppt: GeneratedPPT = {
      ...mockGeneratedPPT,
      title: pptTitle,
      subject: mockPPTSubjects.find(s => s.id === selectedSubject)?.name || selectedSubject,
      chapter: availableChapters.find(c => c.id === selectedChapter)?.name || selectedChapter,
      topic: availableTopics.find(t => t.id === selectedTopic)?.name || selectedTopic,
      slides: mockGeneratedPPT.slides.map((slide, index) => 
        index === 0 ? { ...slide, title: pptTitle } : slide
      )
    }
    
    setGeneratedPPT(ppt)
    setCurrentSlideIndex(0)
    setIsGenerating(false)
  }

  // Handle save
  const handleSave = () => {
    // In real implementation, this would save to backend
    console.log('Saving PPT:', generatedPPT)
    navigate('/teacher/lms/library')
  }

  // Handle cancel
  const handleCancel = () => {
    navigate('/teacher/lms/library')
  }

  // Navigate slides
  const goToNextSlide = () => {
    if (generatedPPT && currentSlideIndex < generatedPPT.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1)
    }
  }

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1)
    }
  }

  // Get slide type icon
  const getSlideTypeIcon = (type: PPTSlide['type']) => {
    switch (type) {
      case 'title': return <Presentation className="h-4 w-4" />
      case 'intro': return <FileText className="h-4 w-4" />
      case 'content': return <List className="h-4 w-4" />
      case 'diagram': return <Image className="h-4 w-4" />
      case 'summary': return <FileText className="h-4 w-4" />
      case 'qa': return <List className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  // Get slide type color
  const getSlideTypeColor = (type: PPTSlide['type']) => {
    const colors = {
      title: 'bg-purple-100 text-purple-800 border-purple-200',
      intro: 'bg-blue-100 text-blue-800 border-blue-200',
      content: 'bg-green-100 text-green-800 border-green-200',
      diagram: 'bg-orange-100 text-orange-800 border-orange-200',
      summary: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      qa: 'bg-pink-100 text-pink-800 border-pink-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const currentSlide = generatedPPT?.slides[currentSlideIndex]

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/teacher/lms/library')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            AI PPT Generator
          </h1>
          <p className="text-muted-foreground mt-1">Create professional presentations with AI assistance</p>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Presentation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PPT Title */}
              <div className="space-y-2">
                <Label htmlFor="pptTitle">PPT Title *</Label>
                <Input
                  id="pptTitle"
                  placeholder="Enter presentation title..."
                  value={pptTitle}
                  onChange={(e) => setPptTitle(e.target.value)}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPPTSubjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chapter */}
              <div className="space-y-2">
                <Label>Chapter *</Label>
                <Select 
                  value={selectedChapter} 
                  onValueChange={handleChapterChange}
                  disabled={!selectedSubject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedSubject ? "Select chapter" : "Select subject first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableChapters.map(chapter => (
                      <SelectItem key={chapter.id} value={chapter.id}>
                        {chapter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label>Topic *</Label>
                <Select 
                  value={selectedTopic} 
                  onValueChange={setSelectedTopic}
                  disabled={!selectedChapter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedChapter ? "Select topic" : "Select chapter first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTopics.map(topic => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Additional Instructions (Optional)</Label>
                <Textarea
                  id="prompt"
                  placeholder="Add any specific instructions for the AI... (e.g., 'Focus on practical examples', 'Include diagrams for each concept')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGeneratePPT}
                disabled={!isFormValid || isGenerating}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate PPT
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Slide Thumbnails */}
          {generatedPPT && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Slides ({generatedPPT.slides.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {generatedPPT.slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlideIndex(index)}
                      className={`p-2 rounded-lg border-2 transition-all text-left ${
                        currentSlideIndex === index 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-border hover:border-purple-300'
                      }`}
                    >
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Slide {index + 1}
                      </div>
                      <div className="text-xs line-clamp-2 text-foreground">
                        {slide.title}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-3">
          <Card className="h-full min-h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Preview</CardTitle>
                {generatedPPT && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Slide {currentSlideIndex + 1} of {generatedPPT.slides.length}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-6">
              {!generatedPPT && !isGenerating && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                      <Presentation className="h-10 w-10 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">No Presentation Yet</h3>
                      <p className="text-muted-foreground mt-1">
                        Fill in the details and click "Generate PPT" to create your presentation
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Generating Your Presentation</h3>
                      <p className="text-muted-foreground mt-1">
                        AI is creating slides based on your input...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {generatedPPT && currentSlide && (
                <>
                  {/* Slide Preview */}
                  <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 text-white relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
                    
                    {/* Slide type badge */}
                    <Badge className={`mb-4 ${getSlideTypeColor(currentSlide.type)}`}>
                      {getSlideTypeIcon(currentSlide.type)}
                      <span className="ml-1 capitalize">{currentSlide.type}</span>
                    </Badge>

                    {/* Slide content */}
                    <div className="relative z-10 space-y-6">
                      <h2 className={`font-bold ${currentSlide.type === 'title' ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}>
                        {currentSlide.title}
                      </h2>
                      
                      {currentSlide.content && (
                        <ul className="space-y-3">
                          {currentSlide.content.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                              <span className="text-slate-200">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {currentSlide.imageUrl && currentSlide.type === 'diagram' && (
                        <div className="mt-6 bg-white/10 rounded-lg p-8 flex items-center justify-center">
                          <div className="text-center">
                            <Image className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                            <p className="text-sm text-slate-400">Diagram placeholder</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Slide number indicator */}
                    <div className="absolute bottom-4 right-4 text-sm text-slate-400">
                      {currentSlideIndex + 1} / {generatedPPT.slides.length}
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={goToPrevSlide}
                      disabled={currentSlideIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex gap-1">
                      {generatedPPT.slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlideIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            currentSlideIndex === index 
                              ? 'bg-purple-500 w-4' 
                              : 'bg-slate-300 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={goToNextSlide}
                      disabled={currentSlideIndex === generatedPPT.slides.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  {/* Speaker Notes */}
                  {currentSlide.notes && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="text-sm font-semibold text-foreground mb-1">Speaker Notes</h4>
                      <p className="text-sm text-muted-foreground">{currentSlide.notes}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom when PPT is generated */}
      {generatedPPT && (
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white border-0"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Presentation
          </Button>
        </div>
      )}
    </div>
  )
}

export default AIPPTGeneratorPage
