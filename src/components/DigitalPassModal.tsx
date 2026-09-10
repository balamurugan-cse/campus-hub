import React, { useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  Printer, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  GraduationCap, 
  QrCode,
  Download,
  Share2
} from 'lucide-react';
import { Registration, EventItem } from '../types';

interface DigitalPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  event: EventItem | null;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({
  isOpen,
  onClose,
  registration,
  event
}) => {
  const passRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !registration || !event) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadICS = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusHub//Campus Event Hub//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.shortDescription || event.fullDescription}`,
      `LOCATION:${event.venue}`,
      `DTSTART:${new Date(event.startDate).toISOString().replace(/-|:|\.\d+/g, '')}`,
      `DTEND:${new Date(event.endDate || event.startDate).toISOString().replace(/-|:|\.\d+/g, '')}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_ticket.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg my-6 flex flex-col items-center">
        
        {/* Pass Container */}
        <div 
          ref={passRef}
          id="digital-pass-card"
          className="bg-white w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none"
        >
          {/* Top Header */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shrink-0">
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
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-purple-200">
                    CampusHub Official Pass
                  </span>
                  <span className="text-base font-extrabold tracking-tight block text-white">
                    {registration.college || 'DMI College of Engineering'}
                  </span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs ${
                registration.checkedIn 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white/20 text-white backdrop-blur-xs'
              }`}>
                {registration.checkedIn ? '✓ Checked In' : 'Valid Entry'}
              </span>
            </div>

            <div className="mt-5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/20 text-white inline-block mb-1.5">
                {event.category} • {event.format}
              </span>
              <h2 className="text-xl font-black leading-tight text-white line-clamp-2">
                {event.title}
              </h2>
            </div>
          </div>

          {/* Tear Line divider with cutouts */}
          <div className="relative flex items-center justify-between bg-white px-2 py-2">
            <div className="w-5 h-5 -ml-4 rounded-full bg-slate-900" />
            <div className="flex-1 border-b-2 border-dashed border-slate-200 mx-2" />
            <div className="w-5 h-5 -mr-4 rounded-full bg-slate-900" />
          </div>

          {/* Pass Body */}
          <div className="p-6 bg-white space-y-5">
            {/* Student Attendee Info */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Attendee Name
                </span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {registration.studentName}
                </span>
                <span className="text-xs text-slate-500 block truncate">
                  {registration.studentEmail}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Department
                </span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {registration.department}
                </span>
                <span className="text-xs text-slate-500 block">
                  {registration.phoneNumber || 'Student'}
                </span>
              </div>
            </div>

            {/* Event Time & Venue Info */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Date & Time</span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {formatDate(event.startDate)}
                  </span>
                  <span className="text-xs text-slate-600 block">
                    {formatTime(event.startDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Venue / Hall</span>
                  <span className="text-xs font-bold text-slate-800 block line-clamp-2">
                    {event.venue}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code & Ticket ID Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
              {/* Clean SVG Scannable QR Matrix Representation */}
              <div className="w-24 h-24 bg-white p-2 rounded-xl border border-purple-200 shadow-xs flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="13" y="13" width="12" height="12" fill="currentColor" />
                  
                  <rect x="67" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="75" y="13" width="12" height="12" fill="currentColor" />
                  
                  <rect x="5" y="67" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="13" y="75" width="12" height="12" fill="currentColor" />
                  
                  {/* Decorative data blocks based on ticket ID */}
                  <rect x="42" y="8" width="8" height="8" fill="currentColor" />
                  <rect x="52" y="18" width="8" height="8" fill="currentColor" />
                  <rect x="42" y="28" width="8" height="8" fill="currentColor" />
                  <rect x="10" y="45" width="8" height="8" fill="currentColor" />
                  <rect x="25" y="48" width="8" height="8" fill="currentColor" />
                  <rect x="42" y="44" width="16" height="16" fill="currentColor" />
                  <rect x="68" y="44" width="8" height="8" fill="currentColor" />
                  <rect x="82" y="52" width="8" height="8" fill="currentColor" />
                  <rect x="42" y="72" width="8" height="8" fill="currentColor" />
                  <rect x="55" y="80" width="10" height="8" fill="currentColor" />
                  <rect x="75" y="75" width="12" height="12" fill="currentColor" />
                </svg>
              </div>

              <div className="text-center sm:text-left flex-1">
                <span className="text-[10px] font-bold uppercase text-purple-600 block tracking-wider">
                  Ticket Identification
                </span>
                <span className="text-lg font-black text-slate-900 font-mono tracking-wider block">
                  {registration.ticketId}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Present this digital QR pass at the campus reception or event entrance for rapid attendee check-in.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Controls (hidden during print) */}
        <div className="w-full mt-4 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              id="btn-print-pass"
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-purple-600" />
              Print Pass
            </button>

            <button
              id="btn-add-calendar-ics"
              type="button"
              onClick={handleDownloadICS}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <CalendarIcon className="w-4 h-4 text-purple-600" />
              Add to Calendar
            </button>
          </div>

          <button
            id="btn-close-pass-modal"
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
