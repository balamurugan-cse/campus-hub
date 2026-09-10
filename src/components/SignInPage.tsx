import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface SignInPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onBackToEvents: () => void;
  initialMode?: 'signin' | 'signup';
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onLoginSuccess,
  onBackToEvents,
  initialMode = 'signin'
}) => {
  const { login, signup, user } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>('student');
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phone, setPhone] = useState('');
  const [college] = useState('DMI College of Engineering');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence & Data Science',
    'MBA / Management Studies',
    'Science & Humanities'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email.trim()) {
          throw new Error('Please enter your email address');
        }
        if (!password.trim()) {
          throw new Error('Please enter your password');
        }
        await login(email.trim(), password);
        setSuccessMessage('Successfully signed in! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(role);
        }, 600);
      } else {
        // Sign up
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        if (!email.trim()) {
          throw new Error('Please enter your email address');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        await signup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          college,
          department,
          phone: phone.trim(),
          password
        } as any);
        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(role);
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-purple-50/30 to-slate-50">
      
      {/* Back button */}
      <div className="max-w-md w-full mx-auto mb-4">
        <button
          id="btn-back-to-events"
          type="button"
          onClick={onBackToEvents}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors p-1.5 rounded-lg hover:bg-slate-200/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campus Events</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
          
          {/* Institution Header */}
          <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 px-6 py-6 text-white text-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md mb-3 flex items-center justify-center">
                <img
                  src="/dmi-logo.png"
                  alt="DMI College of Engineering Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                DMI College of Engineering
              </h1>
              <p className="text-xs font-medium text-purple-200 mt-1">
                Campus Event Hub • Official Sign In Portal
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
            <button
              id="tab-btn-signin"
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-white text-purple-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In to Account
            </button>
            <button
              id="tab-btn-signup"
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-purple-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            
            {/* Error or Success notification */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Account Type & Role *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="role-select-student"
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                    role === 'student'
                      ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20 text-purple-950'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${role === 'student' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Student</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      Register & Attend
                    </span>
                  </div>
                </button>

                <button
                  id="role-select-organizer"
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                    role === 'organizer'
                      ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20 text-purple-950'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${role === 'organizer' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Faculty / Admin</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      Host & Manage
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Additional Fields for Sign Up */}
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-signup-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={role === 'student' ? 'e.g. Bala Murugan' : 'e.g. Dr. Bala Murugan'}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="input-signup-dept"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-signup-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'student' ? 'student@dmice.ac.in or personal email' : 'faculty@dmice.ac.in'}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password *
                </label>
                {mode === 'signin' && (
                  <span className="text-[11px] text-purple-600 font-medium cursor-pointer hover:underline">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Password must be at least 6 characters.
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="btn-submit-auth"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Campus Hub' : 'Create Account & Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Switch Mode Prompt */}
            <div className="text-center pt-2 border-t border-slate-100">
              {mode === 'signin' ? (
                <p className="text-xs text-slate-500">
                  Don't have an account yet?{' '}
                  <button
                    id="btn-switch-to-signup"
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); }}
                    className="font-bold text-purple-700 hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    id="btn-switch-to-signin"
                    type="button"
                    onClick={() => { setMode('signin'); setError(null); }}
                    className="font-bold text-purple-700 hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>

          </form>
        </div>

        {/* Footer info note */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <p>DMI College of Engineering • Palanchur, Chennai</p>
          <p className="mt-0.5 text-[11px]">Official Campus Event Discovery & Registration System</p>
        </div>

      </div>
    </div>
  );
};
