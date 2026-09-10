import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Ticket, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { EventItem, Registration } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface RegistrationModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRegistrationSuccess: (registration: Registration, event: EventItem) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegistrationSuccess
}) => {
  const { user } = useAuth();

  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [college, setCollege] = useState('DMI College of Engineering');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setStudentName(user.name || '');
      setStudentEmail(user.email || '');
      if (user.college) setCollege(user.college);
      if (user.department) setDepartment(user.department);
      if (user.phone) setPhoneNumber(user.phone);
    } else {
      setStudentName('');
      setStudentEmail('');
    }
  }, [user, isOpen]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please agree to the event terms and student code of conduct.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api.registerForEvent({
        eventId: event.id,
        userId: user?.id,
        studentName,
        studentEmail,
        college,
        department,
        phoneNumber
      });

      onRegistrationSuccess(res.registration, res.event);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const remaining = Math.max(0, event.maxCapacity - (event.registeredCount || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div 
        id="registration-modal-card"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-800 text-white">
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
              <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider block">
                DMI College of Engineering • Event Registration
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight line-clamp-1">{event.title}</h2>
            </div>
          </div>
          <button
            id="btn-close-reg-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout (matching Figma Screen 3) */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Details</h3>
              <p className="text-xs text-slate-500">
                Complete your details below to reserve your entry pass.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                id="reg-input-name"
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Bala Murugan"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Email *
              </label>
              <input
                id="reg-input-email"
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@dmi.edu"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College / University
                </label>
                <input
                  id="reg-input-college"
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="DMI College of Engineering"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  id="reg-input-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="MBA / Management">MBA / Management</option>
                  <option value="Science & Humanities">Science & Humanities</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                id="reg-input-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
              />
            </div>

            {/* Terms checkbox */}
            <div 
              onClick={() => setAgreeTerms(!agreeTerms)}
              className="flex items-start gap-2 pt-1 cursor-pointer select-none"
            >
              <button
                type="button"
                id="reg-checkbox-terms"
                className="text-purple-600 mt-0.5"
              >
                {agreeTerms ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
              </button>
              <span className="text-xs text-slate-600 leading-snug">
                I agree to the campus event terms, code of conduct, and consent to receive digital entry pass confirmation.
              </span>
            </div>

            <button
              id="btn-submit-registration"
              type="submit"
              disabled={loading || remaining <= 0}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Registration & Generate Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Right Col: Event Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider block mb-2">
                Order Summary
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{event.title}</h4>
              <p className="text-xs text-slate-500 mb-3">{event.venue}</p>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200/80 pt-3">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <strong className="text-slate-800">{event.format}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Registration Fee:</span>
                  <strong className="text-emerald-700">{event.entryFee || 'Free'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Seats Available:</span>
                  <strong className="text-purple-700">{remaining} / {event.maxCapacity}</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-purple-100/70 border border-purple-200 text-purple-900 text-[11px] leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>Instant Digital Ticket</span>
              </div>
              Your unique Ticket ID with scannable QR code will be generated immediately upon confirmation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
