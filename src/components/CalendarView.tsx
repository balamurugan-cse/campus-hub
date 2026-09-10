import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { EventItem } from '../types';

interface CalendarViewProps {
  events: EventItem[];
  userRegisteredEventIds: Set<string>;
  onRegisterClick: (event: EventItem) => void;
  onViewDetails: (event: EventItem) => void;
  onViewTicket: (event: EventItem) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  userRegisteredEventIds,
  onRegisterClick,
  onViewDetails,
  onViewTicket
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    // If there are events, start at the month of the first event, otherwise current date
    if (events.length > 0) {
      return new Date(events[0].startDate);
    }
    return new Date();
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDateStr(todayStr);
  };

  // Month stats
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map events to date string YYYY-MM-DD
  const eventsByDate = React.useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    events.forEach(evt => {
      if (!evt.startDate) return;
      const d = evt.startDate.split('T')[0];
      if (!map[d]) map[d] = [];
      map[d].push(evt);
    });
    return map;
  }, [events]);

  const selectedEvents = selectedDateStr ? eventsByDate[selectedDateStr] || [] : [];

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDayIndex }, (_, i) => i);

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  const getDayDateString = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const getCategoryBg = (cat: string) => {
    switch (cat) {
      case 'Hackathon': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Workshop': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'Symposium': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Webinar': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sports': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cultural': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {monthName} {year}
              </h3>
              <p className="text-xs text-slate-500">
                Click any date to see scheduled campus activities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="calendar-today-btn"
              type="button"
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
            >
              Today
            </button>
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
              <button
                id="calendar-prev-month-btn"
                type="button"
                onClick={prevMonth}
                className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-all"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="calendar-next-month-btn"
                type="button"
                onClick={nextMonth}
                className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-all"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-100 text-center text-[11px] font-bold text-slate-400 py-2.5 bg-slate-50/50">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {/* Leading blank days */}
          {leadingBlanks.map((_, idx) => (
            <div key={`blank-${idx}`} className="h-24 sm:h-28 bg-slate-50/30 p-1.5" />
          ))}

          {/* Month days */}
          {daysArray.map((day) => {
            const dateStr = getDayDateString(day);
            const dayEvents = eventsByDate[dateStr] || [];
            const isSelected = selectedDateStr === dateStr;
            const currentDayFlag = isToday(day);

            return (
              <div
                key={`day-${day}`}
                id={`calendar-day-${dateStr}`}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-24 sm:h-28 p-1.5 sm:p-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-50/60 ring-2 ring-purple-600 ring-inset'
                    : 'hover:bg-slate-50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                      currentDayFlag
                        ? 'bg-purple-600 text-white'
                        : isSelected
                        ? 'text-purple-700 font-extrabold'
                        : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event previews in day cell */}
                <div className="space-y-1 overflow-y-auto max-h-16 no-scrollbar mt-1">
                  {dayEvents.slice(0, 2).map((evt) => (
                    <div
                      key={evt.id}
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border truncate ${getCategoryBg(
                        evt.category
                      )}`}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] font-semibold text-purple-600 text-right pr-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events Drawer / Details Section */}
      {selectedDateStr && (
        <div 
          id="calendar-selected-day-panel"
          className="bg-white rounded-2xl border border-purple-200 p-5 shadow-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Events on Selected Date
              </span>
              <h4 className="text-base font-bold text-slate-900">
                {new Date(selectedDateStr).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h4>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700">
              {selectedEvents.length} {selectedEvents.length === 1 ? 'event scheduled' : 'events scheduled'}
            </span>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              No events scheduled on this day. Click another day on the calendar or explore all upcoming events.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedEvents.map((evt) => {
                const isRegistered = userRegisteredEventIds.has(evt.id);
                const remaining = Math.max(0, evt.maxCapacity - (evt.registeredCount || 0));
                const isFull = remaining <= 0;

                return (
                  <div
                    key={evt.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-700">
                          {evt.category}
                        </span>
                        <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-500" />
                          {new Date(evt.startDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-sm mb-1">{evt.title}</h5>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" />
                        {evt.venue}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                      <span className="text-xs font-medium text-slate-600">
                        {remaining} / {evt.maxCapacity} seats left
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onViewDetails(evt)}
                          className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg"
                        >
                          Details
                        </button>
                        {isRegistered ? (
                          <button
                            type="button"
                            onClick={() => onViewTicket(evt)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                          >
                            Pass
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isFull}
                            onClick={() => onRegisterClick(evt)}
                            className={`px-3 py-1 text-xs font-semibold text-white rounded-lg ${
                              isFull ? 'bg-slate-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            {isFull ? 'Full' : 'Register'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
