import { EventItem, Registration, AnalyticsSummary, User, EventFilterState } from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async signup(data: Partial<User>): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Sign up failed' }));
      throw new Error(err.error || 'Sign up failed');
    }
    return res.json();
  },

  // Events
  async getEvents(filters?: Partial<EventFilterState>): Promise<{ events: EventItem[] }> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.department && filters.department !== 'all') params.append('department', filters.department);
    if (filters?.format && filters.format !== 'all') params.append('format', filters.format);
    if (filters?.searchQuery) params.append('search', filters.searchQuery);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/events${query}`);
    if (!res.ok) throw new Error('Failed to load events');
    return res.json();
  },

  async getEventById(id: string): Promise<{ event: EventItem }> {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (!res.ok) throw new Error('Failed to load event');
    return res.json();
  },

  async createEvent(data: Partial<EventItem>): Promise<{ event: EventItem }> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create event' }));
      throw new Error(err.error || 'Failed to create event');
    }
    return res.json();
  },

  async updateEvent(id: string, data: Partial<EventItem>): Promise<{ event: EventItem }> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update event' }));
      throw new Error(err.error || 'Failed to update event');
    }
    return res.json();
  },

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete event');
    return res.json();
  },

  // Attendees & Check-in
  async getEventAttendees(eventId: string): Promise<{
    eventTitle: string;
    maxCapacity: number;
    registeredCount: number;
    attendees: Registration[];
  }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/attendees`);
    if (!res.ok) throw new Error('Failed to load attendees');
    return res.json();
  },

  async toggleCheckIn(eventId: string, registrationId: string): Promise<{ registration: Registration }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/attendees/${registrationId}/checkin`, {
      method: 'PUT'
    });
    if (!res.ok) throw new Error('Failed to toggle check-in');
    return res.json();
  },

  // Registrations
  async getRegistrations(userId?: string, email?: string): Promise<{ registrations: (Registration & { event: EventItem | null })[] }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (email) params.append('email', email);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/registrations${query}`);
    if (!res.ok) throw new Error('Failed to load registrations');
    return res.json();
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
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async cancelRegistration(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/registrations/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to cancel registration');
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  }
};
