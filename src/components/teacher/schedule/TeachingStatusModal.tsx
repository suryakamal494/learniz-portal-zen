
import React, { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TeachingStatus } from '@/types/teachingProgress';

interface TeachingStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: TeachingStatus;
  currentNotes?: string;
  onSave: (status: TeachingStatus, notes?: string) => void;
  topic: string;
}

export function TeachingStatusModal({
  open,
  onOpenChange,
  currentStatus,
  currentNotes,
  onSave,
  topic
}: TeachingStatusModalProps) {
  const [status, setStatus] = useState<TeachingStatus>(currentStatus === 'pending' ? 'completed' : currentStatus);
  const [notes, setNotes] = useState(currentNotes || '');

  const handleSave = () => {
    onSave(status, notes.trim() || undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Teaching Status</DialogTitle>
          <DialogDescription>
            {topic}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={status} onValueChange={(value) => setStatus(value as TeachingStatus)}>
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <RadioGroupItem value="completed" id="completed" />
              <Label htmlFor="completed" className="flex items-center gap-2 cursor-pointer flex-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Completed</div>
                  <div className="text-sm text-muted-foreground">All planned content was covered</div>
                </div>
              </Label>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <RadioGroupItem value="partial" id="partial" />
              <Label htmlFor="partial" className="flex items-center gap-2 cursor-pointer flex-1">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="font-medium">Partially Completed</div>
                  <div className="text-sm text-muted-foreground">Some content was covered, rest pending</div>
                </div>
              </Label>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <RadioGroupItem value="not-taken" id="not-taken" />
              <Label htmlFor="not-taken" className="flex items-center gap-2 cursor-pointer flex-1">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium">Not Taken</div>
                  <div className="text-sm text-muted-foreground">Class was not conducted</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Reason (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this class..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
