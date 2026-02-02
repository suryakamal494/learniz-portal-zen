import React, { memo } from 'react';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';

interface TopicHoursInputProps {
  topicId: string;
  topicName: string;
  hours: number;
  onChange: (topicId: string, hours: number) => void;
}

export const TopicHoursInput = memo(function TopicHoursInput({
  topicId,
  topicName,
  hours,
  onChange,
}: TopicHoursInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    // Clamp between 0 and 24
    const clampedValue = Math.min(Math.max(value, 0), 24);
    onChange(topicId, clampedValue);
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 hover:bg-muted/30 rounded-md transition-colors">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-foreground truncate">{topicName}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Input
          type="number"
          min={0}
          max={24}
          step={0.5}
          value={hours || ''}
          onChange={handleChange}
          placeholder="0"
          className="w-16 sm:w-20 h-9 text-center text-sm"
        />
        <span className="text-xs text-muted-foreground w-6">hrs</span>
      </div>
    </div>
  );
});
