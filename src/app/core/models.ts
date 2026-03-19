export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'admin';
  studentNumber?: string;
  course?: string;
  yearLevel?: string;
  mobile?: string;
  status?: string;
  noShowCount?: number;
  createdAt?: string;
}

export interface Service {
  _id: string;
  name: string;
  category: 'appointment' | 'document';
  description: string;
  dailyLimit: number;
}

export interface Appointment {
  _id: string;
  userId?: User | null;
  serviceId: Service;
  requesterType?: string;
  source?: string;
  fullName?: string;
  email?: string;
  contactNumber?: string;
  studentNumber?: string;
  appointmentCode?: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  purpose?: string;
  notes: string;
}

export interface DocumentRequest {
  _id: string;
  userId?: User | null;
  serviceId: Service;
  appointmentId?: Appointment;
  requesterType?: string;
  source?: string;
  fullName?: string;
  email?: string;
  contactNumber?: string;
  studentNumber?: string;
  referenceNumber?: string;
  documentType: string;
  purpose: string;
  status: string;
  notes: string;
  expectedReleaseDate?: string;
  createdAt?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
