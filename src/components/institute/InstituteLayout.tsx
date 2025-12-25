import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { InstituteSidebar } from './InstituteSidebar';

export const InstituteLayout: React.FC = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <InstituteSidebar />
      <SidebarInset>
        {/* Top header bar with sidebar trigger */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
        </header>
        
        {/* Main content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
