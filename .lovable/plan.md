
# Understanding Your Requirement

## What You're Asking For

You want to restructure the **Create Program** (formerly "Create Course") page to introduce a **hierarchical content selection system** with two distinct paths:

### Current Flow (to be changed):
```
Create Course → Basic Info → Subject Selection → Custom Subject Builder
```

### New Flow:
```
Create Program → Basic Info → Choose Existing Courses OR Create Custom Course
                                    ↓                          ↓
                              (Pre-made courses          (Existing subject/
                               from Super Admin)         custom subject flow)
```

### Key Requirements:

1. **Rename "Add Course" to "Create Program"** on the main courses page
2. **Two-path selection after Basic Information:**
   - **Option A: Choose Existing Courses** - Select one or more pre-configured courses shared by Super Admin (read-only, with Preview option to see all subjects/chapters/topics)
   - **Option B: Create Custom Course** - The current functionality (use existing subject or create custom subject)

3. **Existing Courses behavior:**
   - Multiple courses can be selected
   - Cannot edit these courses - they are read-only
   - Each course displays as a card with Preview button
   - Preview shows detailed breakdown (subjects, chapters, topics)

4. **Responsive UI built for scale:**
   - Design for 5 subjects with 10 chapters each (50+ chapters total)
   - Scrollable containers with explicit max-heights
   - Expand All / Collapse All controls
   - Won't break with more content

---

# Technical Implementation Plan

## Part 1: Type Definitions Update

### File: `src/types/course.ts` (MODIFY)

Add new types to support the hierarchical program structure:

```typescript
// Add to existing types:

// Pre-made course from Super Admin (read-only)
export interface SharedCourse {
  id: string;
  name: string;
  description?: string;
  sharedBy: string;          // Super Admin name/institute
  className: string;
  subjects: CourseSubjectWithContent[];
  createdAt: string;
}

// Updated form data to support both paths
export interface ProgramFormData {
  title: string;
  className: string;
  fee: number;
  description: string;
  image?: string;
  // Two exclusive content paths
  contentMode: 'existing' | 'custom' | null;
  selectedSharedCourses: SharedCourse[];  // For "Choose Existing Courses"
  customSubjects: CourseSubjectWithContent[];  // For "Create Custom Course"
}
```

---

## Part 2: Mock Data for Shared Courses

### File: `src/data/mockSharedCourses.ts` (NEW)

Create mock data representing courses shared by Super Admin - designed to test UI with large data sets (5 subjects, 10 chapters each):

```typescript
export const mockSharedCourses: SharedCourse[] = [
  {
    id: 'shared-1',
    name: 'NEET Foundation 2025',
    description: 'Comprehensive NEET preparation covering Physics, Chemistry, Biology',
    sharedBy: 'LearnEazy Central',
    className: 'Class 11',
    subjects: [
      { id: 'phy', name: 'Physics', chapters: [...10 chapters] },
      { id: 'chem', name: 'Chemistry', chapters: [...10 chapters] },
      { id: 'bio', name: 'Biology', chapters: [...10 chapters] },
      { id: 'math', name: 'Mathematics', chapters: [...10 chapters] },
      { id: 'eng', name: 'English', chapters: [...10 chapters] },
    ]
  },
  // ... more shared courses
];
```

---

## Part 3: New Components

### Component 1: `SharedCourseCard.tsx` (NEW)

A compact card for displaying a shared course with selection checkbox and preview button.

Layout for small screens:
```text
┌────────────────────────────────────────────────────────┐
│ ☑ NEET Foundation 2025                       [Preview] │
│   Class 11 • 5 Subjects • 50 Chapters                  │
│   Shared by: LearnEazy Central                         │
└────────────────────────────────────────────────────────┘
```

### Component 2: `SharedCoursePreviewModal.tsx` (NEW)

A preview modal showing all content of a shared course with Expand All/Collapse All.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Preview: NEET Foundation 2025                                    [×]    │
├─────────────────────────────────────────────────────────────────────────┤
│ 📚 5 Subjects • 50 Chapters • 200 Topics     [Expand All] [Collapse All]│
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ▼ Physics (10 chapters)                                             │ │
│ │   ├── Mechanics (8 topics)                                          │ │
│ │   │     • Newton's Laws                                             │ │
│ │   │     • Motion                                                    │ │
│ │   ├── Thermodynamics (5 topics)                                     │ │
│ │   ...                                                               │ │
│ │ ▼ Chemistry (10 chapters)                                           │ │
│ │   ...                                                               │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ (Scrollable area with max-height: 55vh)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                          [Close]        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component 3: `SharedCoursesSelector.tsx` (NEW)

Grid of shared course cards with multi-select capability.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Available Courses from Super Admin                                       │
│ Select one or more courses to include in your program                   │
├─────────────────────────────────────────────────────────────────────────┤
│ 🔍 Search courses...                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────┐  ┌────────────────────────┐                  │
│ │ ☑ NEET Foundation 2025 │  │ ☐ JEE Mains 2025       │                  │
│ │   Class 11 • 5 Subjects│  │   Class 11 • 4 Subjects│                  │
│ │   [Preview]            │  │   [Preview]            │                  │
│ └────────────────────────┘  └────────────────────────┘                  │
│ ┌────────────────────────┐  ┌────────────────────────┐                  │
│ │ ☐ Olympiad Foundation  │  │ ☐ Board Topper 2025    │                  │
│ │   Class 10 • 3 Subjects│  │   Class 10 • 5 Subjects│                  │
│ │   [Preview]            │  │   [Preview]            │                  │
│ └────────────────────────┘  └────────────────────────┘                  │
│                                                                         │
│ (Scrollable grid, max-height: 400px, responsive columns)               │
├─────────────────────────────────────────────────────────────────────────┤
│ Selected: 1 course • 5 subjects • 50 chapters                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component 4: `ContentModeSelector.tsx` (NEW)

Toggle between "Choose Existing Courses" and "Create Custom Course" modes.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ How would you like to add content to this program?                      │
│                                                                         │
│ ┌─────────────────────────────────┐  ┌─────────────────────────────────┐│
│ │      Choose Existing Courses    │  │       Create Custom Course      ││
│ │                                 │  │                                 ││
│ │      📋                        │  │      ✨                        ││
│ │                                 │  │                                 ││
│ │   Select pre-configured        │  │   Build your own course by     ││
│ │   courses shared by            │  │   selecting subjects, chapters │││
│ │   Super Admin                  │  │   and topics                   ││
│ │                                 │  │                                 ││
│ │   ● Selected                   │  │   ○ Not Selected               ││
│ └─────────────────────────────────┘  └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 4: Update Existing Pages

### File: `src/pages/teacher/courses/CoursesMainPage.tsx` (MODIFY)

**Changes:**
- Rename button from "ADD COURSE" to "CREATE PROGRAM"
- Update header text accordingly

### File: `src/pages/teacher/courses/CreateCoursePage.tsx` (MODIFY → renamed to CreateProgramPage.tsx)

**Complete restructure:**

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Dashboard > Programs > Create                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ Create Program                                                          │
│ Set up a new program with courses and content                           │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📋 Basic Information                                                │ │
│ │ ┌──────────────────────┐  ┌──────────────────────┐                  │ │
│ │ │ Title *              │  │ Class *              │                  │ │
│ │ │ [________________]   │  │ [Select Class ▼]     │                  │ │
│ │ └──────────────────────┘  └──────────────────────┘                  │ │
│ │ ┌──────────────────────┐  ┌──────────────────────┐                  │ │
│ │ │ Fee                  │  │ Image                │                  │ │
│ │ │ [________________]   │  │ [Choose File]        │                  │ │
│ │ └──────────────────────┘  └──────────────────────┘                  │ │
│ │ Description: [________________________________]                      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📚 Course Content                                                   │ │
│ │                                                                     │ │
│ │ [ContentModeSelector - Choose Existing / Create Custom toggle]      │ │
│ │                                                                     │ │
│ │ ─────────────────────────────────────────────────────────────────── │ │
│ │                                                                     │ │
│ │ IF "Choose Existing Courses" selected:                              │ │
│ │   [SharedCoursesSelector - Grid of course cards]                    │ │
│ │                                                                     │ │
│ │ IF "Create Custom Course" selected:                                 │ │
│ │   [SubjectChapterSelector - Current custom subject flow]            │ │
│ │                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                           [Cancel] [Create Program]     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 5: UI/UX Guidelines for Scalability

### Responsive Grid Patterns
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

### Scrollable Container Specifications
| Container | Min Height | Max Height | Purpose |
|-----------|------------|------------|---------|
| Shared Courses Grid | 200px | 400px | Browse available courses |
| Course Preview Content | 300px | 55vh | View course details |
| Custom Subject Builder | 300px | 55vh | Add/edit chapters |

### Expand/Collapse Controls
- Present on every nested list with >3 items
- "Expand All" / "Collapse All" buttons at section headers
- Default state: collapsed for large lists (>5 items)

### Touch-Friendly Design
- Minimum touch target: 44px
- Card selection: entire card is clickable
- Preview button: separate, clearly visible
- Checkbox + label: both clickable

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/course.ts` | MODIFY | Add SharedCourse, ProgramFormData types |
| `src/data/mockSharedCourses.ts` | CREATE | Mock data for shared courses (5 subjects, 10 chapters each) |
| `src/components/teacher/courses/SharedCourseCard.tsx` | CREATE | Card component for shared course display |
| `src/components/teacher/courses/SharedCoursePreviewModal.tsx` | CREATE | Preview modal for shared course content |
| `src/components/teacher/courses/SharedCoursesSelector.tsx` | CREATE | Grid selector for shared courses |
| `src/components/teacher/courses/ContentModeSelector.tsx` | CREATE | Toggle between existing/custom mode |
| `src/pages/teacher/courses/CoursesMainPage.tsx` | MODIFY | Rename button to "CREATE PROGRAM" |
| `src/pages/teacher/courses/CreateCoursePage.tsx` | MODIFY | Restructure with two-path content selection |

---

## User Flow Diagram

```text
User clicks "CREATE PROGRAM"
         │
         ▼
┌─────────────────────────┐
│   Basic Information     │
│   (Title, Class, Fee)   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              Select Content Mode                             │
│                                                              │
│  ┌─────────────────────┐      ┌─────────────────────┐       │
│  │ Choose Existing     │  OR  │ Create Custom       │       │
│  │ Courses             │      │ Course              │       │
│  └──────────┬──────────┘      └──────────┬──────────┘       │
└─────────────│───────────────────────────│───────────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────┐    ┌─────────────────────────────┐
│ Grid of Shared Courses  │    │ Use Existing Subject        │
│ (Multi-select)          │    │ OR                          │
│ [Preview each course]   │    │ Create Custom Subject       │
│                         │    │ (Existing functionality)    │
└────────────┬────────────┘    └──────────────┬──────────────┘
             │                                │
             └────────────────┬───────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Submit Program     │
                    │  (Validation)       │
                    └─────────────────────┘
```

---

## Technical Implementation Order

1. **Types first** - Update course.ts with new interfaces
2. **Mock data** - Create mockSharedCourses.ts with realistic test data
3. **Atomic components** - SharedCourseCard, ContentModeSelector
4. **Composite components** - SharedCoursePreviewModal, SharedCoursesSelector
5. **Page updates** - CoursesMainPage (rename button), CreateCoursePage (restructure)
6. **Testing** - Verify with 5 subjects, 10 chapters each to ensure UI doesn't break

