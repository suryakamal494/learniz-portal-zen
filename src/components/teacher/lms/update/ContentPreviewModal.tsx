
import React from 'react'
import { X, FileText, Video, Image, Globe } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LMSContentItem } from '@/types/lmsContent'
import { AnnotationOverlay } from '@/components/teacher/preview/AnnotationOverlay'

interface ContentPreviewModalProps {
  item: LMSContentItem
  isOpen: boolean
  onClose: () => void
}

export const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const getTypeIcon = (type: string) => {
    const iconProps = "h-5 w-5"
    switch (type) {
      case 'video-url':
        return <Video className={`${iconProps} text-blue-600`} />
      case 'pdf':
        return <FileText className={`${iconProps} text-red-600`} />
      case 'image':
        return <Image className={`${iconProps} text-green-600`} />
      case 'iframe':
        return <Globe className={`${iconProps} text-purple-600`} />
      default:
        return <FileText className={`${iconProps} text-gray-600`} />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'video-url':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pdf':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'image':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'iframe':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderPreviewContent = () => {
    switch (item.type) {
      case 'video-url':
        return (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Video Preview</p>
              <p className="text-xs text-gray-500 mt-1">
                URL: {item.url || 'No URL provided'}
              </p>
            </div>
          </div>
        )
      
      case 'pdf':
        return (
          <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">PDF Preview</p>
              <p className="text-xs text-gray-500 mt-1">
                {item.url ? `File: ${item.url}` : 'No file path provided'}
              </p>
            </div>
          </div>
        )
      
      case 'image':
        return (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Image Preview</p>
              <p className="text-xs text-gray-500 mt-1">
                {item.url ? `Image: ${item.url}` : 'No image path provided'}
              </p>
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            <div className="prose prose-sm">
              {item.content ? (
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              ) : (
                <p className="text-gray-500">No content available</p>
              )}
            </div>
          </div>
        )
      
      default:
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">Preview not available for this content type</p>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {getTypeIcon(item.type)}
              {item.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Content Info */}
          <div className="flex items-center justify-between">
            <Badge className={getTypeBadgeColor(item.type)}>
              {item.type.replace('-', ' ').toUpperCase()}
            </Badge>
            <div className="text-sm text-gray-500">
              Created by {item.createdBy}
            </div>
          </div>

          {/* Content Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Subject:</span> {item.subject}
            </div>
            <div>
              <span className="font-medium">Chapter:</span> {item.chapter}
            </div>
            <div>
              <span className="font-medium">Topic:</span> {item.topic}
            </div>
            <div>
              <span className="font-medium">Institute:</span> {item.institute}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          )}

          {/* Preview with annotation overlay */}
          <div>
            <h4 className="font-medium mb-2">Content Preview</h4>
            <div className="relative w-full" style={{ height: '60vh' }}>
              <AnnotationOverlay className="rounded-lg overflow-hidden border border-gray-200">
                {renderPreviewContent()}
              </AnnotationOverlay>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
