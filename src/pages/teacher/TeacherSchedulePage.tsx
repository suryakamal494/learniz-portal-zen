
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTeacherScheduleData } from '@/hooks/useTeacherScheduleData';
import { TeacherScheduleHeader } from '@/components/teacher/schedule/TeacherScheduleHeader';
import { TeacherScheduleFilters } from '@/components/teacher/schedule/TeacherScheduleFilters';
import { TeacherScheduleExportBar } from '@/components/teacher/schedule/TeacherScheduleExportBar';
import { TeacherScheduleTable } from '@/components/teacher/schedule/TeacherScheduleTable';

export default function TeacherSchedulePage() {
  const navigate = useNavigate();
  const {
    data,
    totalItems,
    isLoading,
    filters,
    sort,
    currentPage,
    pageSize,
    totalPages,
    handleFiltersChange,
    handleSortChange,
    clearAllFilters,
    setCurrentPage,
    handlePageSizeChange,
    exportData
  } = useTeacherScheduleData();

  const handleSearchChange = (value: string) => {
    handleFiltersChange({ search: value });
  };

  const handleCreateClick = () => {
    navigate('/teacher/classroom/schedule/create');
  };

  const handleImportClick = () => {
    toast.success('Import schedule clicked');
    // TODO: Open import modal or navigate to import page
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportedData = exportData(format);
    toast.success(`Exported ${exportedData.length} records as ${format.toUpperCase()}`);
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <TeacherScheduleHeader
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        onCreateClick={handleCreateClick}
        onImportClick={handleImportClick}
      />

      {/* Filters */}
      <TeacherScheduleFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearAllFilters}
        totalItems={totalItems}
      />

      {/* Export Bar */}
      <TeacherScheduleExportBar
        totalItems={totalItems}
        onExport={handleExport}
      />

      {/* Schedule Table */}
      <TeacherScheduleTable
        data={data}
        isLoading={isLoading}
        error={null}
        sort={sort}
        onSortChange={handleSortChange}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
