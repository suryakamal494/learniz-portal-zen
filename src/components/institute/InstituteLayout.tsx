import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { InstituteSidebar } from './InstituteSidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const InstituteLayout: React.FC = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <InstituteSidebar />
      <SidebarInset>
        {/* Top header bar with sidebar trigger */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <Button variant="outline" size="sm" asChild>
            <Link to="/teacher">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teacher Panel
            </Link>
          </Button>
        </header>
        
        {/* Main content */}
        <div className="flex-1 min-w-0 w-full bg-background">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
