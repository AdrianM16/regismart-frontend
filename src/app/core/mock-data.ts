import { Appointment, DocumentRequest, Service, User } from './models';

export const mockServices: Service[] = [
  { _id: 's1', name: 'Transcript of Records', category: 'document', description: 'Request TOR copy', dailyLimit: 30 },
  { _id: 's2', name: 'Enrollment Certificate', category: 'document', description: 'Request enrollment certificate', dailyLimit: 35 },
  { _id: 's3', name: 'Good Moral Certificate', category: 'document', description: 'Request good moral certificate', dailyLimit: 20 },
  { _id: 's4', name: 'General Registrar Concern', category: 'appointment', description: 'General concern or follow-up', dailyLimit: 40 }
];

export const mockStudent: User = {
  _id: 'u1',
  firstName: 'Adrian',
  lastName: 'Anunciacion',
  email: 'adrian@school.edu',
  role: 'student',
  studentNumber: '2021-00142',
  course: 'BS Information Technology',
  yearLevel: '3rd Year',
  mobile: '+63 917 111 1111',
  status: 'active'
};

export const mockAdmin: User = {
  _id: 'u2',
  firstName: 'Regina',
  lastName: 'Admin',
  email: 'admin@regismart.local',
  role: 'admin',
  status: 'active'
};

export const mockAppointments: Appointment[] = [
  { _id: 'a1', serviceId: mockServices[0], appointmentDate: '2026-02-10', timeSlot: '9:00 AM', status: 'Serving', notes: 'Bring valid ID' },
  { _id: 'a2', serviceId: mockServices[1], appointmentDate: '2026-02-08', timeSlot: '10:00 AM', status: 'Approved', notes: 'Pick up at counter 2' },
  { _id: 'a3', serviceId: mockServices[2], appointmentDate: '2026-01-30', timeSlot: '8:00 AM', status: 'Completed', notes: '' }
];

export const mockRequests: DocumentRequest[] = [
  {
    _id: 'r1',
    serviceId: mockServices[0],
    documentType: 'Transcript of Records',
    purpose: 'Job application',
    status: 'Serving',
    notes: 'Ready for document releasing window',
    expectedReleaseDate: '2026-02-12',
    createdAt: '2026-02-10'
  },
  {
    _id: 'r2',
    serviceId: mockServices[1],
    documentType: 'Enrollment Certificate',
    purpose: 'Scholarship requirement',
    status: 'Pending',
    notes: 'Awaiting verification',
    expectedReleaseDate: '2026-02-11',
    createdAt: '2026-02-11'
  },
  {
    _id: 'r3',
    serviceId: mockServices[2],
    documentType: 'Good Moral Certificate',
    purpose: 'Internship',
    status: 'Completed',
    notes: 'Released',
    expectedReleaseDate: '2026-01-30',
    createdAt: '2026-01-30'
  }
];

export const mockUsers: User[] = [
  mockStudent,
  { _id: 'u3', firstName: 'Adrian', lastName: 'Jeff', email: 'ajeff@school.edu', role: 'admin', status: 'active', studentNumber: 'ADM-001' },
  { _id: 'u4', firstName: 'Kevin', lastName: 'Galang', email: 'kgalang@school.edu', role: 'student', status: 'active', studentNumber: '2020-00136' },
  { _id: 'u5', firstName: 'Adrian', lastName: 'Tagle', email: 'atagle@school.edu', role: 'student', status: 'inactive', studentNumber: '2022-01036' }
];
