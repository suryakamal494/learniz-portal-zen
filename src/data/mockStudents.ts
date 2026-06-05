
import { Student, StudentBatchAssignment } from '@/types/student'

export const mockStudents: Student[] = [
  {
    id: 'std-001',
    name: 'Aarav Sharma',
    rollNumber: 'STD001',
    email: 'aarav.sharma@email.com',
    class: 'Class 12',
    section: 'A',
    joinDate: '2024-01-15',
    lastActive: '2024-01-30',
    performance: 85,
    status: 'active'
  },
  {
    id: 'std-002',
    name: 'Diya Patel',
    rollNumber: 'STD002',
    email: 'diya.patel@email.com',
    class: 'Class 12',
    section: 'A',
    joinDate: '2024-01-16',
    lastActive: '2024-01-29',
    performance: 92,
    status: 'active'
  },
  {
    id: 'std-003',
    name: 'Arjun Singh',
    rollNumber: 'STD003',
    email: 'arjun.singh@email.com',
    class: 'Class 11',
    section: 'B',
    joinDate: '2024-01-17',
    lastActive: '2024-01-28',
    performance: 78,
    status: 'active'
  },
  {
    id: 'std-004',
    name: 'Ananya Gupta',
    rollNumber: 'STD004',
    email: 'ananya.gupta@email.com',
    class: 'Class 12',
    section: 'B',
    joinDate: '2024-01-18',
    lastActive: '2024-01-30',
    performance: 88,
    status: 'active'
  },
  {
    id: 'std-005',
    name: 'Vihan Kumar',
    rollNumber: 'STD005',
    email: 'vihan.kumar@email.com',
    class: 'Class 11',
    section: 'A',
    joinDate: '2024-01-19',
    lastActive: '2024-01-27',
    performance: 76,
    status: 'active'
  },
  {
    id: 'std-006',
    name: 'Ishita Reddy',
    rollNumber: 'STD006',
    email: 'ishita.reddy@email.com',
    class: 'Class 12',
    section: 'C',
    joinDate: '2024-01-20',
    lastActive: '2024-01-29',
    performance: 94,
    status: 'active'
  },
  {
    id: 'std-007',
    name: 'Karan Mehta',
    rollNumber: 'STD007',
    email: 'karan.mehta@email.com',
    class: 'Class 10',
    section: 'A',
    joinDate: '2024-01-21',
    lastActive: '2024-01-26',
    performance: 82,
    status: 'active'
  },
  {
    id: 'std-008',
    name: 'Riya Joshi',
    rollNumber: 'STD008',
    email: 'riya.joshi@email.com',
    class: 'Class 11',
    section: 'C',
    joinDate: '2024-01-22',
    lastActive: '2024-01-30',
    performance: 89,
    status: 'active'
  },
  {
    id: 'std-009',
    name: 'Advait Rao',
    rollNumber: 'STD009',
    email: 'advait.rao@email.com',
    class: 'Class 10',
    section: 'B',
    joinDate: '2024-01-23',
    lastActive: '2024-01-25',
    performance: 73,
    status: 'active'
  },
  {
    id: 'std-010',
    name: 'Saanvi Agarwal',
    rollNumber: 'STD010',
    email: 'saanvi.agarwal@email.com',
    class: 'Class 12',
    section: 'A',
    joinDate: '2024-01-24',
    lastActive: '2024-01-28',
    performance: 91,
    status: 'active'
  },
  {
    id: 'std-011',
    name: 'Rudra Malhotra',
    rollNumber: 'STD011',
    email: 'rudra.malhotra@email.com',
    class: 'Class 9',
    section: 'A',
    joinDate: '2024-01-25',
    lastActive: '2024-01-29',
    performance: 80,
    status: 'active'
  },
  {
    id: 'std-012',
    name: 'Kavya Nair',
    rollNumber: 'STD012',
    email: 'kavya.nair@email.com',
    class: 'Class 11',
    section: 'A',
    joinDate: '2024-01-26',
    lastActive: '2024-01-30',
    performance: 87,
    status: 'active'
  },
  {
    id: 'std-013',
    name: 'Ayaan Khan',
    rollNumber: 'STD013',
    email: 'ayaan.khan@email.com',
    class: 'Class 10',
    section: 'C',
    joinDate: '2024-01-27',
    lastActive: '2024-01-27',
    performance: 75,
    status: 'active'
  },
  {
    id: 'std-014',
    name: 'Myra Verma',
    rollNumber: 'STD014',
    email: 'myra.verma@email.com',
    class: 'Class 12',
    section: 'B',
    joinDate: '2024-01-28',
    lastActive: '2024-01-30',
    performance: 93,
    status: 'active'
  },
  {
    id: 'std-015',
    name: 'Reyansh Chopra',
    rollNumber: 'STD015',
    email: 'reyansh.chopra@email.com',
    class: 'Class 9',
    section: 'B',
    joinDate: '2024-01-29',
    lastActive: '2024-01-26',
    performance: 79,
    status: 'active'
  }
]

// Mock batch assignments - some students are already assigned to batches
export const mockBatchAssignments: StudentBatchAssignment[] = [
  { studentId: 'std-001', batchId: 'section-1', assignedDate: '2024-01-15', status: 'active' },
  { studentId: 'std-002', batchId: 'section-1', assignedDate: '2024-01-16', status: 'active' },
  { studentId: 'std-004', batchId: 'section-1', assignedDate: '2024-01-18', status: 'active' },
  { studentId: 'std-006', batchId: 'section-2', assignedDate: '2024-01-20', status: 'active' },
  { studentId: 'std-008', batchId: 'section-2', assignedDate: '2024-01-22', status: 'active' },
  { studentId: 'std-010', batchId: 'section-3', assignedDate: '2024-01-24', status: 'active' },
]

export const getStudentsAssignedToBatch = (batchId: string): string[] => {
  return mockBatchAssignments
    .filter(assignment => assignment.batchId === batchId && assignment.status === 'active')
    .map(assignment => assignment.studentId)
}

export const getAvailableClasses = (): string[] => {
  return Array.from(new Set(mockStudents.map(student => student.class))).sort()
}

export const updateBatchAssignments = async (batchId: string, studentIds: string[]): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // In a real implementation, this would make an API call
  console.log(`Updating section ${batchId} with students:`, studentIds)
  
  // Mock successful update
  return Promise.resolve()
}
