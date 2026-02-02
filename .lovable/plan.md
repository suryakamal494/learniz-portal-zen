

# Implementation Plan: Configure Teaching Hours Feature

## Overview

Add a new action "Configure Hours" in the courses table that opens a modal where institutions can enter teaching hours for each topic. Chapter and subject hours are auto-calculated from topic totals.

---

## Part 1: Type Definitions Update

### File: `src/types/course.ts` (MODIFY)

Add `hours` field to CourseTopic and calculated fields for aggregation:

```typescript
export interface CourseTopic {
  id: string;
  name: string;
  originalName?: string;
  sourceSubjectId?: string;
  isSelected?: boolean;
  hours?: number;  // NEW: Teaching hours for this topic
}

// Optional: Add computed types for display
export interface TopicWithHours extends CourseTopic {
  hours: number;
}

export interface ChapterHoursSummary {
  chapterId: string;
  chapterName: string;
  totalHours: number;
  topics: TopicWithHours[];
}

export interface SubjectHoursSummary {
  subjectId: string;
  subjectName: string;
  totalHours: number;
  chapters: ChapterHoursSummary[];
}
```

---

## Part 2: New Components

### Component 1: `ConfigureHoursModal.tsx` (NEW)

**Purpose**: Main modal for configuring hours - displays all subjects/chapters/topics with input fields.

**Wireframe**:
```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Configure Teaching Hours                                              [×]  │
│ Disha 2 - Class 6                                                          │
├────────────────────────────────────────────────────────────────────────────┤
│ Set planned teaching hours for each topic. Chapter and subject totals     │
│ will be calculated automatically.                                          │
│                                                                            │
│ Total Course Hours: 45.5 hrs                                              │
│                                           [Expand All] [Collapse All]      │
├────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ ▼ Physics                                               Total: 15 hrs │ │
│ │   ┌──────────────────────────────────────────────────────────────────┐ │ │
│ │   │ ▼ Mechanics                                          12 hrs     │ │ │
│ │   │   ┌──────────────────────────────────────────────┐              │ │ │
│ │   │   │ Newton's Laws of Motion          [  2  ] hrs │              │ │ │
│ │   │   │ Equations of Motion              [  3  ] hrs │              │ │ │
│ │   │   │ Friction and Its Types           [  2  ] hrs │              │ │ │
│ │   │   │ Work, Energy and Power           [  2.5] hrs │              │ │ │
│ │   │   │ Momentum and Collisions          [  2.5] hrs │              │ │ │
│ │   │   └──────────────────────────────────────────────┘              │ │ │
│ │   └──────────────────────────────────────────────────────────────────┘ │ │
│ │   ┌──────────────────────────────────────────────────────────────────┐ │ │
│ │   │ ▶ Thermodynamics                                      3 hrs     │ │ │
│ │   └──────────────────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ ▶ Chemistry                                              Total: 12 hrs │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ ▶ Biology                                                Total: 18.5 hrs│ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│ (Scrollable area - max-height: 55vh, min-height: 300px)                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                              [Cancel]  [Save Hours]        │
└────────────────────────────────────────────────────────────────────────────┘
```

**Features**:
- Modal size: `max-w-4xl` with `max-h-[90vh]`
- Scrollable content area with `min-h-[300px]` and `max-h-[55vh]`
- Expand All / Collapse All controls
- Subjects and chapters are collapsible
- Topics show inline number input (0.5 step for half hours)
- Real-time calculation of chapter and subject totals
- Total course hours displayed at top

### Component 2: `SubjectHoursAccordion.tsx` (NEW)

**Purpose**: Collapsible subject section showing all chapters and topics with hours inputs.

**Props**:
```typescript
interface SubjectHoursAccordionProps {
  subject: CourseSubjectWithContent;
  isExpanded: boolean;
  onToggle: () => void;
  onTopicHoursChange: (chapterId: string, topicId: string, hours: number) => void;
  subjectTotalHours: number;
}
```

### Component 3: `ChapterHoursRow.tsx` (NEW)

**Purpose**: Collapsible chapter row with topics list.

**Wireframe (expanded)**:
```text
┌──────────────────────────────────────────────────────────────────────┐
│ ▼ Chapter Name                                         Total: 8 hrs  │
├──────────────────────────────────────────────────────────────────────┤
│   Topic 1 Name                                    [  2.0 ] hrs       │
│   Topic 2 Name                                    [  1.5 ] hrs       │
│   Topic 3 Name                                    [  2.0 ] hrs       │
│   Topic 4 Name                                    [  2.5 ] hrs       │
└──────────────────────────────────────────────────────────────────────┘
```

### Component 4: `TopicHoursInput.tsx` (NEW)

**Purpose**: Single topic row with inline hours input.

**Features**:
- Number input with step 0.5 (allows half hours)
- Minimum value: 0
- Maximum value: 24 (practical limit)
- Shows "hrs" suffix
- Compact design for mobile

**Wireframe**:
```text
┌────────────────────────────────────────────────────────────────┐
│  📄 Newton's Laws of Motion                    [  2.0  ] hrs   │
└────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Update Courses Main Page

### File: `src/pages/teacher/courses/CoursesMainPage.tsx` (MODIFY)

**Changes**:

1. Add new state for hours configuration modal
2. Add "Configure Hours" option to Actions dropdown
3. Import and render ConfigureHoursModal

**Updated Actions Dropdown**:
```text
┌──────────────────┐
│ 👁 Preview       │
│ ⏱ Configure Hours│  ← NEW
│ ✏️ Edit          │
│ 🗑️ Delete        │
└──────────────────┘
```

---

## Part 4: Update Mock Data

### File: `src/data/mockCourses.ts` (MODIFY)

Add sample `hours` values to some topics to demonstrate the feature:

```typescript
topics: [
  { id: 'bio-t-1', name: 'Cell Structure and Function', isSelected: true, hours: 2 },
  { id: 'bio-t-2', name: 'Cell Division - Mitosis', isSelected: true, hours: 1.5 },
]
```

---

## Part 5: Utility Functions

### File: `src/utils/courseHoursUtils.ts` (NEW)

**Purpose**: Helper functions for hours calculations

```typescript
// Calculate total hours for a chapter (sum of topic hours)
export function getChapterHours(chapter: CourseChapter): number {
  return chapter.topics.reduce((sum, topic) => sum + (topic.hours || 0), 0);
}

// Calculate total hours for a subject (sum of chapter hours)
export function getSubjectHours(subject: CourseSubjectWithContent): number {
  return subject.chapters.reduce((sum, ch) => sum + getChapterHours(ch), 0);
}

// Calculate total hours for a course
export function getCourseHours(course: Course): number {
  return course.subjects.reduce((sum, s) => sum + getSubjectHours(s), 0);
}

// Format hours display (e.g., "2.5 hrs" or "2 hrs")
export function formatHours(hours: number): string {
  return hours % 1 === 0 ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
}
```

---

## Part 6: UI/UX Specifications

### Responsive Design

| Screen Size | Modal Width | Columns | Topic Input Width |
|-------------|-------------|---------|-------------------|
| Mobile (<640px) | Full width | 1 | 60px |
| Tablet (640-1024px) | 90% | 1 | 70px |
| Desktop (>1024px) | max-w-4xl | 1 | 80px |

### Scroll Containers

| Container | Min Height | Max Height |
|-----------|------------|------------|
| Modal content | 300px | 55vh |
| Each subject (expanded) | auto | 400px |

### Touch-Friendly Design
- Input fields: `h-9` (36px)
- Chapter/Subject rows: `min-h-[48px]`
- All clickable areas: minimum 44px touch target

### Keyboard Accessibility
- Tab through all input fields
- Enter to save
- Escape to cancel

---

## Part 7: Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/course.ts` | MODIFY | Add `hours?: number` to CourseTopic |
| `src/utils/courseHoursUtils.ts` | CREATE | Helper functions for hours calculations |
| `src/components/teacher/courses/TopicHoursInput.tsx` | CREATE | Single topic row with hours input |
| `src/components/teacher/courses/ChapterHoursRow.tsx` | CREATE | Collapsible chapter with topics list |
| `src/components/teacher/courses/SubjectHoursAccordion.tsx` | CREATE | Collapsible subject section |
| `src/components/teacher/courses/ConfigureHoursModal.tsx` | CREATE | Main modal component |
| `src/pages/teacher/courses/CoursesMainPage.tsx` | MODIFY | Add "Configure Hours" action |
| `src/data/mockCourses.ts` | MODIFY | Add sample hours data |

---

## Part 8: Technical Implementation Order

1. **Types & Utils** - Add hours field to types, create utility functions
2. **Atomic Components** - TopicHoursInput (smallest unit)
3. **Composite Components** - ChapterHoursRow, SubjectHoursAccordion
4. **Main Modal** - ConfigureHoursModal (combines all)
5. **Page Integration** - Add action to CoursesMainPage
6. **Mock Data** - Add sample hours for demonstration
7. **Testing** - Verify with courses having 5 subjects, 10 chapters each

---

## Scalability Considerations

### Designed for Scale (5 subjects × 10 chapters × 10 topics = 500 topics):
- Collapsible by default (only expanded on demand)
- Virtual scrolling consideration for very large courses
- Debounced input updates to prevent re-render storm
- Local state for hours, only sync to parent on save

### Performance Optimizations:
- `React.memo` for TopicHoursInput to prevent unnecessary re-renders
- Batch state updates on save
- Lazy expansion of nested content

