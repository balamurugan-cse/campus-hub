import { EventItem, Registration, AnalyticsSummary, User, EventFilterState, UserRole } from '../types';

const API_BASE = '/api';

// Helper to format clean human names from email strings
function formatNameFromEmail(email: string): string {
  const localPart = email.split('@')[0] || 'Member';
  const cleaned = localPart.replace(/[0-9_.-]/g, ' ').trim();
  if (!cleaned) return 'Campus Member';
  return cleaned
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ---------------------------------------------------------------------------
// Client-side Local Storage Database (Seamless fallback for Vercel / Static deployments)
// ---------------------------------------------------------------------------
const STORAGE_KEYS = {
  USERS: 'dmice_campus_hub_users',
  EVENTS: 'dmice_campus_hub_events',
  REGISTRATIONS: 'dmice_campus_hub_registrations'
};

function getLocalUsers(): (User & { password?: string })[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: (User & { password?: string })[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.warn('Failed to save users locally:', e);
  }
}

function getLocalEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalEvents(events: EventItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.warn('Failed to save events locally:', e);
  }
}

function getLocalRegistrations(): Registration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRegistrations(regs: Registration[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(regs));
  } catch (e) {
    console.warn('Failed to save registrations locally:', e);
  }
}

// Helper to detect if response is actually JSON or HTML error from static hosting
async function safeFetchJson<T>(
  url: string, 
  options?: RequestInit
): Promise<{ data?: T; isServerUnavailable?: boolean; errorMessage?: string }> {
  try {
    const res = await fetch(url, options);

    // If 404 or not found, or returning HTML (standard for Vercel/Netlify when API route doesn't exist)
    const contentType = res.headers.get('content-type') || '';
    if (res.status === 404 || contentType.includes('text/html')) {
      return { isServerUnavailable: true };
    }

    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json !== null) {
        return { data: json as T };
      }
      return { isServerUnavailable: true };
    }

    // Handled HTTP errors (e.g. 400 or 401 with JSON message)
    if (res.status === 400 || res.status === 401) {
      try {
        const errJson = await res.json();
        return { errorMessage: errJson.error || 'Request failed' };
      } catch {
        return { errorMessage: 'Invalid request. Please check your input.' };
      }
    }

    // 500+ or other unhandled errors
    return { isServerUnavailable: true };
  } catch {
    // Network error (offline or server not reachable)
    return { isServerUnavailable: true };
  }
}

// ---------------------------------------------------------------------------
// Unified API with Hybrid Server + LocalStorage Engine
// ---------------------------------------------------------------------------
export const api = {
  // Auth: Login
  async login(email: string, password?: string, role?: UserRole): Promise<{ user: User; autoCreated?: boolean }> {
    let cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail}@dmice.ac.in`;
    }
    
    // First, try live server if available
    const serverResult = await safeFetchJson<{ user: User; autoCreated?: boolean }>(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password, role })
    });

    if (serverResult.data) {
      return serverResult.data;
    }

    if (serverResult.errorMessage) {
      // If server returned a password error, allow local fallback or throw user-friendly error
      if (!serverResult.errorMessage.toLowerCase().includes('password')) {
        throw new Error(serverResult.errorMessage);
      }
    }

    // Fallback: Local Client-side Authentication Engine (Vercel / Static deployments)
    const users = getLocalUsers();
    let existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (existingUser) {
      if (existingUser.password && password && existingUser.password !== password) {
        throw new Error('Incorrect password for this account. If you forgot your password, please click "Reset Password" below to sign in immediately.');
      }
      if (!existingUser.password && password) {
        existingUser.password = password;
      }
      if (role === 'organizer' || role === 'student') {
        existingUser.role = role;
      }
      saveLocalUsers(users);
      return { user: existingUser, autoCreated: false };
    }

    // Seamless auto-creation if account doesn't exist
    const desiredRole = role === 'organizer' || role === 'admin' ? 'organizer' : 'student';
    const derivedName = formatNameFromEmail(cleanEmail);
    const fullName = desiredRole === 'organizer' ? `Dr. ${derivedName} (Faculty)` : derivedName;

    const newUser: User & { password?: string } = {
      id: 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: fullName,
      email: cleanEmail,
      role: desiredRole,
      college: 'DMI College of Engineering',
      department: 'Computer Science & Engineering',
      phone: '',
      password: password || '',
      registeredDate: new Date().toISOString()
    };

    users.push(newUser);
    saveLocalUsers(users);

    return { user: newUser, autoCreated: true };
  },

  // Auth: Sign up
  async signup(data: Partial<User> & { password?: string }): Promise<{ user: User }> {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const serverResult = await safeFetchJson<{ user: User }>(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (serverResult.data) {
      return serverResult.data;
    }

    if (serverResult.errorMessage) {
      throw new Error(serverResult.errorMessage);
    }

    // Local Storage Fallback
    const users = getLocalUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    const userRole = data.role === 'organizer' || data.role === 'admin' ? 'organizer' : 'student';
    const userName = data.name && data.name.trim() ? data.name.trim() : formatNameFromEmail(cleanEmail);

    const userObj: User & { password?: string } = {
      id: existingIndex >= 0 ? users[existingIndex].id : ('user_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
      name: userName,
      email: cleanEmail,
      role: userRole,
      college: data.college || 'DMI College of Engineering',
      department: data.department || 'Computer Science & Engineering',
      phone: data.phone || '',
      password: data.password || (existingIndex >= 0 ? users[existingIndex].password : ''),
      registeredDate: existingIndex >= 0 ? users[existingIndex].registeredDate : new Date().toISOString()
    };

    if (existingIndex >= 0) {
      users[existingIndex] = userObj;
    } else {
      users.push(userObj);
    }
    saveLocalUsers(users);

    return { user: userObj };
  },

  // Auth: Password Reset
  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; user: User; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const serverResult = await safeFetchJson<{ success: boolean; user: User; message: string }>(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, newPassword })
    });

    if (serverResult.data) {
      return serverResult.data;
    }

    if (serverResult.errorMessage) {
      throw new Error(serverResult.errorMessage);
    }

    // Local Storage Fallback
    const users = getLocalUsers();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        id: 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        name: formatNameFromEmail(cleanEmail),
        email: cleanEmail,
        role: 'student',
        college: 'DMI College of Engineering',
        department: 'Computer Science & Engineering',
        phone: '',
        password: newPassword.trim(),
        registeredDate: new Date().toISOString()
      };
      users.push(user);
      saveLocalUsers(users);
      return { success: true, user, message: 'Account created with your new password! You are now signed in.' };
    }

    user.password = newPassword.trim();
    saveLocalUsers(users);
    return { success: true, user, message: 'Password updated successfully! You are now signed in.' };
  },

  // Events: List with filters
  async getEvents(filters?: Partial<EventFilterState>): Promise<{ events: EventItem[] }> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.department && filters.department !== 'all') params.append('department', filters.department);
    if (filters?.format && filters.format !== 'all') params.append('format', filters.format);
    if (filters?.searchQuery) params.append('search', filters.searchQuery);

    const query = params.toString() ? `?${params.toString()}` : '';
    const serverResult = await safeFetchJson<{ events: EventItem[] }>(`${API_BASE}/events${query}`);

    if (serverResult.data) {
      return serverResult.data;
    }

    // Local Storage Fallback
    const localEvents = getLocalEvents();
    const localRegs = getLocalRegistrations();

    let filtered = [...localEvents];
    if (filters?.category && filters.category !== 'all') {
      filtered = filtered.filter(e => e.category?.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.department && filters.department !== 'all') {
      filtered = filtered.filter(e => 
        e.department === 'All Departments' || 
        e.eligibleDepartments?.includes('All Departments') ||
        e.department === filters.department ||
        e.eligibleDepartments?.includes(filters.department!)
      );
    }
    if (filters?.format && filters.format !== 'all') {
      filtered = filtered.filter(e => e.format?.toLowerCase() === filters.format!.toLowerCase());
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(q) ||
        e.shortDescription?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.organizerName?.toLowerCase().includes(q)
      );
    }

    filtered = filtered.map(evt => {
      const count = localRegs.filter(r => r.eventId === evt.id && r.status === 'confirmed').length;
      return { ...evt, registeredCount: count };
    });

    return { events: filtered };
  },

  async getEventById(id: string): Promise<{ event: EventItem }> {
    const serverResult = await safeFetchJson<{ event: EventItem }>(`${API_BASE}/events/${id}`);
    if (serverResult.data) {
      return serverResult.data;
    }

    const localEvents = getLocalEvents();
    const event = localEvents.find(e => e.id === id);
    if (!event) throw new Error('Event not found');

    const count = getLocalRegistrations().filter(r => r.eventId === id && r.status === 'confirmed').length;
    return { event: { ...event, registeredCount: count } };
  },

  async createEvent(data: Partial<EventItem>): Promise<{ event: EventItem }> {
    const serverResult = await safeFetchJson<{ event: EventItem }>(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (serverResult.data) {
      return serverResult.data;
    }

    if (serverResult.errorMessage) {
      throw new Error(serverResult.errorMessage);
    }

    // Local Storage Fallback
    const localEvents = getLocalEvents();
    const newEvent: EventItem = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: data.title || 'Untitled Event',
      category: data.category || 'Workshop',
      shortDescription: data.shortDescription || '',
      fullDescription: data.fullDescription || '',
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || data.startDate || new Date().toISOString(),
      venue: data.venue || 'Campus Auditorium',
      format: data.format || 'Offline',
      department: data.department || 'All Departments',
      eligibleDepartments: Array.isArray(data.eligibleDepartments) ? data.eligibleDepartments : ['All Departments'],
      maxCapacity: Number(data.maxCapacity) || 100,
      registeredCount: 0,
      posterUrl: data.posterUrl || '',
      organizerName: data.organizerName || 'Campus Innovation Club',
      organizerContact: data.organizerContact || '',
      organizerId: data.organizerId || 'admin_1',
      status: 'upcoming',
      registrationDeadline: data.registrationDeadline || data.startDate || new Date().toISOString(),
      entryFee: data.entryFee || 'Free for students',
      perks: Array.isArray(data.perks) ? data.perks : ['Certificate of Participation', 'Networking'],
      schedule: Array.isArray(data.schedule) ? data.schedule : [],
      createdAt: new Date().toISOString()
    };

    localEvents.unshift(newEvent);
    saveLocalEvents(localEvents);

    return { event: newEvent };
  },

  async updateEvent(id: string, data: Partial<EventItem>): Promise<{ event: EventItem }> {
    const serverResult = await safeFetchJson<{ event: EventItem }>(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (serverResult.data) {
      return serverResult.data;
    }

    const localEvents = getLocalEvents();
    const idx = localEvents.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Event not found');

    localEvents[idx] = {
      ...localEvents[idx],
      ...data,
      id: localEvents[idx].id,
      maxCapacity: Number(data.maxCapacity) || localEvents[idx].maxCapacity
    };
    saveLocalEvents(localEvents);

    return { event: localEvents[idx] };
  },

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    const serverResult = await safeFetchJson<{ success: boolean }>(`${API_BASE}/events/${id}`, {
      method: 'DELETE'
    });

    if (serverResult.data) {
      return serverResult.data;
    }

    const localEvents = getLocalEvents();
    const remaining = localEvents.filter(e => e.id !== id);
    saveLocalEvents(remaining);

    const localRegs = getLocalRegistrations().filter(r => r.eventId !== id);
    saveLocalRegistrations(localRegs);

    return { success: true };
  },

  // Attendees & Check-in
  async getEventAttendees(eventId: string): Promise<{
    eventTitle: string;
    maxCapacity: number;
    registeredCount: number;
    attendees: Registration[];
  }> {
    const serverResult = await safeFetchJson<{
      eventTitle: string;
      maxCapacity: number;
      registeredCount: number;
      attendees: Registration[];
    }>(`${API_BASE}/events/${eventId}/attendees`);

    if (serverResult.data) {
      return serverResult.data;
    }

    const localEvents = getLocalEvents();
    const event = localEvents.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const attendees = getLocalRegistrations().filter(r => r.eventId === eventId && r.status === 'confirmed');
    return {
      eventTitle: event.title,
      maxCapacity: event.maxCapacity,
      registeredCount: attendees.length,
      attendees
    };
  },

  async toggleCheckIn(eventId: string, registrationId: string): Promise<{ registration: Registration }> {
    const serverResult = await safeFetchJson<{ registration: Registration }>(
      `${API_BASE}/events/${eventId}/attendees/${registrationId}/checkin`,
      { method: 'PUT' }
    );

    if (serverResult.data) {
      return serverResult.data;
    }

    const localRegs = getLocalRegistrations();
    const reg = localRegs.find(r => r.id === registrationId && r.eventId === eventId);
    if (!reg) throw new Error('Registration not found');

    reg.checkedIn = !reg.checkedIn;
    reg.checkedInAt = reg.checkedIn ? new Date().toISOString() : undefined;
    saveLocalRegistrations(localRegs);

    return { registration: reg };
  },

  // Registrations
  async getRegistrations(userId?: string, email?: string): Promise<{ registrations: (Registration & { event: EventItem | null })[] }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (email) params.append('email', email);
    const query = params.toString() ? `?${params.toString()}` : '';

    const serverResult = await safeFetchJson<{ registrations: (Registration & { event: EventItem | null })[] }>(
      `${API_BASE}/registrations${query}`
    );

    if (serverResult.data) {
      return serverResult.data;
    }

    // Local Storage Fallback
    const localRegs = getLocalRegistrations().filter(r => r.status === 'confirmed');
    const localEvents = getLocalEvents();

    let list = localRegs;
    if (userId) {
      list = list.filter(r => r.userId === userId);
    } else if (email) {
      list = list.filter(r => r.studentEmail.toLowerCase() === email.toLowerCase());
    }

    const withEvents = list.map(reg => ({
      ...reg,
      event: localEvents.find(e => e.id === reg.eventId) || null
    }));

    return { registrations: withEvents };
  },

  async registerForEvent(data: {
    eventId: string;
    userId?: string;
    studentName: string;
    studentEmail: string;
    college?: string;
    department?: string;
    phoneNumber?: string;
  }): Promise<{ registration: Registration; event: EventItem }> {
    const serverResult = await safeFetchJson<{ registration: Registration; event: EventItem }>(
      `${API_BASE}/registrations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );

    if (serverResult.data) {
      return serverResult.data;
    }

    if (serverResult.errorMessage) {
      throw new Error(serverResult.errorMessage);
    }

    // Local Storage Fallback
    const localEvents = getLocalEvents();
    const event = localEvents.find(e => e.id === data.eventId);
    if (!event) throw new Error('Event not found');

    const localRegs = getLocalRegistrations();
    const already = localRegs.find(
      r => r.eventId === data.eventId && r.studentEmail.toLowerCase() === data.studentEmail.toLowerCase() && r.status === 'confirmed'
    );
    if (already) {
      throw new Error('You are already registered for this event');
    }

    const activeCount = localRegs.filter(r => r.eventId === data.eventId && r.status === 'confirmed').length;
    if (activeCount >= event.maxCapacity) {
      throw new Error('Registration full. Maximum capacity has been reached.');
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newReg: Registration = {
      id: 'reg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      ticketId: `CH-2026-${randomSuffix}`,
      eventId: data.eventId,
      userId: data.userId || 'student_' + Date.now(),
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      college: data.college || 'DMI College of Engineering',
      department: data.department || 'Computer Science & Engineering',
      phoneNumber: data.phoneNumber || '',
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
      checkedIn: false
    };

    localRegs.push(newReg);
    saveLocalRegistrations(localRegs);

    event.registeredCount = activeCount + 1;
    saveLocalEvents(localEvents);

    return { registration: newReg, event };
  },

  async cancelRegistration(id: string): Promise<{ success: boolean; message: string }> {
    const serverResult = await safeFetchJson<{ success: boolean; message: string }>(
      `${API_BASE}/registrations/${id}`,
      { method: 'DELETE' }
    );

    if (serverResult.data) {
      return serverResult.data;
    }

    const localRegs = getLocalRegistrations();
    const reg = localRegs.find(r => r.id === id);
    if (!reg) throw new Error('Registration not found');

    reg.status = 'cancelled';
    saveLocalRegistrations(localRegs);

    const localEvents = getLocalEvents();
    const event = localEvents.find(e => e.id === reg.eventId);
    if (event) {
      const active = localRegs.filter(r => r.eventId === event.id && r.status === 'confirmed').length;
      event.registeredCount = active;
      saveLocalEvents(localEvents);
    }

    return { success: true, message: 'Registration cancelled successfully' };
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsSummary> {
    const serverResult = await safeFetchJson<AnalyticsSummary>(`${API_BASE}/analytics`);
    if (serverResult.data) {
      return serverResult.data;
    }

    const localEvents = getLocalEvents();
    const localRegs = getLocalRegistrations().filter(r => r.status === 'confirmed');

    const totalEvents = localEvents.length;
    const totalRegistrations = localRegs.length;
    const totalCheckedIn = localRegs.filter(r => r.checkedIn).length;
    const attendanceRate = totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;
    const totalCapacity = localEvents.reduce((sum, e) => sum + (e.maxCapacity || 0), 0);
    const seatOccupancyRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

    const categoryMap: Record<string, { count: number; registrations: number }> = {};
    localEvents.forEach(e => {
      const cat = e.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, registrations: 0 };
      }
      categoryMap[cat].count += 1;
    });

    localRegs.forEach(r => {
      const ev = localEvents.find(e => e.id === r.eventId);
      const cat = ev?.category || 'Other';
      if (categoryMap[cat]) {
        categoryMap[cat].registrations += 1;
      }
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      count: data.count,
      registrations: data.registrations
    }));

    const deptMap: Record<string, number> = {};
    localEvents.forEach(e => {
      const dept = e.department || 'All Departments';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    const departmentBreakdown = Object.entries(deptMap).map(([department, count]) => ({
      department,
      count
    }));

    return {
      totalEvents,
      totalRegistrations,
      totalCheckedIn,
      attendanceRate,
      seatOccupancyRate,
      categoryBreakdown,
      departmentBreakdown
    };
  }
};
