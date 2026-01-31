import React from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const DashboardHeader: React.FC = () => {
  const today = new Date();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-green-700">LIVE SYSTEM STATUS</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Institute Dashboard</h1>
        <p className="text-muted-foreground text-sm">Manage your academic operations and track performance</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-foreground">
            {format(today, 'EEEE, MMM d')}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(today, 'yyyy')}
          </p>
        </div>
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">AD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};
