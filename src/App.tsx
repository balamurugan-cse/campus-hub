import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EventFilters } from './components/EventFilters';
import { EventCard } from './components/EventCard';
import { EventListView } from './components/EventListView';
import { CalendarView } from './components/CalendarView';
import { EventDetailModal } from './components/EventDetailModal';
import { RegistrationModal } from './components/RegistrationModal';
import { DigitalPassModal } from './components/DigitalPassModal';
import { MyRegistrationsView } from './components/MyRegistrationsView';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { CreateEventModal } from './components/CreateEventModal';
import { AuthModal } from './components/AuthModal';
import { EmptyState } from './components/EmptyState';
import { SignInPage } from './components/SignInPage';
import { NavTab } from './components/Navbar';
import { api } from './services/api';
import { EventItem, Registration, EventFilterState, ViewMode } from './types';
import { Sparkles, Calendar, Ticket, ShieldCheck, ArrowUpRight } from 'lucide-react';

function CampusEventHubApp() {
  const { user, role, isAuthModalOpen, closeAuthModal, switchRole } = useAuth();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<NavTab>('feed');

  // Core Data State (Starts strictly empty as required)
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<(Registration & { event: EventItem | null })[]>([]);
  const [loading, setLoading] = useState(true);

  // View & Filter State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<EventFilterState>({
    searchQuery: '',
    category: 'all',
    department: 'all',
    format: 'all',
    dateFilter: 'all'
  });

  // Modals
  const [detailModalEvent, setDetailModalEvent] = useState<EventItem | null>(null);
  const [registrationModalEvent, setRegistrationModalEvent] = useState<EventItem | null>(null);
  const [passModal, setPassModal] = useState<{
    isOpen: boolean;
    registration: Registration | null;
    event: EventItem | null;
  }>({
    isOpen: false,
    registration: null,
    event: null
  });
  const [createEventModal, setCreateEventModal] = useState<{
    isOpen: boolean;
    editingEvent: EventItem | null;
  }>({
    isOpen: false,
    editingEvent: null
  });

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch events and registrations
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [eventsRes, regRes] = await Promise.all([
        api.getEvents(),
        api.getRegistrations(user?.id, user?.email)
      ]);
      setEvents(eventsRes.events || []);
      setRegistrations(regRes.registrations || []);
    } catch (err) {
      console.error('Failed to load hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Set of event IDs user is registered for
  const userRegisteredEventIds = useMemo(() => {
    return new Set(registrations.filter(r => r.status === 'confirmed').map(r => r.eventId));
  }, [registrations]);

  // Client-side filtering
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Status filter
      if (event.status === 'cancelled') return false;

      // Category filter
      if (filters.category !== 'all' && event.category?.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }

      // Department filter
      if (filters.department !== 'all') {
        const matchesDept = 
          event.department === 'All Departments' || 
          event.eligibleDepartments?.includes('All Departments') ||
          event.department === filters.department || 
          event.eligibleDepartments?.includes(filters.department);
        if (!matchesDept) return false;
      }

      // Format filter
      if (filters.format !== 'all' && event.format?.toLowerCase() !== filters.format.toLowerCase()) {
        return false;
      }

      // Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery = 
          event.title.toLowerCase().includes(q) ||
          event.shortDescription?.toLowerCase().includes(q) ||
          event.venue?.toLowerCase().includes(q) ||
          event.department?.toLowerCase().includes(q) ||
          event.organizerName?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Date filter
      if (filters.dateFilter !== 'all' && event.startDate) {
        const eventDate = new Date(event.startDate);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        if (filters.dateFilter === 'today') {
          if (eventDate < todayStart || eventDate >= todayEnd) return false;
        } else if (filters.dateFilter === 'week') {
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (eventDate < todayStart || eventDate > nextWeek) return false;
        } else if (filters.dateFilter === 'month') {
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          if (eventDate < todayStart || eventDate > nextMonth) return false;
        } else if (filters.dateFilter === 'upcoming') {
          if (eventDate < todayStart) return false;
        }
      }

      return true;
    });
  }, [events, filters]);

  // Event actions
  const handleRegisterClick = (event: EventItem) => {
    if (!user) {
      setCurrentTab('signin');
      showToast('Please sign in to your account to register for events.');
      return;
    }
    setRegistrationModalEvent(event);
  };

  const handleViewDetails = (event: EventItem) => {
    setDetailModalEvent(event);
  };

  const handleViewTicket = (event: EventItem) => {
    const reg = registrations.find(r => r.eventId === event.id && r.status === 'confirmed');
    if (reg) {
      setPassModal({
        isOpen: true,
        registration: reg,
        event
      });
    } else {
      setDetailModalEvent(event);
    }
  };

  const handleRegistrationSuccess = (registration: Registration, event: EventItem) => {
    // Refresh list and open digital pass modal
    fetchAllData();
    setPassModal({
      isOpen: true,
      registration,
      event
    });
    showToast(`Registration confirmed! Your pass ${registration.ticketId} is ready.`);
  };

  const handleEventCreated = (newEvent: EventItem) => {
    fetchAllData();
    showToast(`Campus event "${newEvent.title}" published successfully.`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await api.deleteEvent(eventId);
      fetchAllData();
      showToast('Event removed from campus schedule.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 text-sm font-semibold border border-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        registeredCount={userRegisteredEventIds.size}
      />

      {/* Main Content Areas based on Tab */}
      <main className="flex-1">
        
        {/* VIEW 1: DISCOVER / FEED */}
        {currentTab === 'feed' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              events={events}
              searchQuery={filters.searchQuery}
              onSearchChange={(query) => setFilters(prev => ({ ...prev, searchQuery: query }))}
              selectedCategory={filters.category}
              onSelectCategory={(category) => setFilters(prev => ({ ...prev, category }))}
              onExploreClick={() => {
                const el = document.getElementById('events-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Events Feed Container */}
            <div id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              
              {/* Filter and View Mode Switcher */}
              <EventFilters
                filters={filters}
                onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
                onResetFilters={() => setFilters({
                  searchQuery: '',
                  category: 'all',
                  department: 'all',
                  format: 'all',
                  dateFilter: 'all'
                })}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalEventsCount={filteredEvents.length}
              />

              {/* Feed Content */}
              {loading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm font-medium text-slate-500">Loading campus event hub...</p>
                </div>
              ) : events.length === 0 ? (
                /* Strict Empty State when DB has no events initialized */
                <EmptyState
                  type="events"
                  title="No campus events scheduled yet"
                  description="The application database initializes empty. Be the first organizer to host a technical symposium, hackathon, or workshop!"
                  actionText="+ Host First Event"
                  onAction={() => {
                    switchRole('organizer');
                    setCreateEventModal({ isOpen: true, editingEvent: null });
                  }}
                  secondaryActionText="Switch to Organizer Mode"
                  onSecondaryAction={() => {
                    switchRole('organizer');
                    setCurrentTab('organizer');
                  }}
                />
              ) : filteredEvents.length === 0 ? (
                <EmptyState
                  type="search"
                  title="No events match your selected filters"
                  description="Try adjusting your department, category, or date filters to find matching activities."
                  actionText="Clear All Filters"
                  onAction={() => setFilters({
                    searchQuery: '',
                    category: 'all',
                    department: 'all',
                    format: 'all',
                    dateFilter: 'all'
                  })}
                />
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      isRegistered={userRegisteredEventIds.has(evt.id)}
                      onRegisterClick={handleRegisterClick}
                      onViewDetails={handleViewDetails}
                      onViewTicket={handleViewTicket}
                    />
                  ))}
                </div>
              ) : viewMode === 'list' ? (
                <EventListView
                  events={filteredEvents}
                  userRegisteredEventIds={userRegisteredEventIds}
                  onRegisterClick={handleRegisterClick}
                  onViewDetails={handleViewDetails}
                  onViewTicket={handleViewTicket}
                />
              ) : (
                <CalendarView
                  events={events}
                  userRegisteredEventIds={userRegisteredEventIds}
                  onRegisterClick={handleRegisterClick}
                  onViewDetails={handleViewDetails}
                  onViewTicket={handleViewTicket}
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: CALENDAR VIEW */}
        {currentTab === 'calendar' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  Campus Events Calendar
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Interactive schedule of workshops, symposiums, hackathons, and webinars.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentTab('feed')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all self-start sm:self-auto"
              >
                Back to Feed
              </button>
            </div>

            {events.length === 0 ? (
              <EmptyState
                type="events"
                title="Calendar is currently empty"
                description="No campus events have been created yet. Switch to Organizer mode to add the first event to the calendar."
                actionText="+ Host First Event"
                onAction={() => {
                  switchRole('organizer');
                  setCreateEventModal({ isOpen: true, editingEvent: null });
                }}
              />
            ) : (
              <CalendarView
                events={events}
                userRegisteredEventIds={userRegisteredEventIds}
                onRegisterClick={handleRegisterClick}
                onViewDetails={handleViewDetails}
                onViewTicket={handleViewTicket}
              />
            )}
          </div>
        )}

        {/* VIEW 3: STUDENT REGISTRATIONS */}
        {currentTab === 'registrations' && (
          !user ? (
            <div className="max-w-md mx-auto my-16 px-4 text-center">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
                  <Ticket className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Student Sign In Required</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sign in with your student account to access your digital entry passes and active event registrations.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('signin')}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Go to Sign In Page
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <MyRegistrationsView
              registrations={registrations}
              onExploreEvents={() => setCurrentTab('feed')}
              onViewPass={(reg, event) => setPassModal({ isOpen: true, registration: reg, event })}
              onRefreshRegistrations={fetchAllData}
            />
          )
        )}

        {/* VIEW 4: ORGANIZER BOARD & ATTENDEE TRACKER */}
        {currentTab === 'organizer' && (
          !user || (role !== 'organizer' && role !== 'admin') ? (
            <div className="max-w-md mx-auto my-16 px-4 text-center">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Organizer Sign In Required</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The Organizer Board is restricted to verified faculty coordinators and student club leads.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('signin')}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Sign In as Faculty / Organizer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <OrganizerDashboard
              events={events}
              onCreateEvent={() => setCreateEventModal({ isOpen: true, editingEvent: null })}
              onEditEvent={(evt) => setCreateEventModal({ isOpen: true, editingEvent: evt })}
              onDeleteEvent={handleDeleteEvent}
              onRefreshData={fetchAllData}
            />
          )
        )}

        {/* VIEW 5: ORGANIZER ANALYTICS */}
        {currentTab === 'analytics' && (
          !user || (role !== 'organizer' && role !== 'admin') ? (
            <div className="max-w-md mx-auto my-16 px-4 text-center">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Organizer Analytics Restricted</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Please sign in to view analytics and attendee metrics.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('signin')}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Sign In as Faculty / Organizer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <OrganizerDashboard
              events={events}
              onCreateEvent={() => setCreateEventModal({ isOpen: true, editingEvent: null })}
              onEditEvent={(evt) => setCreateEventModal({ isOpen: true, editingEvent: evt })}
              onDeleteEvent={handleDeleteEvent}
              onRefreshData={fetchAllData}
            />
          )
        )}

        {/* VIEW 6: DEDICATED SIGN IN / SIGN UP PAGE */}
        {currentTab === 'signin' && (
          <SignInPage
            onLoginSuccess={(newRole) => {
              showToast('Welcome to Campus Event Hub!');
              if (newRole === 'organizer' || newRole === 'admin') {
                setCurrentTab('organizer');
              } else {
                setCurrentTab('feed');
              }
            }}
            onBackToEvents={() => setCurrentTab('feed')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
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
              <div className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 justify-center sm:justify-start">
                Campus<span className="text-purple-600">Hub</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                  DMICE
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                DMI College of Engineering, Palanchur, Chennai
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-500">
            <span>Official Campus Event & Technical Symposium Hub</span>
            <span className="hidden sm:inline">•</span>
            <span>Anna University Affiliated</span>
            <span className="hidden sm:inline">•</span>
            <span>AICTE Approved</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />

      {/* 2. Event Detail Modal */}
      <EventDetailModal
        event={detailModalEvent}
        isOpen={!!detailModalEvent}
        onClose={() => setDetailModalEvent(null)}
        isRegistered={detailModalEvent ? userRegisteredEventIds.has(detailModalEvent.id) : false}
        onRegisterClick={handleRegisterClick}
        onViewTicket={handleViewTicket}
      />

      {/* 3. Registration Modal */}
      <RegistrationModal
        event={registrationModalEvent}
        isOpen={!!registrationModalEvent}
        onClose={() => setRegistrationModalEvent(null)}
        onRegistrationSuccess={handleRegistrationSuccess}
      />

      {/* 4. Digital Pass Modal */}
      <DigitalPassModal
        isOpen={passModal.isOpen}
        onClose={() => setPassModal({ isOpen: false, registration: null, event: null })}
        registration={passModal.registration}
        event={passModal.event}
      />

      {/* 5. Create / Edit Event Modal */}
      <CreateEventModal
        isOpen={createEventModal.isOpen}
        editingEvent={createEventModal.editingEvent}
        onClose={() => setCreateEventModal({ isOpen: false, editingEvent: null })}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CampusEventHubApp />
    </AuthProvider>
  );
}
