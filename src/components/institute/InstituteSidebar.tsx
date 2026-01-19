import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap,
  FileText,
  Calendar,
  Activity,
  ArrowLeft,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Snapshot',
    url: '/institute',
    icon: LayoutDashboard,
    exact: true
  },
  {
    title: 'Teachers',
    url: '/institute/teachers',
    icon: Users,
    exact: false
  },
  {
    title: 'Subjects',
    url: '/institute/subjects',
    icon: BookOpen,
    exact: false
  },
  {
    title: 'Classes',
    url: '/institute/classes',
    icon: GraduationCap,
    exact: true
  },
  {
    title: 'Students',
    url: '/institute/students',
    icon: Users,
    exact: false
  },
  {
    title: 'Grand Tests',
    url: '/institute/grand-tests',
    icon: FileText,
    exact: false
  },
  {
    title: 'Schedule Tracking',
    url: '/institute/schedule-tracking',
    icon: Calendar,
    exact: false
  },
  {
    title: 'Learning Response',
    url: '/institute/learning-response',
    icon: Activity,
    exact: false
  }
];

export const InstituteSidebar: React.FC = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (item: typeof navigationItems[0]) => {
    if (item.exact) {
      return location.pathname === item.url;
    }
    return location.pathname.startsWith(item.url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      {/* Header */}
      <SidebarHeader className="border-b">
        <div className={cn(
          "flex items-center gap-2 px-2 py-2",
          isCollapsed && "justify-center"
        )}>
          <Building2 className="h-6 w-6 text-primary shrink-0" />
          {!isCollapsed && (
            <span className="font-semibold text-foreground">Academic Insights</span>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const active = isActive(item);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to Teacher Panel">
              <Link to="/teacher" className="text-primary">
                <ArrowLeft className="h-4 w-4" />
                <span>Teacher Panel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
