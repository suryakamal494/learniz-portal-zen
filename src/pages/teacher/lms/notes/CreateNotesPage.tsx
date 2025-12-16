
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  subject: z.string().min(1, 'Subject is required'),
  chapter: z.string().min(1, 'Chapter is required'),
  topic: z.string().min(1, 'Topic is required'),
  contentType: z.string().min(1, 'Content type is required'),
  image: z.any().optional()
})

type FormData = z.infer<typeof formSchema>

// Mock data for dynamic dropdowns
const mockSubjects = [
  { id: '1', name: 'Physics' },
  { id: '2', name: 'Mathematics' },
  { id: '3', name: 'Chemistry' },
  { id: '4', name: 'Biology' }
]

const mockChapters = {
  '1': [
    { id: '1-1', name: 'Motion in a Straight Line' },
    { id: '1-2', name: 'Laws of Motion' },
    { id: '1-3', name: 'Work, Energy and Power' }
  ],
  '2': [
    { id: '2-1', name: 'Relations and Functions' },
    { id: '2-2', name: 'Inverse Trigonometric Functions' },
    { id: '2-3', name: 'Matrices' }
  ],
  '3': [
    { id: '3-1', name: 'The Solid State' },
    { id: '3-2', name: 'Solutions' },
    { id: '3-3', name: 'Electrochemistry' }
  ],
  '4': [
    { id: '4-1', name: 'Reproduction in Organisms' },
    { id: '4-2', name: 'Sexual Reproduction in Flowering Plants' },
    { id: '4-3', name: 'Human Reproduction' }
  ]
}

const mockTopics = {
  '1-1': [
    { id: '1-1-1', name: 'Position, Path Length and Displacement' },
    { id: '1-1-2', name: 'Average Velocity and Average Speed' },
    { id: '1-1-3', name: 'Instantaneous Velocity and Speed' }
  ],
  '2-1': [
    { id: '2-1-1', name: 'Types of Relations' },
    { id: '2-1-2', name: 'Types of Functions' },
    { id: '2-1-3', name: 'Composition of Functions' }
  ],
  '3-1': [
    { id: '3-1-1', name: 'General Characteristics of Solid State' },
    { id: '3-1-2', name: 'Amorphous and Crystalline Solids' },
    { id: '3-1-3', name: 'Classification of Crystalline Solids' }
  ],
  '4-1': [
    { id: '4-1-1', name: 'Modes of Reproduction' },
    { id: '4-1-2', name: 'Asexual Reproduction' },
    { id: '4-1-3', name: 'Sexual Reproduction' }
  ]
}

const contentTypes = [
  { id: 'video', name: 'Video' },
  { id: 'document', name: 'Document' },
  { id: 'quiz', name: 'Quiz' },
  { id: 'presentation', name: 'Presentation' },
  { id: 'audio', name: 'Audio' },
  { id: 'image', name: 'Image' }
]

const CreateNotesPage = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [chapters, setChapters] = useState<{ id: string; name: string }[]>([])
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject: '',
      chapter: '',
      topic: '',
      contentType: ''
    }
  })

  const selectedSubject = form.watch('subject')
  const selectedChapter = form.watch('chapter')

  // Load chapters when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const subjectChapters = mockChapters[selectedSubject as keyof typeof mockChapters] || []
      setChapters(subjectChapters)
      setTopics([])
      form.setValue('chapter', '')
      form.setValue('topic', '')
    }
  }, [selectedSubject, form])

  // Load topics when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      const chapterTopics = mockTopics[selectedChapter as keyof typeof mockTopics] || []
      setTopics(chapterTopics)
      form.setValue('topic', '')
    }
  }, [selectedChapter, form])

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Creating notes:', { ...data, image: selectedImage })
      
      // Navigate back to notes list
      navigate('/teacher/classroom/notes')
    } catch (error) {
      console.error('Error creating notes:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/teacher/classroom/schedule')}>Classroom</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/teacher/classroom/notes')}>Notes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Notes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/teacher/classroom/notes')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notes
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create Notes</h1>
          <p className="text-muted-foreground mt-1">Add new study notes to your library</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Notes Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Notes Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockSubjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chapter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapter *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSubject}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select chapter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {chapters.map(chapter => (
                            <SelectItem key={chapter.id} value={chapter.id}>{chapter.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedChapter}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select topic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {topics.map(topic => (
                            <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Content Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contentTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Image Upload (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 relative">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, JPEG (max 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      onChange={handleImageSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                  </div>
                  {selectedImage && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{selectedImage.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Notes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/teacher/classroom/notes')}
                  className="flex-1 sm:flex-none"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateNotesPage
