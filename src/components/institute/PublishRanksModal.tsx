import React, { useState } from 'react';
import { Trophy, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CompetitionExamType, competitionExamLabels } from '@/types/grandTest';

interface PublishRanksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (examType: CompetitionExamType) => void;
  testName: string;
  isPublishing?: boolean;
}

export function PublishRanksModal({ 
  isOpen, 
  onClose, 
  onPublish, 
  testName,
  isPublishing = false 
}: PublishRanksModalProps) {
  const [selectedExamType, setSelectedExamType] = useState<CompetitionExamType | ''>('');

  const handlePublish = () => {
    if (selectedExamType) {
      onPublish(selectedExamType);
    }
  };

  const handleClose = () => {
    setSelectedExamType('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Publish Ranks
          </DialogTitle>
          <DialogDescription>
            Publish student rankings for <strong>{testName}</strong>. Once published, 
            students will be able to view their ranks in their reports page.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Competition Exam Type
            </label>
            <Select 
              value={selectedExamType} 
              onValueChange={(value) => setSelectedExamType(value as CompetitionExamType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select competition exam type" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="jee_mains">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-500" />
                    JEE Mains
                  </div>
                </SelectItem>
                <SelectItem value="neet">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" />
                    NEET
                  </div>
                </SelectItem>
                <SelectItem value="eamcet">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    EAMCET
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">What happens after publishing?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Students can view their rank in the reports section</li>
              <li>Rankings will be calculated based on overall accuracy</li>
              <li>Rank comparison with competition exam percentile will be shown</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isPublishing}>
            Cancel
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={!selectedExamType || isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish Ranks'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
