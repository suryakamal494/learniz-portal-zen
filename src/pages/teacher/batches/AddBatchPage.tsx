
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { BatchFormData } from '@/types/batch'

export default function AddBatchPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<BatchFormData>({
    name: '',
    class: '',
    course: '',
    capacity: 0,
    startDate: undefined,
    endDate: undefined,
    startTime: '',
    endTime: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof BatchFormData, string>>>({})

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BatchFormData, string>> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Section name is required'
    if (!formData.class) newErrors.class = 'Class is required'
    if (!formData.course) newErrors.course = 'Course is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.class && 
           formData.course && 
           formData.startDate && 
           formData.endDate
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Creating section:', formData)
      // Future: API call to create batch
      navigate('/teacher/batches')
    }
  }

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return [`${hour}:00`, `${hour}:30`]
  }).flat()

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/teacher/batches')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Section</h1>
              <p className="text-gray-600 mt-1">Fill in the details to create a new student section</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Section Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Batch Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Section Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter section name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Class */}
                <div className="space-y-2">
                  <Label htmlFor="class">Class *</Label>
                  <Select 
                    value={formData.class} 
                    onValueChange={(value) => setFormData({ ...formData, class: value })}
                  >
                    <SelectTrigger className={errors.class ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Class 9">Class 9</SelectItem>
                      <SelectItem value="Class 10">Class 10</SelectItem>
                      <SelectItem value="Class 11">Class 11</SelectItem>
                      <SelectItem value="Class 12">Class 12</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.class && <p className="text-sm text-red-500">{errors.class}</p>}
                </div>

                {/* Course */}
                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select 
                    value={formData.course} 
                    onValueChange={(value) => setFormData({ ...formData, course: value })}
                  >
                    <SelectTrigger className={errors.course ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Science Stream">Science Stream</SelectItem>
                      <SelectItem value="Commerce Stream">Commerce Stream</SelectItem>
                      <SelectItem value="Arts Stream">Arts Stream</SelectItem>
                      <SelectItem value="JEE Preparation">JEE Preparation</SelectItem>
                      <SelectItem value="NEET Preparation">NEET Preparation</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.course && <p className="text-sm text-red-500">{errors.course}</p>}
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    placeholder="Enter section capacity"
                    min="1"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startDate && "text-muted-foreground",
                          errors.startDate && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          <span>{format(formData.startDate, "PPP")}</span>
                        ) : (
                          <span>Pick start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date: Date | undefined) => setFormData({ ...formData, startDate: date })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endDate && "text-muted-foreground",
                          errors.endDate && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          <span>{format(formData.endDate, "PPP")}</span>
                        ) : (
                          <span>Pick end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date: Date | undefined) => setFormData({ ...formData, endDate: date })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select 
                    value={formData.startTime} 
                    onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Select 
                    value={formData.endTime} 
                    onValueChange={(value) => setFormData({ ...formData, endTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  disabled={!isFormValid()}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
                >
                  Create Section
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
