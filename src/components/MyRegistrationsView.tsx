import React, { useState } from 'react';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Award,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Registration, EventItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from './EmptyState';
import { api } from '../services/api';

interface MyRegistrationsViewProps {
  registrations: (Registration & { event: EventItem | null })[];
  onExploreEvents: () => void;
  onViewPass: (registration: Registration, event: EventItem) => void;
  onRefreshRegistrations: () => void;
}

export const MyRegistrationsView: React.FC<MyRegistrationsViewProps> = ({
  registrations,
  onExploreEvents,
  onViewPass,
  onRefreshRegistrations
}) => {
  const { user } = useAuth();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelModal, setConfirmCancelModal] = useState<Registration | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeRegistrations = registrations.filter(r => r.status === 'confirmed');

  const upcomingCount = activeRegistrations.filter(r => {
    if (!r.event?.startDate) return true;
    return new Date(r.event.startDate) >= new Date();
  }).length;

  const checkedInCount = activeRegistrations.filter(r => r.checkedIn).length;

  const handleCancelConfirm = async () => {
    if (!confirmCancelModal) return;
    setCancellingId(confirmCancelModal.id);

    try {
      await api.cancelRegistration(confirmCancelModal.id);
      setStatusMessage('Registration successfully cancelled. Seat has been restored to the event pool.');
      setConfirmCancelModal(null);
      onRefreshRegistrations();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel registration');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Date TBA';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Student Welcome Header (matching Figma Screen 4) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Hub Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track your event passes, schedules, attendance badges, and cancellation options.
            </p>
          </div>

          <button
            id="btn-browse-more-events"
            type="button"
            onClick={onExploreEvents}
            className="self-start sm:self-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
          >
            Explore More Events
          </button>
        </div>

        {/* Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Registered
            </span>
            <span className="text-2xl font-black text-purple-700">
              {activeRegistrations.length.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Upcoming
            </span>
            <span className="text-2xl font-black text-indigo-700">
              {upcomingCount.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Attended / Verified
            </span>
            <span className="text-2xl font-black text-emerald-700">
              {checkedInCount.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Certificates
            </span>
            <span className="text-2xl font-black text-slate-700">
              {checkedInCount.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Success alert message */}
      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Registered Events List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-600" />
            My Registered Passes & Tickets
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {activeRegistrations.length} {activeRegistrations.length === 1 ? 'pass active' : 'passes active'}
          </span>
        </div>

        {activeRegistrations.length === 0 ? (
          <EmptyState
            type="registrations"
            title="No registered events yet"
            description="You have not booked a seat for any campus events yet. Explore hackathons, symposiums, and workshops to get your digital pass."
            actionText="Discover Events"
            onAction={onExploreEvents}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRegistrations.map((reg) => {
              const event = reg.event;
              if (!event) return null;

              return (
                <div
                  key={reg.id}
                  id={`registered-card-${reg.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all group"
                >
                  <div>
                    {/* Top Row: Category + Ticket ID */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-100 text-purple-700">
                        {event.category}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {reg.ticketId}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1 mb-2">
                      {event.title}
                    </h3>

                    {/* Date and Venue */}
                    <div className="space-y-1 text-xs text-slate-600 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        reg.checkedIn
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {reg.checkedIn ? 'Attendance Confirmed' : 'Registration Confirmed'}
                      </span>
                    </div>
                  </div>

                  {/* Actions: View Pass & Cancel */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <button
                      id={`btn-view-pass-${reg.id}`}
                      type="button"
                      onClick={() => onViewPass(reg, event)}
                      className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Digital Pass
                    </button>

                    <button
                      id={`btn-cancel-reg-${reg.id}`}
                      type="button"
                      disabled={cancellingId === reg.id}
                      onClick={() => setConfirmCancelModal(reg)}
                      className="py-2 px-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                      title="Cancel Registration"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {confirmCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Cancel Registration?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to cancel your pass for{' '}
                <strong className="text-slate-800">{confirmCancelModal.studentName}</strong>?
                This seat will be immediately released back to the event capacity.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelModal(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
              >
                Keep Registration
              </button>
              <button
                id="btn-confirm-cancel-reg"
                type="button"
                onClick={handleCancelConfirm}
                className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                Yes, Cancel Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
