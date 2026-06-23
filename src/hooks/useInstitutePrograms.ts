import { useSyncExternalStore } from 'react';
import { MOCK_FACULTY, MOCK_INSTITUTE_PROGRAMS } from '@/data/mockInstitutePrograms';
import {
  InstituteFaculty,
  InstituteProgram,
  ScheduleConfig,
  ScheduleSlot,
} from '@/types/instituteProgram';

/** Session-only in-memory store. Survives navigation, lost on reload. */

let programs: InstituteProgram[] = JSON.parse(JSON.stringify(MOCK_INSTITUTE_PROGRAMS));
let faculty: InstituteFaculty[] = [...MOCK_FACULTY];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

const store = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getPrograms: () => programs,
  getFaculty: () => faculty,
};

export function useInstitutePrograms() {
  const list = useSyncExternalStore(store.subscribe, store.getPrograms, store.getPrograms);
  return list;
}

export function useFaculty() {
  return useSyncExternalStore(store.subscribe, store.getFaculty, store.getFaculty);
}

export function useInstituteProgram(id: string | undefined): InstituteProgram | undefined {
  const list = useInstitutePrograms();
  return list.find((p) => p.id === id);
}

export function updateProgram(id: string, mut: (p: InstituteProgram) => InstituteProgram) {
  programs = programs.map((p) => (p.id === id ? mut(p) : p));
  emit();
}

export function setSchedule(programId: string, config: ScheduleConfig) {
  updateProgram(programId, (p) => ({ ...p, schedule: config }));
}

export function setGeneratedSlots(programId: string, slots: ScheduleSlot[]) {
  updateProgram(programId, (p) => ({ ...p, generatedSlots: slots }));
}

export function addFaculty(name: string, subjectId?: string): InstituteFaculty {
  const f: InstituteFaculty = { id: `fac-${Date.now()}`, name, subjectId };
  faculty = [...faculty, f];
  emit();
  return f;
}

export function addTopic(programId: string, subjectId: string, chapterId: string, name: string) {
  updateProgram(programId, (p) => ({
    ...p,
    subjects: p.subjects.map((s) =>
      s.id !== subjectId
        ? s
        : {
            ...s,
            chapters: s.chapters.map((c) =>
              c.id !== chapterId
                ? c
                : { ...c, topics: [...c.topics, { id: `t-${Date.now()}`, name, hours: 0 }] },
            ),
          },
    ),
  }));
}

export function addChapter(programId: string, subjectId: string, name: string) {
  updateProgram(programId, (p) => ({
    ...p,
    subjects: p.subjects.map((s) =>
      s.id !== subjectId ? s : { ...s, chapters: [...s.chapters, { id: `c-${Date.now()}`, name, topics: [] }] },
    ),
  }));
}

export function updateTopicHours(programId: string, topicId: string, hours: number) {
  updateProgram(programId, (p) => ({
    ...p,
    subjects: p.subjects.map((s) => ({
      ...s,
      chapters: s.chapters.map((c) => ({
        ...c,
        topics: c.topics.map((t) => (t.id === topicId ? { ...t, hours: Math.max(0, hours) } : t)),
      })),
    })),
  }));
}

export function setChapterTopicsHours(programId: string, chapterId: string, hours: number) {
  updateProgram(programId, (p) => ({
    ...p,
    subjects: p.subjects.map((s) => ({
      ...s,
      chapters: s.chapters.map((c) =>
        c.id !== chapterId ? c : { ...c, topics: c.topics.map((t) => ({ ...t, hours: Math.max(0, hours) })) },
      ),
    })),
  }));
}

export function finaliseHours(programId: string, value: boolean) {
  updateProgram(programId, (p) => ({ ...p, hoursFinalised: value }));
}
