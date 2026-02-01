

# Plan: Custom Subject Creation with Multi-Source Content & Renaming

## Overview
Transform the course creation system to support two modes of adding subjects:
1. **Use Existing Subject**: Add a subject as-is (current behavior)
2. **Create Custom Subject**: Create a new subject name, pull chapters/topics from multiple source subjects, and optionally rename them

---

## Part 1: Update Type Definitions

### File: `src/types/course.ts` (MODIFY)

Add new types to support custom subjects with renaming:

```typescript
// Enhanced topic with original name tracking
export interface CourseTopic {
  id: string;
  name: string;                    // Display name (can be customized)
  originalName?: string;           // Original name from source
  sourceSubjectId?: string;        // Which subject this came from
  isSelected?: boolean;
}

// Enhanced chapter with original name tracking
export interface CourseChapter {
  id: string;
  name: string;                    // Display name (can be customized)
  originalName?: string;           // Original name from source
  sourceSubjectId?: string;        // Which subject this came from
  sourceSubjectName?: string;      // Source subject name for reference
  isSelected?: boolean;
  topics: CourseTopic[];
}

// Enhanced subject to support custom subjects
export interface CourseSubjectWithContent {
  id: string;
  name: string;
  institute: string;
  isOwner: boolean;
  isCustom?: boolean;              // NEW: Is this a custom-created subject?
  chapters: CourseChapter[];
}
```

---

## Part 2: Create Subject Builder Component

### File: `src/components/teacher/courses/CustomSubjectBuilder.tsx` (NEW)

A modal/panel for creating custom subjects with content from multiple sources.

**Layout:**

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Create Custom Subject                                           [×]    │
├─────────────────────────────────────────────────────────────────────────┤
│ Subject Name *                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐     │
│ │ Science                                                         │     │
│ └─────────────────────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────────────────┤
│ Add Content from Source Subjects                                        │
│ ┌────────────────────────────┐                                          │
│ │ Select Source Subject ▼   │  [+ Add Chapters]                         │
│ └────────────────────────────┘                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ Added Chapters                                           [Expand All]   │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📖 Mechanics                    (from Physics)              [×]     │ │
│ │    Display Name: [Mechanics________] → [1D Motion__________] ✏️     │ │
│ │    ┌─────────────────────────────────────────────────────────────┐  │ │
│ │    │ ☑ Newton's Laws → [Laws of Motion] ✏️                       │  │ │
│ │    │ ☑ Motion Equations → [Motion Equations]                     │  │ │
│ │    │ ☐ Friction → [Friction]                                     │  │ │
│ │    │ ☑ Circular Motion → [Circular Motion]                       │  │ │
│ │    └─────────────────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📖 Organic Chemistry            (from Chemistry)            [×]     │ │
│ │    Display Name: [Organic Chemistry] → [Basic Chemistry] ✏️         │ │
│ │    ┌─────────────────────────────────────────────────────────────┐  │ │
│ │    │ ☑ Alkanes and Alkenes → [Hydrocarbons] ✏️                    │  │ │
│ │    │ ☑ Functional Groups → [Functional Groups]                   │  │ │
│ │    └─────────────────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📖 Cell Biology                 (from Biology)              [×]     │ │
│ │    Display Name: [Cell Biology] → [Introduction to Cells] ✏️        │ │
│ │    (Topics list...)                                                 │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ Summary: 3 chapters, 12 topics from 3 source subjects                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                        [Cancel] [Create Subject]        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Enter custom subject name
- Select source subject from dropdown
- Browse and select specific chapters from that source
- Each added chapter shows:
  - Original name with editable "Display Name" field
  - Source subject badge (e.g., "from Physics")
  - List of topics with individual rename capability
  - Remove button
- Can add chapters from multiple source subjects
- Summary showing total counts

---

## Part 3: Create Chapter Picker Modal

### File: `src/components/teacher/courses/ChapterPickerModal.tsx` (NEW)

A modal to browse and select chapters from a specific source subject.

**Layout:**

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Select Chapters from Physics                                    [×]     │
├─────────────────────────────────────────────────────────────────────────┤
│ 🔍 Search chapters...                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ ☐ Select All                                                            │
├─────────────────────────────────────────────────────────────────────────┤
│ ☑ Mechanics (5 topics)                                                  │
│ ☑ Thermodynamics (4 topics)                                             │
│ ☐ Waves and Optics (5 topics)                                           │
│ ☐ Electromagnetism (5 topics)                                           │
│ ☐ Modern Physics (4 topics)                                             │
│ ☐ Gravitation (4 topics)                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                [Cancel] [Add 2 Chapters]                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 4: Create Editable Chapter Card Component

### File: `src/components/teacher/courses/EditableChapterCard.tsx` (NEW)

A card component for displaying an added chapter with rename functionality.

**Features:**
- Shows chapter with editable display name
- "from [Source Subject]" badge
- Collapsible topic list
- Each topic has:
  - Checkbox for selection
  - Inline editable name field
  - Original name shown as placeholder/hint
- Delete button to remove entire chapter

**State Management:**
```typescript
interface EditableChapterProps {
  chapter: CourseChapter;
  onNameChange: (newName: string) => void;
  onTopicNameChange: (topicId: string, newName: string) => void;
  onTopicToggle: (topicId: string) => void;
  onRemove: () => void;
}
```

---

## Part 5: Update Subject Chapter Selector

### File: `src/components/teacher/courses/SubjectChapterSelector.tsx` (MODIFY)

Add dual-mode functionality:

**New Layout:**

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Subject Selection                                                        │
│                                                                         │
│ [Use Existing Subject ▼]  OR  [+ Create Custom Subject]                 │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ Added Subjects:                                                         │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ 🔵 Physics - LearnEazy Inst (Owner)                          [×]  │   │
│ │ Type: Existing Subject                                            │   │
│ │ 3/6 chapters • 12/27 topics selected                              │   │
│ │ (Expandable chapter tree - current behavior)                      │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ 🟢 Science - Custom                                    [Edit] [×]  │   │
│ │ Type: Custom Subject (content from Physics, Chemistry, Biology)   │   │
│ │ 5 chapters • 18 topics                                            │   │
│ │ ┌─────────────────────────────────────────────────────────────┐   │   │
│ │ │ ▼ 1D Motion (originally: Mechanics, from Physics)          │   │   │
│ │ │   • Laws of Motion (originally: Newton's Laws)             │   │   │
│ │ │   • Motion Equations                                       │   │   │
│ │ │   • Circular Motion                                        │   │   │
│ │ │ ▼ Basic Chemistry (originally: Organic Chemistry)          │   │   │
│ │ │   • Hydrocarbons (originally: Alkanes and Alkenes)         │   │   │
│ │ └─────────────────────────────────────────────────────────────┘   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Two action buttons: "Use Existing Subject" (dropdown) and "+ Create Custom Subject" (opens builder)
- Existing subjects work as before
- Custom subjects show with "Custom" badge and "Edit" button
- Custom subjects display chapters with original name in parentheses if renamed
- Edit button reopens the CustomSubjectBuilder with pre-populated data

---

## Part 6: Update Create Course Page

### File: `src/pages/teacher/courses/CreateCoursePage.tsx` (MODIFY)

**Changes:**
- Integrate the new dual-mode SubjectChapterSelector
- Add state for managing the CustomSubjectBuilder modal
- Update form data structure to handle both subject types
- Update validation logic

---

## Part 7: Update Edit Course Page

### File: `src/pages/teacher/courses/EditCoursePage.tsx` (MODIFY)

**Changes:**
- Support editing both existing and custom subjects
- For custom subjects, clicking "Edit" opens the CustomSubjectBuilder with current data
- Allow renaming chapters/topics during edit

---

## Part 8: Update Preview Modal

### File: `src/components/teacher/courses/CoursePreviewModal.tsx` (MODIFY)

**Changes:**
- Show "(Custom)" badge for custom subjects
- Display renamed items with original name hint: "1D Motion (originally: Mechanics)"
- Show source subject info: "from Physics"

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/course.ts` | **MODIFY** | Add originalName, sourceSubjectId, isCustom fields |
| `src/components/teacher/courses/CustomSubjectBuilder.tsx` | **CREATE** | Modal for creating custom subjects with multi-source content |
| `src/components/teacher/courses/ChapterPickerModal.tsx` | **CREATE** | Modal to select chapters from a source subject |
| `src/components/teacher/courses/EditableChapterCard.tsx` | **CREATE** | Card with inline rename for chapter and topics |
| `src/components/teacher/courses/SubjectChapterSelector.tsx` | **MODIFY** | Add dual-mode (existing vs custom) with new UI |
| `src/components/teacher/courses/ChapterTopicTree.tsx` | **MODIFY** | Support showing original names when renamed |
| `src/pages/teacher/courses/CreateCoursePage.tsx` | **MODIFY** | Integrate custom subject creation flow |
| `src/pages/teacher/courses/EditCoursePage.tsx` | **MODIFY** | Support editing custom subjects |
| `src/components/teacher/courses/CoursePreviewModal.tsx` | **MODIFY** | Show custom subject info and renamed items |

---

## User Interaction Flow

```text
Course Creation Page
        │
        ├── [Use Existing Subject ▼]
        │         │
        │         └── Select "Physics" → Add with all chapters
        │              └── Expand, select specific chapters/topics
        │              └── (Cannot rename - it's the original subject)
        │
        └── [+ Create Custom Subject]
                  │
                  └── Opens CustomSubjectBuilder Modal
                            │
                            ├── Enter name: "Science"
                            │
                            ├── Select source: "Physics"
                            │     └── Opens ChapterPickerModal
                            │           └── Select "Mechanics", "Thermodynamics"
                            │           └── [Add Chapters]
                            │
                            ├── Mechanics appears in list
                            │     ├── Rename to "1D Motion"
                            │     ├── Select topics, rename if needed
                            │     └── (Shows "from Physics" badge)
                            │
                            ├── Select another source: "Chemistry"
                            │     └── Add "Organic Chemistry"
                            │     └── Rename to "Basic Chemistry"
                            │
                            └── [Create Subject]
                                  └── "Science" added to course
                                  └── Contains chapters from Physics + Chemistry
                                  └── All with custom names
```

---

## Technical Implementation Notes

1. **ID Generation**: Custom subjects get unique IDs like `custom-subject-${timestamp}`

2. **Tracking Original Data**: Each chapter/topic stores:
   - `originalName`: The name from the source
   - `sourceSubjectId`: Which subject it came from
   - `sourceSubjectName`: Human-readable source name

3. **Inline Editing**: Use Input fields that appear on hover/click for renaming

4. **Validation**: 
   - Custom subject name is required
   - At least one chapter with one topic must be selected
   - Duplicate chapter IDs within a subject are prevented

5. **Preview Display**: Shows both current name and original name for clarity

6. **Edit Mode**: CustomSubjectBuilder can receive existing custom subject data for editing

