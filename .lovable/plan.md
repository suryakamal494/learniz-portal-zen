
# Plan: Institute Dashboard Redesign

## Objective
Create a focused, action-oriented Institute Dashboard that serves as the command center for Institute Admins - prioritizing alerts, quick navigation, and direct insights over raw data display.

---

## Part 1: Add Teacher Sidebar Menu Item

### File: `src/components/teacher/TeacherSidebar.tsx`

Add new navigation item after "Messages":
```
{ title: "Institute Dashboard", url: "/institute/dashboard", icon: Building2, badge: null }
```

This creates a direct entry point from the Teacher panel to the Institute Dashboard.

---

## Part 2: Create Institute Dashboard Page

### File: `src/pages/institute/InstituteDashboardPage.tsx` (NEW)

A clean, modern dashboard following the wireframe design with:

**A. Header Section**
- Title: "Institute Dashboard"
- Status indicator: "LIVE SYSTEM STATUS" (green dot)
- Current date display
- Admin profile avatar

**B. Compact Stats Row (3 cards, NOT large)**
- Active Batches (count)
- Total Students (count)  
- Active Exams (count)
- Small, compact cards - NOT the large prominent cards currently used
- These are for reference, not the main focus

**C. Quick Actions Grid (6 icons) - PRIMARY SECTION**
Styled like the wireframe with icon + title + subtitle:

| Icon | Title | Subtitle | Route |
|------|-------|----------|-------|
| Calendar | Academic Schedule | Manage class timings | `/institute/schedule-tracking` |
| Activity | Learning Response | Monitor engagement | `/institute/learning-response` |
| Clock | Schedule Tracking | Track progress | `/institute/schedule-tracking` |
| Users | Students | View student reports | `/institute/students` |
| GraduationCap | Teachers | Teacher performance | `/institute/teachers` |
| BookOpen | Classes | Class overview | `/institute/classes` |

**D. Immediate Alerts Section - PROMINENT**
Pull directly from CLR data:
- Red banner for "Classrooms Needing Immediate Review"
- Show up to 3 most critical alerts
- Each alert: Chapter name • Class • Batch • Subject • Current Accuracy
- "View All" button to Learning Response page

**E. Recent Grand Tests Section**
- Show last 2-3 completed grand tests
- Simple list: Test name, student count, accuracy %
- Link to detailed view

**F. Today's Teaching Summary (Optional)**
- Classes scheduled today
- Completed vs Pending count
- Brief one-line summary

---

## Part 3: Update Routing

### File: `src/App.tsx`

Add new route under Institute routes:
```typescript
<Route path="dashboard" element={<InstituteDashboardPage />} />
```

This will make the dashboard accessible at `/institute/dashboard`

### File: `src/components/institute/InstituteSidebar.tsx`

Update navigation to include Dashboard as first item:
```typescript
{
  title: 'Dashboard',
  url: '/institute/dashboard',
  icon: LayoutDashboard,
  exact: true
},
```

Move "Snapshot" down or rename to "Overview"

---

## Part 4: Visual Design Specifications

### Layout Following Wireframe:
```text
┌─────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  ● LIVE SYSTEM STATUS           📅 Saturday, Jan 31│
│            │  Institute Dashboard                               │
│            │  Manage your academic operations...                │
│            │                                                    │
│            │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│            │  │🎓 26     │  │👥 1,069  │  │📝 126    │         │
│            │  │ Batches  │  │ Students │  │ Exams    │         │
│            │  └──────────┘  └──────────┘  └──────────┘         │
│            │                                                    │
│            │  ⚡ Quick Actions & Intelligence                   │
│            │  ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│            │  │📅 Schedule │ │📊 Reports  │ │📈 Learning │     │
│            │  │            │ │            │ │  Response  │     │
│            │  └────────────┘ └────────────┘ └────────────┘     │
│            │  ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│            │  │👥 Students │ │👨‍🏫 Teachers│ │🎓 Classes  │     │
│            │  └────────────┘ └────────────┘ └────────────┘     │
│            │                                                    │
│            │  🔴 IMMEDIATE ATTENTION REQUIRED (2)               │
│            │  ┌─────────────────────────────────────────────┐  │
│            │  │ ⚠️ Organic Chemistry • Class 10 • Batch D   │  │
│            │  │    38% accuracy - declining trend           │  │
│            │  └─────────────────────────────────────────────┘  │
│            │  ┌─────────────────────────────────────────────┐  │
│            │  │ ⚠️ Linear Equations • Class 9 • Batch C     │  │
│            │  │    42% accuracy - declining trend           │  │
│            │  └─────────────────────────────────────────────┘  │
│            │                                                    │
│            │  📋 Recent Grand Tests                             │
│            │  ┌─────────────────────────────────────────────┐  │
│            │  │ Half-Yearly Exam 2024 • 245 students • 68%  │  │
│            │  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Color Palette:
- Quick Action Cards: Pastel backgrounds (blue-50, green-50, purple-50)
- Alert Banner: Red-50 background with red-600 text
- Healthy indicators: Green accents
- Stats Cards: Light gray/white with colored icons

---

## Part 5: Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/institute/InstituteDashboardPage.tsx` | **CREATE** | New dashboard page |
| `src/components/institute/dashboard/DashboardHeader.tsx` | **CREATE** | Header with status indicator |
| `src/components/institute/dashboard/CompactStatsRow.tsx` | **CREATE** | Small stat cards row |
| `src/components/institute/dashboard/QuickActionsGrid.tsx` | **CREATE** | 6 navigation icons grid |
| `src/components/institute/dashboard/AlertsSection.tsx` | **CREATE** | Immediate review alerts |
| `src/components/teacher/TeacherSidebar.tsx` | **MODIFY** | Add Institute Dashboard menu |
| `src/components/institute/InstituteSidebar.tsx` | **MODIFY** | Add Dashboard to navigation |
| `src/App.tsx` | **MODIFY** | Add dashboard route |

---

## Key Differences from Current Snapshot

| Current Snapshot | New Dashboard |
|------------------|---------------|
| Large stat cards dominate | Compact stats at top |
| Class cards with details | Quick action icons for navigation |
| Alerts are one section among many | Alerts are prominently featured |
| Designed for exploration | Designed for quick action |
| Multiple navigation options | Focused entry points |

---

## Implementation Notes

1. **No Complex Graphs**: Direct numbers and status indicators only
2. **Mobile Responsive**: Grid adapts to screen size
3. **Action-Oriented**: Every element leads to an action or investigation
4. **Minimal Data Display**: Show counts, not percentages in main cards
5. **Clear Hierarchy**: Alerts > Quick Actions > Reference Stats
