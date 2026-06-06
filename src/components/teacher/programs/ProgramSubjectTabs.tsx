import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProgramSubject } from '@/types/program';

interface Props {
  subjects: ProgramSubject[];
  activeSubjectId: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
}

/**
 * Subject switch tabs — only rendered when batch has 2+ subjects.
 * For a single subject, just renders children directly (no tab chrome).
 */
export function ProgramSubjectTabs({ subjects, activeSubjectId, onChange, children }: Props) {
  if (subjects.length <= 1) {
    return <div>{children}</div>;
  }

  return (
    <Tabs value={activeSubjectId} onValueChange={onChange} className="w-full">
      <TabsList className="bg-white border border-gray-200 rounded-xl p-1 h-auto overflow-x-auto">
        {subjects.map((s) => (
          <TabsTrigger
            key={s.id}
            value={s.id}
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg px-4 py-2"
          >
            {s.name}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeSubjectId} className="mt-4">
        {children}
      </TabsContent>
    </Tabs>
  );
}
