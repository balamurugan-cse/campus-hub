export type UserRole = 'student' | 'organizer' | 'admin';

export type EventCategory = 
  | 'Hackathon' 
  | 'Workshop' 
  | 'Symposium' 
  | 'Webinar' 
  | 'Sports' 
  | 'Cultural';

export type EventFormat = 'Offline' | 'Online' | 'Hybrid';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college: string;
  department: string;
  phone?: string;
  avatar?: string;
  registeredDate?: string;
}

export interface EventScheduleItem {
  time: string;
  title: string;
  detail?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  shortDescription: string;
  fullDescription: string;
  startDate: string; // ISO date string: YYYY-MM-DDTHH:mm
  endDate: string;   // ISO date string
  venue: string;
  format: EventFormat;
  department: string; // e.g. "Computer Science & Engineering" or "All Departments"
  eligibleDepartments: string[];
  maxCapacity: number;
  registeredCount: number;
  posterUrl?: string;
  organizerName: string;
  organizerContact: string;
  organizerId: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registrationDeadline: string;
  entryFee: string;
  perks: string[];
  schedule: EventScheduleItem[];
  createdAt: string;
}

export interface Registration {
  id: string;
  ticketId: string; // e.g. CH-2026-8921
  eventId: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  college: string;
  department: string;
  phoneNumber: string;
  registeredAt: string;
  status: 'confirmed' | 'cancelled';
  checkedIn: boolean;
  checkedInAt?: string;
}

export interface EventWithUserStatus extends EventItem {
  isUserRegistered?: boolean;
  userTicketId?: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  totalRegistrations: number;
  totalCheckedIn: number;
  attendanceRate: number; // percentage 0-100
  seatOccupancyRate: number; // percentage 0-100
  categoryBreakdown: { category: string; count: number; registrations: number }[];
  departmentBreakdown: { department: string; count: number }[];
}

export type ViewMode = 'grid' | 'list' | 'calendar';

export interface EventFilterState {
  searchQuery: string;
  category: string; // 'all' or specific EventCategory
  department: string; // 'all' or specific department
  format: string; // 'all' or EventFormat
  dateFilter: 'all' | 'today' | 'week' | 'month' | 'upcoming';
}
