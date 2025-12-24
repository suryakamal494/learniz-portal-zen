
import React from 'react';
import { TeacherDesktopScheduleTable } from './TeacherDesktopScheduleTable';
import { TeacherMobileScheduleCard } from './TeacherMobileScheduleCard';
import { TeacherDataWrapper } from '@/components/teacher/ui/TeacherDataWrapper';
import { TeacherTableSkeleton } from '@/components/teacher/ui/TeacherLoadingSkeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeacherScheduleClass, TeacherScheduleSort } from '@/types/teacherSchedule';
import { TeachingStatus } from '@/types/teachingProgress';

interface TeacherScheduleTableProps {
  data: TeacherScheduleClass[];
  isLoading: boolean;
  error: string | null;
  sort: TeacherScheduleSort;
  onSortChange: (field: string) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onTeachingStatusChange?: (classId: string, status: TeachingStatus, notes?: string) => void;
}

export function TeacherScheduleTable({
  data,
  isLoading,
  error,
  sort,
  onSortChange,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onTeachingStatusChange
}: TeacherScheduleTableProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="space-y-6">
      <TeacherDataWrapper
        data={data}
        loading={isLoading}
        error={error}
        emptyTitle="No Schedules Found"
        emptyDescription="No academic schedules match your current filters. Try adjusting your search criteria."
        emptyIcon={<div className="text-4xl">📅</div>}
        loadingComponent={<TeacherTableSkeleton />}
      >
        {(scheduleData) => (
          <>
            <TeacherDesktopScheduleTable
              data={scheduleData}
              sort={sort}
              onSortChange={onSortChange}
              onTeachingStatusChange={onTeachingStatusChange}
            />
            <TeacherMobileScheduleCard 
              data={scheduleData} 
              onTeachingStatusChange={onTeachingStatusChange}
            />
          </>
        )}
      </TeacherDataWrapper>


      {/* Pagination */}
      {!isLoading && data.length > 0 && (
        <div className="glass rounded-lg border border-border/40 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {totalItems} results
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => onPageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
