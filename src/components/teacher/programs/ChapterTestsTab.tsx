import React, { useState } from 'react';
import { Plus, LibraryBig, Eye, EyeOff, FileQuestion, Clock, Award } from 'lucide-react';
import type { ChapterTest } from '@/types/program';
import { AddTestFromLibraryModal } from './AddTestFromLibraryModal';

interface Props {
  chapterId: string;
  tests: ChapterTest[];
  onPreviewTest: (testId: string) => void;
  onToggleEnabled: (testId: string) => void;
  onAddFromLibrary: (chapterId: string, tests: ChapterTest[]) => void;
  onCreateTest: (chapterId: string) => void;
}

export function ChapterTestsTab({
  chapterId,
  tests,
  onPreviewTest,
  onToggleEnabled,
  onAddFromLibrary,
  onCreateTest,
}: Props) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const adminCount = tests.filter((t) => t.source === 'admin').length;
  const mineCount = tests.length - adminCount;
  const disabledCount = tests.filter((t) => !t.enabledForStudents).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs text-gray-600">
          <span className="font-semibold text-gray-900">{tests.length} tests</span>
          <span className="text-gray-500">
            {' · '}
            {adminCount} from admin
            {mineCount > 0 ? ` · ${mineCount} added by you` : ''}
            {disabledCount > 0 ? ` · ${disabledCount} hidden from students` : ''}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-white hover:border-blue-300 hover:text-blue-700 transition-colors"
          >
            <LibraryBig className="h-3.5 w-3.5" />
            Add from library
          </button>
          <button
            type="button"
            onClick={() => onCreateTest(chapterId)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Create test
          </button>
        </div>
      </div>

      {tests.length === 0 ? (
        <p className="text-sm text-gray-500 py-3">No tests shared for this chapter yet.</p>
      ) : (
        <ul className="space-y-2">
          {tests.map((t) => {
            const muted = !t.enabledForStudents;
            return (
              <li
                key={t.id}
                className={`bg-white rounded-lg border px-3 py-2.5 flex items-center gap-3 ${
                  muted ? 'border-gray-200 opacity-70' : 'border-gray-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium truncate ${muted ? 'text-gray-500' : 'text-gray-900'}`}>
                      {t.title}
                    </p>
                    <SourceBadge source={t.source} />
                    {muted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                        <EyeOff className="h-3 w-3" />
                        Hidden from students
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <FileQuestion className="h-3 w-3" />
                      {t.questionCount} Q
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t.durationMinutes}m
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {t.totalMarks} marks
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onPreviewTest(t.id)}
                    className="text-[11px] font-medium px-2.5 py-1.5 rounded-md text-blue-700 hover:bg-blue-50 inline-flex items-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleEnabled(t.id)}
                    className={`text-[11px] font-medium px-2.5 py-1.5 rounded-md inline-flex items-center gap-1 ${
                      muted
                        ? 'text-emerald-700 hover:bg-emerald-50'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {muted ? (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        Enable
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        Disable
                      </>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AddTestFromLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        chapterId={chapterId}
        existingIds={new Set(tests.map((t) => t.id))}
        onAdd={(picked) => {
          onAddFromLibrary(chapterId, picked);
          setLibraryOpen(false);
        }}
      />
    </div>
  );
}

function SourceBadge({ source }: { source: ChapterTest['source'] }) {
  const map = {
    admin: { label: 'Admin', cls: 'bg-violet-50 text-violet-700 border-violet-100' },
    library: { label: 'My library', cls: 'bg-sky-50 text-sky-700 border-sky-100' },
    created: { label: 'Created', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  } as const;
  const m = map[source];
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.cls}`}>
      {m.label}
    </span>
  );
}
