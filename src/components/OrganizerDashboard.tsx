import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Calendar, 
  CheckCircle2, 
  BarChart3, 
  Download, 
  Edit3, 
  Trash2, 
  Search, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { EventItem, Registration, AnalyticsSummary } from '../types';
import { api } from '../services/api';
import { EmptyState } from './EmptyState';

interface OrganizerDashboardProps {
  events: EventItem[];
  onCreateEvent: () => void;
  onEditEvent: (event: EventItem) => void;
  onDeleteEvent: (eventId: string) => void;
  onRefreshData: () => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  events,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'attendees' | 'analytics'>('events');
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  
  // Attendees state
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  
  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Sync selectedEventId if events change
  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  // Load attendees whenever selectedEventId changes
  useEffect(() => {
    if (selectedEventId) {
      loadAttendees(selectedEventId);
    } else {
      setAttendees([]);
    }
  }, [selectedEventId]);

  // Load analytics summary
  useEffect(() => {
    loadAnalytics();
  }, [events]);

  const loadAttendees = async (eventId: string) => {
    setAttendeesLoading(true);
    try {
      const res = await api.getEventAttendees(eventId);
      setAttendees(res.attendees || []);
    } catch (err) {
      console.error('Failed to load attendees:', err);
    } finally {
      setAttendeesLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.getAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleToggleCheckIn = async (registrationId: string) => {
    if (!selectedEventId) return;
    try {
      const res = await api.toggleCheckIn(selectedEventId, registrationId);
      // update local attendee
      setAttendees(prev =>
        prev.map(a => (a.id === registrationId ? res.registration : a))
      );
      loadAnalytics();
    } catch (err) {
      alert('Failed to update check-in status');
    }
  };

  const exportCSV = () => {
    if (!attendees || attendees.length === 0) return;
    const currentEvent = events.find(e => e.id === selectedEventId);
    const eventName = currentEvent ? currentEvent.title.replace(/[^a-zA-Z0-9]/g, '_') : 'attendees';

    const headers = ['Ticket ID', 'Student Name', 'Email', 'College', 'Department', 'Phone', 'Status', 'Checked In', 'Registered At'];
    const rows = attendees.map(a => [
      a.ticketId,
      `"${a.studentName}"`,
      a.studentEmail,
      `"${a.college}"`,
      `"${a.department}"`,
      a.phoneNumber || '',
      a.status,
      a.checkedIn ? 'Yes' : 'No',
      a.registeredAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${eventName}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAttendees = attendees.filter(a => {
    const q = attendeeSearch.toLowerCase();
    return (
      a.studentName.toLowerCase().includes(q) ||
      a.studentEmail.toLowerCase().includes(q) ||
      a.ticketId.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q)
    );
  });

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Overall analytics metrics (dynamic, starts at 0 when db is empty!)
  const totalEvents = analytics?.totalEvents ?? events.length;
  const totalRegistrations = analytics?.totalRegistrations ?? 0;
  const totalCheckedIn = analytics?.totalCheckedIn ?? 0;
  const attendanceRate = analytics?.attendanceRate ?? 0;
  const seatOccupancyRate = analytics?.seatOccupancyRate ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner with Action */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 p-1.5 shrink-0 flex items-center justify-center shadow-xs">
              <img
                src="/dmi-logo.png"
                alt="DMI College of Engineering Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DMI College of Engineering • Organizer & Admin Board</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Event Management & Attendee Operations
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Create events, track live registrations, verify attendee passes, and inspect analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="btn-refresh-organizer-data"
              type="button"
              onClick={onRefreshData}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="btn-create-event-top"
              type="button"
              onClick={onCreateEvent}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              Host New Event
            </button>
          </div>
        </div>

        {/* 4 Key KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="flex items-center justify-between text-purple-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Events Hosted</span>
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalEvents}</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center justify-between text-indigo-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registrations</span>
              <Users className="w-4 h-4" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalRegistrations}</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Checked-In</span>
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCheckedIn}</span>
              <span className="text-xs font-bold text-emerald-600">({attendanceRate}%)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Occupancy Rate</span>
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{seatOccupancyRate}%</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Events vs Attendee Tracker vs Analytics */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          id="organizer-tab-events"
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Event Roster ({events.length})
        </button>

        <button
          id="organizer-tab-attendees"
          type="button"
          onClick={() => setActiveTab('attendees')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'attendees'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Live Attendee Tracker</span>
          {attendees.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
              {attendees.length}
            </span>
          )}
        </button>

        <button
          id="organizer-tab-analytics"
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Department & Category Insights
        </button>
      </div>

      {/* TAB 1: Events Management */}
      {activeTab === 'events' && (
        <div>
          {events.length === 0 ? (
            <EmptyState
              type="organizer-events"
              title="No events created yet"
              description="Your organizer board currently has no events. Click below to host your first symposium, workshop, or technical hackathon."
              actionText="+ Host Your First Event"
              onAction={onCreateEvent}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Event Details</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Date & Schedule</th>
                      <th className="py-3.5 px-4">Capacity & Registrations</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((evt) => {
                      const regCount = evt.registeredCount || 0;
                      const occupancy = Math.round((regCount / evt.maxCapacity) * 100);

                      return (
                        <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block text-sm">
                              {evt.title}
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {evt.venue} • {evt.department}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-purple-100 text-purple-700">
                              {evt.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 block">
                              {new Date(evt.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(evt.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="w-36">
                              <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                                <span>{regCount} / {evt.maxCapacity}</span>
                                <span>{occupancy}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${regCount >= evt.maxCapacity ? 'bg-red-500' : 'bg-purple-600'}`}
                                  style={{ width: `${Math.min(100, occupancy)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                              {evt.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                id={`btn-track-attendees-${evt.id}`}
                                type="button"
                                onClick={() => {
                                  setSelectedEventId(evt.id);
                                  setActiveTab('attendees');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1"
                              >
                                <Users className="w-3 h-3" />
                                Attendees
                              </button>

                              <button
                                id={`btn-edit-event-${evt.id}`}
                                type="button"
                                onClick={() => onEditEvent(evt)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                title="Edit Event"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                id={`btn-delete-event-${evt.id}`}
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to cancel and delete "${evt.title}"?`)) {
                                    onDeleteEvent(evt.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete Event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Attendee Tracker */}
      {activeTab === 'attendees' && (
        <div className="space-y-4">
          {/* Header toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Select Event:</span>
              <select
                id="select-attendee-tracker-event"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/30 max-w-xs truncate"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.registeredCount || 0} registered)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  id="search-attendees-input"
                  type="text"
                  placeholder="Search by student or ticket..."
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 w-48 sm:w-60"
                />
              </div>

              <button
                id="btn-export-csv"
                type="button"
                disabled={attendees.length === 0}
                onClick={exportCSV}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Attendee Roster Table */}
          {events.length === 0 ? (
            <EmptyState
              type="organizer-events"
              title="No events to track"
              description="Create an event first to track attendee registrations and live check-ins."
              actionText="+ Host Event"
              onAction={onCreateEvent}
            />
          ) : attendees.length === 0 ? (
            <EmptyState
              type="attendees"
              title="No registrations for this event yet"
              description={`Students registering for "${selectedEvent?.title || 'this event'}" will appear here with ticket passes and check-in switches.`}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Attendee Name</th>
                      <th className="py-3 px-4">Department & College</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4">Check-in Status</th>
                      <th className="py-3 px-4 text-right">Toggle Check-in</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendees.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">
                          {att.ticketId}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{att.studentName}</span>
                          <span className="text-[11px] text-slate-400 block">{att.studentEmail}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">{att.department}</span>
                          <span className="text-[11px] text-slate-500 block">{att.college}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                          {new Date(att.registeredAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              att.checkedIn
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {att.checkedIn ? 'Checked In' : 'Registered'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            id={`btn-checkin-toggle-${att.id}`}
                            type="button"
                            onClick={() => handleToggleCheckIn(att.id)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                              att.checkedIn
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            {att.checkedIn ? 'Mark Absent' : 'Check In'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Analytics & Insights */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Event Distribution by Category
            </h3>
            {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
              <div className="space-y-3 pt-2">
                {analytics.categoryBreakdown.map((c) => (
                  <div key={c.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{c.category}</span>
                      <span>{c.count} events ({c.registrations} registrations)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((c.count / Math.max(1, totalEvents)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                No category data available yet. Create events to view analytics.
              </p>
            )}
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Department Participation Breakdown
            </h3>
            {analytics?.departmentBreakdown && analytics.departmentBreakdown.length > 0 ? (
              <div className="space-y-3 pt-2">
                {analytics.departmentBreakdown.map((d) => (
                  <div key={d.department} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span className="truncate pr-2">{d.department}</span>
                      <span className="shrink-0">{d.count} students</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((d.count / Math.max(1, totalRegistrations)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                No department registration data available yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
