import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StudentTestResult, ChapterTestType } from '@/types/studentReport';
import { TestTypeSummary } from './TestTypeSummary';
import { TestListModal } from './TestListModal';
import { 
  FileText, 
  BookOpen, 
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChapterTestTabsProps {
  testsByType: {
    liveAssessments: StudentTestResult[];
    lmsQuizzes: StudentTestResult[];
    assignments: StudentTestResult[];
  };
  chapterName: string;
}

export const ChapterTestTabs: React.FC<ChapterTestTabsProps> = ({ testsByType, chapterName }) => {
  const [modalState, setModalState] = useState<{
    open: boolean;
    testType: ChapterTestType;
    tests: StudentTestResult[];
  }>({
    open: false,
    testType: 'live_assessment',
    tests: []
  });

  const getTabData = () => [
    { 
      id: 'live_assessment' as ChapterTestType, 
      label: 'Live Assessment', 
      icon: FileText,
      tests: testsByType.liveAssessments,
      color: 'text-blue-600'
    },
    { 
      id: 'lms_quiz' as ChapterTestType, 
      label: 'LMS Quiz', 
      icon: BookOpen,
      tests: testsByType.lmsQuizzes,
      color: 'text-purple-600'
    },
    { 
      id: 'assignment' as ChapterTestType, 
      label: 'Assignments', 
      icon: ClipboardList,
      tests: testsByType.assignments,
      color: 'text-green-600'
    },
  ];

  const tabs = getTabData();

  const getTabStyles = (tabId: ChapterTestType) => {
    switch (tabId) {
      case 'live_assessment':
        return {
          base: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
          active: 'data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border-blue-500',
          badge: 'bg-blue-100 text-blue-600 data-[state=active]:bg-blue-400 data-[state=active]:text-white'
        };
      case 'lms_quiz':
        return {
          base: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100',
          active: 'data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:border-purple-500',
          badge: 'bg-purple-100 text-purple-600 data-[state=active]:bg-purple-400 data-[state=active]:text-white'
        };
      case 'assignment':
        return {
          base: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
          active: 'data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500',
          badge: 'bg-green-100 text-green-600 data-[state=active]:bg-green-400 data-[state=active]:text-white'
        };
      default:
        return {
          base: 'border-gray-200 bg-gray-50 text-gray-700',
          active: 'data-[state=active]:bg-gray-500 data-[state=active]:text-white',
          badge: 'bg-gray-100 text-gray-600'
        };
    }
  };

  const handleViewAll = (testType: ChapterTestType, tests: StudentTestResult[]) => {
    setModalState({
      open: true,
      testType,
      tests
    });
  };

  return (
    <>
      <Tabs defaultValue="live_assessment" className="w-full">
        <TabsList className="w-full justify-start gap-2 h-auto flex-wrap bg-transparent p-0">
          {tabs.map((tab) => {
            const styles = getTabStyles(tab.id);
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className={cn(
                  "flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-lg border transition-all shadow-sm",
                  styles.base,
                  styles.active
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline font-medium">{tab.label}</span>
                <span className="sm:hidden font-medium">{tab.label.split(' ')[0]}</span>
                <Badge variant="secondary" className={cn("ml-1 h-5 text-xs font-semibold", styles.badge)}>
                  {tab.tests.length}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            <TestTypeSummary 
              testType={tab.id}
              tests={tab.tests}
              onViewAll={() => handleViewAll(tab.id, tab.tests)}
            />
          </TabsContent>
        ))}
      </Tabs>

      <TestListModal
        open={modalState.open}
        onOpenChange={(open) => setModalState(prev => ({ ...prev, open }))}
        tests={modalState.tests}
        testType={modalState.testType}
        chapterName={chapterName}
      />
    </>
  );
};
