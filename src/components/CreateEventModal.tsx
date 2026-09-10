import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  Image as ImageIcon,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { EventItem, EventCategory, EventFormat } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: EventItem) => void;
  editingEvent?: EventItem | null;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  editingEvent
}) => {
  const { user } = useAuth();

  const [title, setTitle] = useState(editingEvent?.title || '');
  const [category, setCategory] = useState<EventCategory>(editingEvent?.category || 'Symposium');
  const [shortDescription, setShortDescription] = useState(editingEvent?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(editingEvent?.fullDescription || '');
  
  // Format dates for input type="datetime-local": YYYY-MM-DDTHH:mm
  const defaultStartDate = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16);
  const defaultEndDate = new Date(Date.now() + 86400000 * 3 + 3600000 * 4).toISOString().slice(0, 16);
  
  const [startDate, setStartDate] = useState(editingEvent?.startDate ? editingEvent.startDate.slice(0, 16) : defaultStartDate);
  const [endDate, setEndDate] = useState(editingEvent?.endDate ? editingEvent.endDate.slice(0, 16) : defaultEndDate);
  const [venue, setVenue] = useState(editingEvent?.venue || 'Main Auditorium, DMI Campus');
  const [format, setFormat] = useState<EventFormat>(editingEvent?.format || 'Offline');
  const [department, setDepartment] = useState(editingEvent?.department || 'Computer Science & Engineering');
  const [maxCapacity, setMaxCapacity] = useState(editingEvent?.maxCapacity?.toString() || '120');
  const [posterUrl, setPosterUrl] = useState(editingEvent?.posterUrl || '');
  const [entryFee, setEntryFee] = useState(editingEvent?.entryFee || 'Free for students');
  const [perksText, setPerksText] = useState(editingEvent?.perks?.join(', ') || 'Certificate of Participation, Cash Prizes, Lunch & Refreshments, On-Duty Attendance');

  const [scheduleItems, setScheduleItems] = useState<{ time: string; title: string; detail?: string }[]>(
    editingEvent?.schedule && editingEvent.schedule.length > 0 
      ? editingEvent.schedule 
      : [
          { time: '09:00 AM', title: 'Inauguration & Keynote Address', detail: 'Auditorium' },
          { time: '11:00 AM', title: 'Round 1: Technical Challenge', detail: 'Computer Lab 3' },
          { time: '02:00 PM', title: 'Final Pitching & Award Ceremony', detail: 'Seminar Hall' }
        ]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset quick fill templates inspired by the attached files
  const applyTemplate = (templateType: 'techno' | 'hackathon' | 'workshop') => {
    if (templateType === 'techno') {
      setTitle('TECHNO-SYNAPSE 2026: National Level Technical Symposium');
      setCategory('Symposium');
      setShortDescription('Annual flagship technical symposium presented by the Department of Computer Science & Engineering at DMI College of Engineering.');
      setFullDescription(`TECHNO-SYNAPSE is the premier national-level technical symposium hosted by the Department of Computer Science & Engineering at DMI College of Engineering, Palanchur, Chennai.\n\nEvents included in this grand symposium:\n• Code Debugging & Hackathon\n• Web Development Sprint Challenge\n• AI / Machine Learning Project Expo\n• Technical Quiz Championship\n• Research Paper Presentation\n\nWin exciting cash prizes, merit certificates, and networking opportunities with industry tech leaders.`);
      setVenue('Campus Auditorium & Computer Labs, DMI College of Engineering');
      setFormat('Offline');
      setDepartment('Computer Science & Engineering');
      setMaxCapacity('250');
      setPosterUrl('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80');
      setPerksText('Cash Awards, Certificate of Excellence, On-Duty Attendance Credit, Lunch & Refreshments, Industry Mentorship');
      setScheduleItems([
        { time: '09:30 AM', title: 'Grand Inauguration & Keynote by Industry Leaders', detail: 'Campus Auditorium' },
        { time: '11:00 AM', title: 'Parallel Tracks: Hackathon & Web Challenge', detail: 'Computing Labs 1 & 2' },
        { time: '01:00 PM', title: 'Networking Lunch', detail: 'College Food Court' },
        { time: '02:00 PM', title: 'AI Project Expo & Technical Quiz Finals', detail: 'Seminar Hall' },
        { time: '04:00 PM', title: 'Valedictory & Prize Distribution', detail: 'Auditorium' }
      ]);
    } else if (templateType === 'hackathon') {
      setTitle('AI Build Sprint 2026: 48-Hour Student Hackathon');
      setCategory('Hackathon');
      setShortDescription('Build, validate, and demo an AI-powered solution with mentors, workshops, and final presentation.');
      setFullDescription(`48-hour student hackathon focusing on practical AI solutions. Build with Google Gemini API, deploy working web prototypes, and present to a jury of senior software engineers and startup founders.\n\nOpen to all engineering and computer science students.`);
      setVenue('Campus Innovation Center & Virtual Discord');
      setFormat('Hybrid');
      setDepartment('All Departments');
      setMaxCapacity('150');
      setPosterUrl('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80');
      setPerksText('Cash Pool ₹50,000, Cloud Credits, Winner Trophy, Internship Opportunities');
      setScheduleItems([
        { time: 'Day 1 - 09:00 AM', title: 'Problem Statement Release & Team Ideation', detail: 'Main Stage' },
        { time: 'Day 1 - 06:00 PM', title: 'Mentor Check-in & Architecture Review', detail: 'Lab 4' },
        { time: 'Day 2 - 03:00 PM', title: 'Final Pitch Deck & Live Product Demos', detail: 'Auditorium' }
      ]);
    } else {
      setTitle('Design Thinking & Full-Stack UI/UX Workshop');
      setCategory('Workshop');
      setShortDescription('Hands-on interactive masterclass covering wireframing, responsive component design, and modern front-end workflows.');
      setFullDescription(`Learn how to transform user requirements and problem statements into intuitive, accessible user interfaces. We will cover wireframing, typography, color contrast, and building responsive layouts in modern frameworks.`);
      setVenue('Seminar Hall B, Academic Block');
      setFormat('Offline');
      setDepartment('Information Technology');
      setMaxCapacity('80');
      setPosterUrl('https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80');
      setPerksText('Hands-on Figma Assets, Participation Certificate, Refreshments');
      setScheduleItems([
        { time: '10:00 AM', title: 'Foundations of Human-Centered UI/UX', detail: 'Lecture' },
        { time: '11:30 AM', title: 'Live Wireframing & Prototyping Workshop', detail: 'Hands-on Lab' },
        { time: '01:30 PM', title: 'Peer Review & Showcase', detail: 'Hall B' }
      ]);
    }
  };

  const addScheduleRow = () => {
    setScheduleItems([...scheduleItems, { time: '', title: '', detail: '' }]);
  };

  const updateScheduleRow = (idx: number, field: string, val: string) => {
    const copy = [...scheduleItems];
    copy[idx] = { ...copy[idx], [field]: val };
    setScheduleItems(copy);
  };

  const removeScheduleRow = (idx: number) => {
    setScheduleItems(scheduleItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const perks = perksText
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

      const payload: Partial<EventItem> = {
        title,
        category,
        shortDescription,
        fullDescription,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        venue,
        format,
        department,
        eligibleDepartments: [department],
        maxCapacity: parseInt(maxCapacity, 10) || 100,
        posterUrl,
        entryFee,
        perks,
        schedule: scheduleItems.filter(s => s.time && s.title),
        organizerName: user?.name || 'Department Coordinator',
        organizerContact: user?.email || 'events@dmi.edu',
        organizerId: user?.id || 'admin_1'
      };

      let resultEvent: EventItem;
      if (editingEvent?.id) {
        const res = await api.updateEvent(editingEvent.id, payload);
        resultEvent = res.event;
      } else {
        const res = await api.createEvent(payload);
        resultEvent = res.event;
      }

      onEventCreated(resultEvent);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div 
        id="create-event-modal-card"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs shrink-0">
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200 block">
                DMI College of Engineering • Organizer Portal
              </span>
              <h2 className="text-lg font-black tracking-tight">
                {editingEvent ? 'Edit Event Details' : 'Create & Host New Campus Event'}
              </h2>
            </div>
          </div>
          <button
            id="btn-close-create-event-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Fill Templates Bar (Fast tester assistance) */}
        {!editingEvent && (
          <div className="bg-purple-50/80 px-6 py-3 border-b border-purple-100 shrink-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Quick-Fill Form Templates (1-Click Populate):
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  id="template-btn-techno"
                  type="button"
                  onClick={() => applyTemplate('techno')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-100/60 transition-colors shadow-xs"
                >
                  ⚡ Techno-Synapse Symposium
                </button>
                <button
                  id="template-btn-hackathon"
                  type="button"
                  onClick={() => applyTemplate('hackathon')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100/60 transition-colors shadow-xs"
                >
                  ⚡ AI Build Sprint
                </button>
                <button
                  id="template-btn-workshop"
                  type="button"
                  onClick={() => applyTemplate('workshop')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-violet-200 text-violet-700 text-xs font-semibold hover:bg-violet-100/60 transition-colors shadow-xs"
                >
                  ⚡ UI/UX Workshop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Title *
              </label>
              <input
                id="event-input-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Techno-Synapse 2026 / AI Hackathon"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                id="event-input-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
              >
                <option value="Symposium">Symposium</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Workshop">Workshop</option>
                <option value="Webinar">Webinar</option>
                <option value="Sports">Sports Meet</option>
                <option value="Cultural">Cultural Fest</option>
              </select>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Summary (shown in cards) *
            </label>
            <input
              id="event-input-short-desc"
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief 1-2 sentence overview of the opportunity..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Event Description & Rules
            </label>
            <textarea
              id="event-input-full-desc"
              rows={3}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Comprehensive details, rounds, tracks, and instructions for student participants..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
            />
          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date & Time *
              </label>
              <input
                id="event-input-start-date"
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date & Time *
              </label>
              <input
                id="event-input-end-date"
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30"
              />
            </div>
          </div>

          {/* Venue, Format, Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Venue / Hall / Link *
              </label>
              <input
                id="event-input-venue"
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Auditorium / Lab 3 / Zoom"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Format
              </label>
              <select
                id="event-input-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as EventFormat)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/30"
              >
                <option value="Offline">In-Person (Campus)</option>
                <option value="Online">Virtual (Online)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Capacity (Seats) *
              </label>
              <input
                id="event-input-capacity"
                type="number"
                min="1"
                required
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="100"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30"
              />
            </div>
          </div>

          {/* Department & Poster URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Host Department / Society
              </label>
              <select
                id="event-input-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/30"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="MBA / Management">MBA / Management</option>
                <option value="All Departments">All Departments (Open)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Poster Image URL (Optional)
              </label>
              <input
                id="event-input-poster"
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://.../poster.jpg"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30"
              />
            </div>
          </div>

          {/* Perks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Perks & What You Get (comma separated)
            </label>
            <input
              id="event-input-perks"
              type="text"
              value={perksText}
              onChange={(e) => setPerksText(e.target.value)}
              placeholder="Certificate of Participation, Cash Prizes, Lunch, On-Duty"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30"
            />
          </div>

          {/* Dynamic Schedule Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Event Schedule & Agenda
              </label>
              <button
                type="button"
                onClick={addScheduleRow}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Schedule Slot
              </button>
            </div>

            <div className="space-y-2">
              {scheduleItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 09:30 AM"
                    value={item.time}
                    onChange={(e) => updateScheduleRow(idx, 'time', e.target.value)}
                    className="w-28 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Session / Track title"
                    value={item.title}
                    onChange={(e) => updateScheduleRow(idx, 'title', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Venue / Lab"
                    value={item.detail || ''}
                    onChange={(e) => updateScheduleRow(idx, 'detail', e.target.value)}
                    className="w-28 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none hidden sm:block"
                  />
                  {scheduleItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScheduleRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-event"
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Publish Campus Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
