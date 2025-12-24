
import React, { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TeachingStatus } from '@/types/teachingProgress';
import { TeachingStatusModal } from './TeachingStatusModal';
import { toast } from 'sonner';

interface TeachingStatusCellProps {
  status: TeachingStatus;
  notes?: string;
  topic: string;
  classId: string;
  onStatusChange: (classId: string, status: TeachingStatus, notes?: string) => void;
}

export function TeachingStatusCell({
  status,
  notes,
  topic,
  classId,
  onStatusChange
}: TeachingStatusCellProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = (newStatus: TeachingStatus, newNotes?: string) => {
    onStatusChange(classId, newStatus, newNotes);
    toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
  };

  const getStatusLabel = (s: TeachingStatus): string => {
    switch (s) {
      case 'completed': return 'Completed';
      case 'partial': return 'Partial';
      case 'not-taken': return 'Not Taken';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const getStatusConfig = (s: TeachingStatus) => {
    switch (s) {
      case 'completed':
        return {
          icon: CheckCircle,
          variant: 'default' as const,
          className: 'bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20'
        };
      case 'partial':
        return {
          icon: AlertCircle,
          variant: 'outline' as const,
          className: 'bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20'
        };
      case 'not-taken':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          className: 'bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20'
        };
      case 'pending':
      default:
        return {
          icon: Clock,
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  if (status === 'pending') {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="h-8 px-3 text-xs font-medium"
        >
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          Mark Status
        </Button>
        <TeachingStatusModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          currentStatus={status}
          currentNotes={notes}
          onSave={handleSave}
          topic={topic}
        />
      </>
    );
  }

  return (
    <>
      <Badge
        variant={config.variant}
        className={`cursor-pointer ${config.className}`}
        onClick={() => setModalOpen(true)}
      >
        <Icon className="h-3.5 w-3.5 mr-1" />
        {getStatusLabel(status)}
      </Badge>
      <TeachingStatusModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentStatus={status}
        currentNotes={notes}
        onSave={handleSave}
        topic={topic}
      />
    </>
  );
}
