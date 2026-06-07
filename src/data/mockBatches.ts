
import { Batch } from '@/types/batch'

export const mockBatches: Batch[] = [
  {
    id: '1',
    name: 'Section A',
    class: 'Class 12',
    course: 'Science Stream',
    capacity: 30,
    currentStudents: 25,
    startDate: '2024-01-15',
    endDate: '2024-12-15',
    startTime: '09:00',
    endTime: '11:00',
    status: 'active',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Kalpana Chawla',
    class: 'Class 11',
    course: 'Science Stream',
    capacity: 25,
    currentStudents: 22,
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    startTime: '14:00',
    endTime: '16:00',
    status: 'active',
    createdAt: '2024-01-20',
    updatedAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'Bhagat Singh',
    class: 'Class 12',
    course: 'Science Stream',
    capacity: 20,
    currentStudents: 18,
    startDate: '2024-01-20',
    endDate: '2024-10-20',
    startTime: '16:30',
    endTime: '18:30',
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '4',
    name: 'Yamuna',
    class: 'Class 11',
    course: 'Science Stream',
    capacity: 28,
    currentStudents: 24,
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    startTime: '10:00',
    endTime: '12:00',
    status: 'active',
    createdAt: '2024-02-20',
    updatedAt: '2024-03-01'
  },
  {
    id: '5',
    name: 'Sarabhai',
    class: 'Class 12',
    course: 'JEE Preparation',
    capacity: 35,
    currentStudents: 32,
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    startTime: '07:00',
    endTime: '09:00',
    status: 'completed',
    createdAt: '2023-05-15',
    updatedAt: '2024-05-31'
  }
]
