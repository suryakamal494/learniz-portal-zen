
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { AttendanceRecord } from '@/data/mockAttendanceData';
import { AttendanceDetailModal } from './AttendanceDetailModal';

interface AttendanceTableProps {
  data: AttendanceRecord[];
  isLoading?: boolean;
}

export function AttendanceTable({ data, isLoading }: AttendanceTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewAttendance = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleDelete = (record: AttendanceRecord) => {
    // Implement delete confirmation dialog
    console.log('Delete record:', record.id);
  };

  const getAttendanceBadge = (present: number, total: number) => {
    const rate = (present / total) * 100;
    if (rate >= 90) return { variant: 'default' as const, color: 'text-green-600' };
    if (rate >= 70) return { variant: 'secondary' as const, color: 'text-yellow-600' };
    return { variant: 'destructive' as const, color: 'text-red-600' };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-foreground mb-2">No attendance records found</h3>
        <p className="text-muted-foreground">
          No attendance data matches your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Time</TableHead>
              <TableHead className="font-semibold">Class Title</TableHead>
              <TableHead className="font-semibold">Section</TableHead>
              <TableHead className="font-semibold text-center">Attendance</TableHead>
              <TableHead className="font-semibold text-center">Absents</TableHead>
              <TableHead className="font-semibold text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record) => {
              const attendanceBadge = getAttendanceBadge(record.presentStudents, record.totalStudents);
              
              return (
                <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>{record.time}</TableCell>
                  <TableCell className="font-medium">{record.classTitle}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {record.batch}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`font-semibold ${attendanceBadge.color}`}>
                        {record.presentStudents}/{record.totalStudents}
                      </span>
                      <Badge variant={attendanceBadge.variant} className="text-xs">
                        {Math.round((record.presentStudents / record.totalStudents) * 100)}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-semibold ${record.absentStudents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {record.absentStudents}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleViewAttendance(record)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Attendance
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(record)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AttendanceDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        record={selectedRecord}
      />
    </>
  );
}
