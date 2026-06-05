
export interface Resource {
  type: 'video' | 'lms' | 'quiz';
  url: string;
  title: string;
}

export interface ScheduleClass {
  id: string;
  date: string;
  time: string;
  duration: string;
  class: string;
  batch: string;
  subject: string;
  topic: string;
  faculty: string;
  resources: Resource[];
}

export interface ScheduleFilters {
  search: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  subject?: string;
  faculty?: string;
  class?: string;
}

export type SortField = 'date' | 'time' | 'class' | 'section' | 'subject' | 'topic' | 'faculty';
export type SortDirection = 'asc' | 'desc';

export interface ScheduleSort {
  field: SortField;
  direction: SortDirection;
}
