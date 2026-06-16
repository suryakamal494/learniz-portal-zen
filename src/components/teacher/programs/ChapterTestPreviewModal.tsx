import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileQuestion, Clock, Award, CheckCircle2 } from 'lucide-react';
import type { ChapterTest } from '@/types/program';
import { getQuestionsForTest } from '@/data/mockChapterTests';

interface Props {
  open: boolean;
  onClose: () => void;
  test: ChapterTest | null;
}

export function ChapterTestPreviewModal({ open, onClose, test }: Props) {
  if (!test) return null;
  const questions = getQuestionsForTest(test);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold text-gray-900">{test.title}</DialogTitle>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1">
              <FileQuestion className="h-3.5 w-3.5" /> {test.questionCount} questions
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {test.durationMinutes} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> {test.totalMarks} marks
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50/50">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900">
                <span className="text-gray-500 mr-2">Q{idx + 1}.</span>
                {q.questionText}
              </p>
              <ul className="mt-3 space-y-1.5">
                {q.options.map((opt, i) => {
                  const correct = i === q.correctAnswerIndex;
                  return (
                    <li
                      key={i}
                      className={`text-xs px-3 py-2 rounded-md border flex items-center gap-2 ${
                        correct
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-semibold">{opt.label}.</span>
                      <span className="flex-1">{opt.text}</span>
                      {correct && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Correct
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-500">
                <span className="px-1.5 py-0.5 rounded bg-gray-100 capitalize">{q.difficulty}</span>
                <span className="px-1.5 py-0.5 rounded bg-gray-100">{q.category}</span>
                <span>{q.marks} marks</span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
