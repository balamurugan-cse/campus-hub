import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Share2, 
  Mail,
  GraduationCap
} from 'lucide-react';
import { EventItem } from '../types';

interface EventDetailModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  isRegistered?: boolean;
  onRegisterClick: (event: EventItem) => void;
  onViewTicket: (event: EventItem) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  isRegistered,
  onRegisterClick,
  onViewTicket
}) => {
  if (!isOpen || !event) return null;

  const remainingSeats = Math.max(0, event.maxCapacity - (event.registeredCount || 0));
  const isFull = remainingSeats <= 0;
  const occupancyPercent = Math.min(100, Math.round(((event.registeredCount || 0) / event.maxCapacity) * 100));

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div 
        id="event-detail-modal-card"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
      >
        {/* Header with image or gradient banner */}
        <div className="relative h-48 sm:h-56 bg-slate-900 shrink-0 overflow-hidden">
          {event.posterUrl ? (
            <img
              src={event.posterUrl}
              alt={event.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 flex flex-col justify-end">
              <span className="text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">
                {event.department}
              </span>
              <h2 className="text-white font-black text-xl sm:text-2xl">{event.title}</h2>
            </div>
          )}

          {/* Close button */}
          <button
            id="btn-close-detail-modal"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-xs"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on banner */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-white/95 text-slate-900 shadow-sm backdrop-blur-xs">
              <img src="/dmi-logo.png" alt="DMI Logo" className="w-4 h-4 object-contain" />
              <span>DMI CE</span>
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase bg-purple-600 text-white shadow-sm">
              {event.category}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/90 text-slate-800 backdrop-blur-xs shadow-sm">
              {event.format}
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Title & Key Specs */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              {event.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {event.shortDescription}
            </p>

            {/* Event Timing & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 p-4 rounded-xl bg-purple-50/60 border border-purple-100">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Date</span>
                  <span className="text-xs font-semibold text-slate-800">{formatDate(event.startDate)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Time</span>
                  <span className="text-xs font-semibold text-slate-800">{formatTime(event.startDate)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Venue</span>
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1">{event.venue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* About this event */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              About this event
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.fullDescription || event.shortDescription}
            </p>
          </div>

          {/* Schedule Breakdown */}
          {event.schedule && event.schedule.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Schedule & Agenda
              </h4>
              <div className="space-y-2">
                {event.schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <span className="text-xs font-bold text-purple-700 w-24 shrink-0">
                      {item.time}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                      {item.detail && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What you get / Perks */}
          {event.perks && event.perks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                What you get
              </h4>
              <div className="flex flex-wrap gap-2">
                {event.perks.map((perk, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200"
                  >
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Organizer Info */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-600 block">Organized by</span>
                <h5 className="text-xs font-bold text-slate-900">{event.organizerName}</h5>
                <p className="text-[11px] text-slate-500">{event.department}</p>
              </div>
            </div>

            {event.organizerContact && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {event.organizerContact}
              </span>
            )}
          </div>
        </div>

        {/* Modal Footer: Dynamic Seat Capacity & Register Button */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {event.entryFee || 'Free for students'}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-medium text-purple-700">
                {remainingSeats} of {event.maxCapacity} seats remaining
              </span>
            </div>
            <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full ${isFull ? 'bg-red-500' : 'bg-purple-600'}`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              Close
            </button>

            {isRegistered ? (
              <button
                id="modal-btn-view-pass"
                type="button"
                onClick={() => {
                  onClose();
                  onViewTicket(event);
                }}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                View Registered Pass
              </button>
            ) : (
              <button
                id="modal-btn-register-action"
                type="button"
                disabled={isFull}
                onClick={() => {
                  onClose();
                  onRegisterClick(event);
                }}
                className={`flex-1 sm:flex-initial py-2.5 px-6 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isFull
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 active:scale-98'
                }`}
              >
                <span>{isFull ? 'Sold Out / Waitlist' : 'Register for Event'}</span>
                {!isFull && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
