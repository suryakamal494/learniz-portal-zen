import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSections } from '@/hooks/useSection';

export type WorkspaceTab = 'timetable' | 'day' | 'schedule';

const LS_KEY = 'schedule-workspace-state:v1';

interface Persisted {
  sectionId?: string;
  windowId?: string;
  compareOn?: boolean;
  compareSectionId?: string;
}

function readPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writePersisted(p: Persisted) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export function useScheduleWorkspace() {
  const allSections = useSections();
  // Only sections that have at least one *published* window surface here.
  const sections = allSections
    .map((s) => ({ ...s, windows: s.windows.filter((w) => (w.status ?? 'draft') === 'published') }))
    .filter((s) => s.windows.length > 0);

  const [searchParams, setSearchParams] = useSearchParams();
  const persisted = readPersisted();

  const initialSectionId =
    (searchParams.get('sectionId') && sections.some((s) => s.id === searchParams.get('sectionId'))
      ? searchParams.get('sectionId')!
      : undefined) ??
    (persisted.sectionId && sections.some((s) => s.id === persisted.sectionId)
      ? persisted.sectionId
      : sections[0]?.id);

  const [sectionId, setSectionIdState] = useState<string | undefined>(initialSectionId);
  const section = sections.find((s) => s.id === sectionId);

  const initialWindowId =
    (searchParams.get('windowId') && section?.windows.some((w) => w.id === searchParams.get('windowId'))
      ? searchParams.get('windowId')!
      : undefined) ??
    (persisted.windowId && section?.windows.some((w) => w.id === persisted.windowId)
      ? persisted.windowId
      : section?.windows[section.windows.length - 1]?.id);

  const [windowId, setWindowIdState] = useState<string | undefined>(initialWindowId);

  const initialTab = (searchParams.get('tab') as WorkspaceTab) ?? 'timetable';
  const [tab, setTabState] = useState<WorkspaceTab>(
    initialTab === 'schedule' || initialTab === 'day' ? initialTab : 'timetable',
  );

  const [compareOn, setCompareOn] = useState<boolean>(!!persisted.compareOn);
  const [compareSectionId, setCompareSectionId] = useState<string | undefined>(
    persisted.compareSectionId,
  );

  // Ensure section + window remain valid as publish state changes.
  useEffect(() => {
    if (sectionId && !sections.some((s) => s.id === sectionId)) {
      setSectionIdState(sections[0]?.id);
    }
  }, [sections, sectionId]);
  useEffect(() => {
    if (!section) return;
    if (!section.windows.some((w) => w.id === windowId)) {
      setWindowIdState(section.windows[section.windows.length - 1]?.id);
    }
  }, [section, windowId]);

  // Sync URL + persistence.
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (sectionId) params.set('sectionId', sectionId); else params.delete('sectionId');
    if (windowId) params.set('windowId', windowId); else params.delete('windowId');
    params.set('tab', tab);
    setSearchParams(params, { replace: true });
    writePersisted({ sectionId, windowId, compareOn, compareSectionId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, windowId, tab, compareOn, compareSectionId]);

  const setSectionId = useCallback((id: string) => {
    setSectionIdState(id);
    const s = sections.find((x) => x.id === id);
    setWindowIdState(s?.windows[s.windows.length - 1]?.id);
  }, [sections]);

  const setWindowId = useCallback((id: string) => setWindowIdState(id), []);
  const setTab = useCallback((t: WorkspaceTab) => setTabState(t), []);

  const window = section?.windows.find((w) => w.id === windowId);

  return {
    sections,
    section,
    windowId,
    window,
    tab,
    setSectionId,
    setWindowId,
    setTab,
    compareOn,
    setCompareOn,
    compareSectionId,
    setCompareSectionId,
  };
}
