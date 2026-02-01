
# Plan: Course Creation, Preview, and Edit Functionality

## Overview
Implement a complete course management system where instructors can:
1. Create courses by selecting subjects, then chapters within subjects, then topics within chapters
2. Preview courses in a hierarchical tree view showing all content
3. Edit courses to add/remove chapters and topics

---

## Part 1: Update Type Definitions

### File: `src/types/course.ts` (MODIFY)

Extend the existing types to support the hierarchical structure:

```typescript
// Add new types for course structure
export interface CourseTopic {
  id: string;
  name: string;
  isSelected: boolean;
}

export interface CourseChapter {
  id: string;
  name: string;
  isSelected: boolean;
  topics: CourseTopic[];
}

export interface CourseSubjectWithContent {
  id: string;
  name: string;
  institute: string;
  isOwner: boolean;
  chapters: CourseChapter[];
}

// Extended Course type
export interface Course {
  id: string;
  serialNumber: number;
  title: string;              // NEW: Course title
  className: string;
  programName: string;
  fee?: number;               // NEW: Course fee
  description?: string;       // NEW: Course description
  image?: string;             // NEW: Course image
  subjects: CourseSubjectWithContent[];  // ENHANCED: Now includes chapters & topics
  createdAt: string;
  updatedAt: string;
}

// Form data for creation/edit
export interface CourseFormData {
  title: string;
  className: string;
  fee: number;
  description: string;
  image?: string;
  subjects: CourseSubjectWithContent[];
}
```

---

## Part 2: Create Extended Mock Data

### File: `src/data/mockCourseContent.ts` (NEW)

Create comprehensive mock data for subjects with their chapters and topics:

```typescript
// Each subject has multiple chapters
// Each chapter has multiple topics
// Example structure for Physics:
{
  id: 'physics-1',
  name: 'Physics',
  institute: 'LearnEazy Inst',
  chapters: [
    {
      id: 'ch-1',
      name: 'Mechanics',
      topics: [
        { id: 't-1', name: "Newton's Laws" },
        { id: 't-2', name: 'Motion Equations' },
        { id: 't-3', name: 'Friction' },
        { id: 't-4', name: 'Circular Motion' },
        { id: 't-5', name: 'Work and Energy' }
      ]
    },
    {
      id: 'ch-2',
      name: 'Thermodynamics',
      topics: [
        { id: 't-6', name: 'Heat Transfer' },
        { id: 't-7', name: 'Gas Laws' },
        { id: 't-8', name: 'Entropy' }
      ]
    },
    // ... more chapters
  ]
}
```

Will include 5-6 subjects with 8-10 chapters each, and 3-6 topics per chapter.

---

## Part 3: Create Course Page

### File: `src/pages/teacher/courses/CreateCoursePage.tsx` (NEW)

**Layout Structure:**

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Home > Dashboard > Courses > Create                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Create Course                                                       │
│ Set up a new course with detailed configuration                     │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📋 Basic Information                                            │ │
│ │ ┌──────────────────────┐  ┌──────────────────────┐              │ │
│ │ │ Title *              │  │ Class *              │              │ │
│ │ │ Enter Course Name    │  │ [Select Class ▼]     │              │ │
│ │ └──────────────────────┘  └──────────────────────┘              │ │
│ │ ┌─────────────────────────────────────────────┐                 │ │
│ │ │ Fee For Course                               │                 │ │
│ │ │ 1000                                         │                 │ │
│ │ └─────────────────────────────────────────────┘                 │ │
│ │ Image: [Choose File] No file chosen                             │ │
│ │ Description: [________________________]                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📚 Subject & Content Selection                                  │ │
│ │                                                                 │ │
│ │ Subjects * [Select All] [Deselect All]                          │ │
│ │ [Select subjects ▼]                                             │ │
│ │                                                                 │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🔵 Physics - LearnEazy Inst                           [×]   │ │ │
│ │ │ ┌─────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ Chapters (Select to expand)                             │ │ │ │
│ │ │ │ ☑ Mechanics (5 topics)                            [▼]   │ │ │ │
│ │ │ │   └── ☑ Newton's Laws                                   │ │ │ │
│ │ │ │   └── ☑ Motion Equations                                │ │ │ │
│ │ │ │   └── ☐ Friction                                        │ │ │ │
│ │ │ │   └── ☑ Circular Motion                                 │ │ │ │
│ │ │ │   └── ☐ Work and Energy                                 │ │ │ │
│ │ │ │ ☑ Thermodynamics (3 topics)                       [▼]   │ │ │ │
│ │ │ │   └── ☑ Heat Transfer                                   │ │ │ │
│ │ │ │   └── ☑ Gas Laws                                        │ │ │ │
│ │ │ │   └── ☐ Entropy                                         │ │ │ │
│ │ │ │ ☐ Waves and Optics (4 topics)                     [▶]   │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                 │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🔵 Chemistry - LearnEazy Inst                         [×]   │ │ │
│ │ │ (Similar structure with chapters and topics)                │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                              [Cancel] [Create Course]               │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Basic info section (Title, Class dropdown, Fee, Image upload, Description)
- Subject multi-select dropdown with "Select All" / "Deselect All"
- When subject selected, show expandable chapters list
- Each chapter is a collapsible section with checkbox
- Under each chapter, show topics with individual checkboxes
- Chapter checkbox controls all child topics
- Visual count showing "X/Y topics selected"
- Remove button (×) to deselect entire subject

---

## Part 4: Course Preview Modal

### File: `src/components/teacher/courses/CoursePreviewModal.tsx` (NEW)

**Layout:**

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Course Preview                                              [×]     │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📘 Disha 1 • Class 10                                           │ │
│ │ Fee: ₹5,000 | Created: Jan 15, 2024                             │ │
│ │ Description: Comprehensive course for Class 10 students...     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ 📚 Course Content (4 Subjects, 12 Chapters, 45 Topics)             │
├─────────────────────────────────────────────────────────────────────┤
│ ▼ 🔵 Physics - LearnEazy Inst (4 Chapters, 15 Topics)              │
│   ├── 📖 Mechanics                                                 │
│   │    ├── • Newton's Laws                                        │
│   │    ├── • Motion Equations                                     │
│   │    └── • Circular Motion                                      │
│   ├── 📖 Thermodynamics                                            │
│   │    ├── • Heat Transfer                                        │
│   │    └── • Gas Laws                                             │
│   └── 📖 Waves and Optics                                          │
│        ├── • Light Reflection                                     │
│        └── • Wave Properties                                      │
│                                                                    │
│ ▼ 🟢 Chemistry - LearnEazy Inst (3 Chapters, 12 Topics)            │
│   ├── 📖 Organic Chemistry                                         │
│   │    ├── • Alkanes                                              │
│   │    └── • Functional Groups                                    │
│   └── 📖 Inorganic Chemistry                                       │
│        └── • Periodic Table                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                   [Edit Course] [Close]             │
└─────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Shows complete hierarchical view
- Expandable/collapsible subjects
- Summary counts at each level
- Edit button redirects to edit page
- Color-coded subject headers

---

## Part 5: Edit Course Page

### File: `src/pages/teacher/courses/EditCoursePage.tsx` (NEW)

**Similar to CreateCoursePage but:**
- Pre-populates all existing selections
- URL: `/teacher/courses/:courseId/edit`
- Loads course data from mock/state
- All checkboxes reflect current selections
- Shows which chapters/topics were previously selected
- "Save Changes" instead of "Create Course"
- Shows visual diff (optional): what's being added/removed

---

## Part 6: Reusable Components

### File: `src/components/teacher/courses/SubjectChapterSelector.tsx` (NEW)

A reusable component for the hierarchical selection:

```typescript
interface SubjectChapterSelectorProps {
  availableSubjects: SubjectWithChaptersTopics[];
  selectedSubjects: CourseSubjectWithContent[];
  onSelectionChange: (subjects: CourseSubjectWithContent[]) => void;
}
```

**Features:**
- Multi-select subject dropdown
- Expandable chapter accordions
- Topic checkboxes within chapters
- "Select All Chapters" / "Select All Topics" per subject
- Visual feedback for selection state
- Counts display

### File: `src/components/teacher/courses/ChapterTopicTree.tsx` (NEW)

Tree view component for displaying/selecting chapters and topics:

```typescript
interface ChapterTopicTreeProps {
  chapters: CourseChapter[];
  onChapterToggle: (chapterId: string) => void;
  onTopicToggle: (chapterId: string, topicId: string) => void;
  readOnly?: boolean;  // For preview mode
}
```

---

## Part 7: Update Courses Main Page

### File: `src/pages/teacher/courses/CoursesMainPage.tsx` (MODIFY)

**Changes:**
- "Add Course" button now navigates to `/teacher/courses/create`
- Preview action opens CoursePreviewModal
- Edit action navigates to `/teacher/courses/:courseId/edit`
- Delete action shows confirmation dialog

```typescript
const navigate = useNavigate();

const handleAddCourse = () => {
  navigate('/teacher/courses/create');
};

const handlePreview = (courseId: string) => {
  setPreviewCourseId(courseId);
  setShowPreviewModal(true);
};

const handleEdit = (courseId: string) => {
  navigate(`/teacher/courses/${courseId}/edit`);
};
```

---

## Part 8: Update Routing

### File: `src/App.tsx` (MODIFY)

Add new routes:

```typescript
// Courses Routes
<Route path="courses" element={<CoursesMainPage />} />
<Route path="courses/create" element={<CreateCoursePage />} />
<Route path="courses/:courseId/edit" element={<EditCoursePage />} />
```

---

## Part 9: Update Mock Data

### File: `src/data/mockCourses.ts` (MODIFY)

Update existing courses to include full chapter/topic structure for preview functionality.

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/course.ts` | **MODIFY** | Add CourseTopic, CourseChapter, CourseSubjectWithContent types |
| `src/data/mockCourseContent.ts` | **CREATE** | Comprehensive subjects/chapters/topics data |
| `src/data/mockCourses.ts` | **MODIFY** | Update to include full hierarchical data |
| `src/pages/teacher/courses/CreateCoursePage.tsx` | **CREATE** | Course creation page with hierarchical selection |
| `src/pages/teacher/courses/EditCoursePage.tsx` | **CREATE** | Course edit page with pre-populated selections |
| `src/components/teacher/courses/CoursePreviewModal.tsx` | **CREATE** | Modal showing course tree view |
| `src/components/teacher/courses/SubjectChapterSelector.tsx` | **CREATE** | Reusable subject/chapter/topic selector |
| `src/components/teacher/courses/ChapterTopicTree.tsx` | **CREATE** | Tree view for chapters and topics |
| `src/pages/teacher/courses/CoursesMainPage.tsx` | **MODIFY** | Wire up navigation and modal |
| `src/App.tsx` | **MODIFY** | Add create/edit routes |

---

## User Interaction Flow

```text
Courses Listing Page
        │
        ├──[Add Course]──→ Create Course Page
        │                        │
        │                        ├── Enter basic info (title, class, fee)
        │                        ├── Select subjects from dropdown
        │                        ├── For each subject: expand & select chapters
        │                        ├── For each chapter: select topics
        │                        └── Submit → Back to listing with new course
        │
        ├──[Preview]──→ Preview Modal
        │                    │
        │                    ├── View course summary
        │                    ├── See all subjects → chapters → topics
        │                    └── Option to Edit
        │
        └──[Edit]──→ Edit Course Page
                         │
                         ├── All existing selections pre-checked
                         ├── Add/remove chapters
                         ├── Add/remove topics
                         └── Save → Back to listing with updates
```

---

## Technical Implementation Notes

1. **State Management**: Use React state for form data with proper type safety
2. **Checkbox Logic**: Parent checkbox (chapter) controls children (topics) - tri-state (none, some, all)
3. **Validation**: Require at least one subject with one chapter and one topic
4. **Mock Data Updates**: Courses will be managed in local state for the UI demo
5. **Responsive Design**: Mobile-friendly accordions and selection UI
6. **Accessibility**: Proper ARIA labels for tree structure
