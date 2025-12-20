
import React from 'react'
import { Save, Trash2, Eye, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LMSContentItem } from '@/types/lmsContent'

interface SelectedItemsPanelProps {
  selectedItems: LMSContentItem[]
  onRemoveItem: (itemId: string) => void
  onRemoveAll: () => void
  onUpdate: () => void
  onPreview: (item: LMSContentItem) => void
  isLoading: boolean
}

export const SelectedItemsPanel: React.FC<SelectedItemsPanelProps> = ({
  selectedItems,
  onRemoveItem,
  onRemoveAll,
  onUpdate,
  onPreview,
  isLoading
}) => {
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

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Selected Items ({selectedItems.length})</CardTitle>
          {selectedItems.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRemoveAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remove All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {selectedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Save className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">
              No items selected yet. Add content from the left panel.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Items List */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <Card key={item.id} className="p-3 bg-gray-50">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {item.chapter} • {item.topic}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${getTypeBadgeColor(item.type)}`}>
                          {item.type.replace('-', ' ').toUpperCase()}
                        </Badge>
                        
                        {['video-url', 'pdf', 'image'].includes(item.type) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onPreview(item)}
                            className="h-6 text-xs px-2"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="pt-4 border-t space-y-2">
              <Button
                onClick={onUpdate}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Updating...' : `Update Lesson Plan (${selectedItems.length} items)`}
              </Button>
              
              <div className="text-xs text-center text-gray-500">
                This will add the selected items to your lesson plan
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
