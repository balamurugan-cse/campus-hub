import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { EventItem } from '../types';

interface EventCardProps {
  event: EventItem;
  isRegistered?: boolean;
  onRegisterClick: (event: EventItem) => void;
  onViewDetails: (event: EventItem) => void;
  onViewTicket?: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isRegistered,
  onRegisterClick,
  onViewDetails,
  onViewTicket
}) => {
  const remainingSeats = Math.max(0, event.maxCapacity - (event.registeredCount || 0));
  const isFull = remainingSeats <= 0;
  const occupancyPercent = Math.min(100, Math.round(((event.registeredCount || 0) / event.maxCapacity) * 100));
  const isAlmostFull = !isFull && remainingSeats <= Math.max(5, event.maxCapacity * 0.15);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Hackathon':
        return 'bg-indigo-600 text-white';
      case 'Workshop':
        return 'bg-violet-600 text-white';
      case 'Symposium':
        return 'bg-purple-600 text-white';
      case 'Webinar':
        return 'bg-blue-600 text-white';
      case 'Sports':
        return 'bg-emerald-600 text-white';
      case 'Cultural':
        return 'bg-rose-600 text-white';
      default:
        return 'bg-purple-600 text-white';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
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
    <div 
      id={`event-card-${event.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 hover:shadow-md transition-all flex flex-col overflow-hidden group"
    >
      {/* Top Banner / Poster */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-purple-900 via-indigo-800 to-slate-900 flex flex-col justify-end p-4">
            <div className="flex items-center gap-1.5 text-purple-200 text-xs font-semibold mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>{event.department}</span>
            </div>
            <h4 className="text-white font-bold text-lg line-clamp-1">{event.title}</h4>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm ${getCategoryStyles(event.category)}`}>
            {event.category}
          </span>
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-slate-800 shadow-sm">
            {event.format}
          </span>
        </div>

        {/* Status or Full Tag */}
        {isFull && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-600 text-white shadow-sm uppercase tracking-wide">
            Housefull
          </div>
        )}
        {isRegistered && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Registered
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Time info */}
          <div className="flex items-center gap-3 text-xs text-purple-700 font-semibold mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              {formatDate(event.startDate)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              {formatTime(event.startDate)}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails(event)}
            className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors cursor-pointer line-clamp-2 mb-2"
          >
            {event.title}
          </h3>

          {/* Short description */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {event.shortDescription || event.fullDescription}
          </p>

          {/* Location / Venue */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Bottom Section: Dynamic Capacity Tracker & CTAs */}
        <div className="pt-3 border-t border-slate-100">
          
          {/* Dynamic Seat Capacity Bar */}
          <div className="mb-3.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-purple-600" />
                <span>Seats: <strong className="text-slate-800">{event.registeredCount || 0}</strong> / {event.maxCapacity}</span>
              </span>
              <span className={isAlmostFull ? 'text-amber-600 font-bold' : isFull ? 'text-red-600 font-bold' : 'text-emerald-600 font-semibold'}>
                {isFull ? '0 seats left' : `${remainingSeats} seats left`}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  isFull ? 'bg-red-500' : isAlmostFull ? 'bg-amber-500' : 'bg-purple-600'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id={`btn-view-details-${event.id}`}
              type="button"
              onClick={() => onViewDetails(event)}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all text-center"
            >
              View Details
            </button>

            {isRegistered ? (
              <button
                id={`btn-view-pass-${event.id}`}
                type="button"
                onClick={() => onViewTicket ? onViewTicket(event) : onViewDetails(event)}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
              >
                <span>View Pass</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                id={`btn-register-event-${event.id}`}
                type="button"
                disabled={isFull}
                onClick={() => onRegisterClick(event)}
                className={`py-2 px-3 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs ${
                  isFull 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 active:scale-98'
                }`}
              >
                <span>{isFull ? 'Sold Out' : 'Register'}</span>
                {!isFull && <ArrowRight className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
