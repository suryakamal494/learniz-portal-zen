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
  Building2,
  CalendarRange,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const moduleGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Academic Insights',
    items: [
      { title: 'Dashboard', url: '/institute/insights/dashboard', icon: LayoutDashboard, exact: true },
      { title: 'Overview', url: '/institute/insights', icon: Activity, exact: true },
      { title: 'Teachers', url: '/institute/insights/teachers', icon: Users },
      { title: 'Subjects', url: '/institute/insights/subjects', icon: BookOpen },
      { title: 'Classes', url: '/institute/insights/classes', icon: GraduationCap, exact: true },
      { title: 'Students', url: '/institute/insights/students', icon: Users },
      { title: 'Grand Tests', url: '/institute/insights/grand-tests', icon: FileText },
      { title: 'Schedule Tracking', url: '/institute/insights/schedule-tracking', icon: Calendar },
      { title: 'Learning Response', url: '/institute/insights/learning-response', icon: Activity },
    ],
  },
  {
    label: 'Programs',
    items: [
      { title: 'Programs', url: '/institute/programs', icon: CalendarRange },
    ],
  },
  {
    label: 'Exam Module',
    items: [
      { title: 'Exams', url: '/institute/exams', icon: ClipboardList },
    ],
  },
];

export const InstituteSidebar: React.FC = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (item: NavItem) =>
    item.exact ? location.pathname === item.url : location.pathname.startsWith(item.url);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-2',
            isCollapsed && 'justify-center'
          )}
        >
          <Building2 className="h-6 w-6 text-primary shrink-0" />
          {!isCollapsed && (
            <span className="font-semibold text-foreground">Institute Panel</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {moduleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
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
        ))}
      </SidebarContent>

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
