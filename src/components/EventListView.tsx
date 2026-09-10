import React from 'react';
import { Calendar, MapPin, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { EventItem } from '../types';

interface EventListViewProps {
  events: EventItem[];
  userRegisteredEventIds: Set<string>;
  onRegisterClick: (event: EventItem) => void;
  onViewDetails: (event: EventItem) => void;
  onViewTicket: (event: EventItem) => void;
}

export const EventListView: React.FC<EventListViewProps> = ({
  events,
  userRegisteredEventIds,
  onRegisterClick,
  onViewDetails,
  onViewTicket
}) => {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
      {events.map((event) => {
        const isRegistered = userRegisteredEventIds.has(event.id);
        const remainingSeats = Math.max(0, event.maxCapacity - (event.registeredCount || 0));
        const isFull = remainingSeats <= 0;

        return (
          <div
            key={event.id}
            id={`event-list-row-${event.id}`}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
          >
            {/* Left: Date badge + Info */}
            <div className="flex items-start sm:items-center gap-4">
              {/* Date Box */}
              <div className="w-14 h-14 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center shrink-0 text-center">
                <span className="text-[10px] uppercase font-bold text-purple-600">
                  {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-base font-extrabold text-slate-900 leading-none">
                  {new Date(event.startDate).getDate()}
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
                    {event.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                    {event.format}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {event.department}
                  </span>
                </div>

                <h4 
                  onClick={() => onViewDetails(event)}
                  className="text-sm sm:text-base font-bold text-slate-900 hover:text-purple-600 cursor-pointer transition-colors"
                >
                  {event.title}
                </h4>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {event.venue}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    {remainingSeats} / {event.maxCapacity} seats left
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:self-center self-end shrink-0">
              <button
                type="button"
                id={`btn-list-details-${event.id}`}
                onClick={() => onViewDetails(event)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                Details
              </button>

              {isRegistered ? (
                <button
                  type="button"
                  id={`btn-list-pass-${event.id}`}
                  onClick={() => onViewTicket(event)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pass
                </button>
              ) : (
                <button
                  type="button"
                  id={`btn-list-register-${event.id}`}
                  disabled={isFull}
                  onClick={() => onRegisterClick(event)}
                  className={`px-4 py-1.5 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1 shadow-xs ${
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
        );
      })}
    </div>
  );
};
