import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimeFilterOption } from '@/types/instituteAnalytics';

interface TimeFilterBarProps {
  value: TimeFilterOption;
  onChange: (value: TimeFilterOption) => void;
  className?: string;
}

export function TimeFilterBar({ value, onChange, className }: TimeFilterBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={(v) => onChange(v as TimeFilterOption)}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Time Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-time">
            <span className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              All Time
            </span>
          </SelectItem>
          <SelectItem value="7-days">
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Last 7 Days
            </span>
          </SelectItem>
          <SelectItem value="30-days">
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Last 30 Days
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
