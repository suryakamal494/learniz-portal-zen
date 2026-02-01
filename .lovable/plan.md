

# Plan: Create Courses Management Page

## Objective
Create a new "Courses" menu item in the Teacher sidebar (below Institute Dashboard) with a Courses management page that replicates the wireframe UI, featuring tabs navigation, a data table with subjects displayed as badges, and an Actions dropdown with Preview, Edit, and Delete options.

---

## Part 1: Add Sidebar Navigation

### File: `src/components/teacher/TeacherSidebar.tsx`

Add new navigation item after "Institute Dashboard":

```typescript
{ title: "Courses", url: "/teacher/courses", icon: BookOpen, badge: null }
```

Position: Index 11 (after Institute Dashboard at index 10)

---

## Part 2: Create Type Definitions

### File: `src/types/course.ts` (NEW)

```typescript
export interface CourseSubject {
  id: string;
  name: string;
  institute: string;
  isOwner: boolean;
}

export interface Course {
  id: string;
  serialNumber: number;
  className: string;
  programName: string;
  subjects: CourseSubject[];
  createdAt: string;
  updatedAt: string;
}
```

---

## Part 3: Create Mock Data

### File: `src/data/mockCourses.ts` (NEW)

Based on the wireframe, create 4 sample courses:

| S.NO | Class | Program Name | Subjects |
|------|-------|--------------|----------|
| 1 | Class 10 | Test course 1 | Biology, Chemistry |
| 2 | Class 6 | Disha 2 | Biology, Chemistry, Mathematics, Physics, Reasoning & Aptitude |
| 3 | Class 10 | Disha 1 | Physics, Mathematics, Chemistry, Reasoning & Aptitude |
| 4 | Class 10 | Tejas | Biology, Chemistry, Physics, Mathematics, English, Reasoning & Aptitude, Telugu |

Each subject has:
- Name (e.g., "Biology")
- Institute (e.g., "LearnEazy Inst")
- isOwner flag (true = shows "(Owner)")

---

## Part 4: Create Courses Page

### File: `src/pages/teacher/courses/CoursesMainPage.tsx` (NEW)

**Layout following the wireframe:**

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Dashboard > Courses                              [Avatar] Srikanth  │
│                                                  Institute Admin    │
├─────────────────────────────────────────────────────────────────────┤
│ [Courses●] [Subjects] [Chapters] [Topics]                           │
├─────────────────────────────────────────────────────────────────────┤
│ COURSES                                          [+ ADD COURSE]     │
│ Manage courses and academic content                                 │
├─────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ Courses (4 courses)                      🔍 Search courses... │   │
│ ├───────────────────────────────────────────────────────────────┤   │
│ │ S.NO ↕ │ CLASS ↕ │ PROGRAM NAME ↕ │ SUBJECTS ↕        │ ⋯   │   │
│ ├────────┼─────────┼────────────────┼───────────────────┼──────┤   │
│ │ 1      │ Class 10│ Test course 1  │ [Bio] [Chem]     │ ⋯   │   │
│ │ 2      │ Class 6 │ Disha 2        │ [Bio][Chem][Math]│ ⋯   │   │
│ │        │         │                │ [Phy][Reasoning] │      │   │
│ │ 3      │ Class 10│ Disha 1        │ [Phy][Math][Chem]│ ⋯   │   │
│ │        │         │                │ [Reasoning]      │      │   │
│ │ 4      │ Class 10│ Tejas          │ [Bio][Chem][Phy] │ ⋯   │   │
│ │        │         │                │ [Math][Eng][R&A] │      │   │
│ │        │         │                │ [Telugu]         │      │   │
│ └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**

1. **Breadcrumb**: Dashboard > Courses
2. **Tabs**: Courses (active), Subjects, Chapters, Topics
3. **Header**: "COURSES" title with "ADD COURSE" button
4. **Table Card**:
   - Count header with search input
   - Sortable columns: S.NO, CLASS, PROGRAM NAME, SUBJECTS
   - Subject badges in blue with left border accent
   - Actions dropdown (three dots)

**Actions Dropdown (MoreHorizontal icon):**
- Preview (Eye icon)
- Edit (Pencil icon)
- Delete (Trash icon)

---

## Part 5: Update Routing

### File: `src/App.tsx`

Add route under Teacher routes:

```typescript
// Courses Routes
<Route path="courses" element={<CoursesMainPage />} />
```

Import the new page component at the top.

---

## Part 6: Visual Design Specifications

### Subject Badge Styling
Following the wireframe exactly:
- Blue background with left border accent
- Format: "Subject - Institute (Owner)" or "Subject - Institute"
- Flex wrap for multiple subjects
- Gap between badges

```typescript
// Badge styling
<Badge className="bg-blue-600 hover:bg-blue-700 text-white rounded-md 
  border-l-4 border-l-blue-400 px-3 py-1 font-medium">
  {subject.name} - {subject.institute} {subject.isOwner ? "(Owner)" : ""}
</Badge>
```

### Table Header Styling
- Uppercase text
- Sortable indicators (up/down arrows)
- Clean gray headers

### Tab Styling
- Active tab: Filled dark button style
- Inactive tabs: Outline button style
- Rounded corners

---

## Part 7: Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/course.ts` | **CREATE** | Course type definitions |
| `src/data/mockCourses.ts` | **CREATE** | Sample courses data |
| `src/pages/teacher/courses/CoursesMainPage.tsx` | **CREATE** | Main courses listing page |
| `src/components/teacher/TeacherSidebar.tsx` | **MODIFY** | Add Courses menu item |
| `src/App.tsx` | **MODIFY** | Add /teacher/courses route |

---

## Technical Details

### State Management
```typescript
const [activeTab, setActiveTab] = useState('courses');
const [searchQuery, setSearchQuery] = useState('');
const [courses, setCourses] = useState<Course[]>(mockCourses);
```

### Filtering
```typescript
const filteredCourses = courses.filter(course =>
  course.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  course.className.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### Actions Handler Stubs
```typescript
const handlePreview = (courseId: string) => {
  console.log('Preview course:', courseId);
  // Future implementation
};

const handleEdit = (courseId: string) => {
  console.log('Edit course:', courseId);
  // Future implementation
};

const handleDelete = (courseId: string) => {
  console.log('Delete course:', courseId);
  // Future implementation
};

const handleAddCourse = () => {
  console.log('Add new course');
  // Future implementation
};
```

---

## Responsiveness

- Mobile: Stack subjects vertically, hide some columns
- Tablet: Show all columns with horizontal scroll if needed
- Desktop: Full table with all content visible

Grid breakpoints:
```typescript
// Table wraps with overflow-x-auto on mobile
// Tabs stack or scroll horizontally on small screens
// Search input goes full width on mobile
```

