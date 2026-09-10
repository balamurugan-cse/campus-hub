import React, { useState } from 'react';
import { 
  GraduationCap, 
  Calendar as CalendarIcon, 
  Compass, 
  Ticket, 
  LayoutDashboard, 
  BarChart3, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export type NavTab = 'feed' | 'calendar' | 'registrations' | 'organizer' | 'analytics' | 'signin';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  registeredCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, registeredCount }) => {
  const { user, role, isLoggedIn, switchRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleRoleToggle = (targetRole: UserRole) => {
    switchRole(targetRole);
    if (targetRole === 'organizer' && (currentTab === 'registrations')) {
      onSelectTab('organizer');
    } else if (targetRole === 'student' && (currentTab === 'organizer' || currentTab === 'analytics')) {
      onSelectTab('feed');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              type="button"
              onClick={() => onSelectTab('feed')}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <div className="relative w-11 h-11 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center p-1 group-hover:border-purple-300 group-hover:shadow-sm transition-all overflow-hidden shrink-0">
                <img
                  src="/dmi-logo.png"
                  alt="DMI College of Engineering Logo"
                  className="w-full h-full object-contain transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center">
                    Campus<span className="text-purple-600">Hub</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-purple-100 text-purple-800 uppercase tracking-wider hidden sm:inline-block">
                    DMI CE
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block -mt-0.5 truncate max-w-[160px] sm:max-w-none">
                  DMI College of Engineering
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                id="nav-tab-feed"
                type="button"
                onClick={() => onSelectTab('feed')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentTab === 'feed'
                    ? 'bg-purple-50 text-purple-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4" />
                Discover
              </button>

              <button
                id="nav-tab-calendar"
                type="button"
                onClick={() => onSelectTab('calendar')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentTab === 'calendar'
                    ? 'bg-purple-50 text-purple-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Calendar
              </button>

              <button
                id="nav-tab-registrations"
                type="button"
                onClick={() => onSelectTab('registrations')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
                  currentTab === 'registrations'
                    ? 'bg-purple-50 text-purple-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Ticket className="w-4 h-4" />
                My Passes
                {registeredCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                    {registeredCount}
                  </span>
                )}
              </button>

              {role === 'organizer' && (
                <>
                  <button
                    id="nav-tab-organizer"
                    type="button"
                    onClick={() => onSelectTab('organizer')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      currentTab === 'organizer'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                    Organizer Board
                  </button>

                  <button
                    id="nav-tab-analytics"
                    type="button"
                    onClick={() => onSelectTab('analytics')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      currentTab === 'analytics'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    Analytics
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* User Profile / Auth Button */}
            {isLoggedIn && user ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/70"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                      {user.role}
                    </p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div 
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700">
                        {user.department}
                      </span>
                    </div>

                    <div className="p-1">
                      {role === 'organizer' ? (
                        <button
                          id="dropdown-organizer-board-btn"
                          type="button"
                          onClick={() => {
                            onSelectTab('organizer');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Organizer Board
                        </button>
                      ) : (
                        <button
                          id="dropdown-my-passes-btn"
                          type="button"
                          onClick={() => {
                            onSelectTab('registrations');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          My Registrations
                        </button>
                      )}

                      <button
                        id="dropdown-logout-btn"
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          onSelectTab('feed');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 mt-1 border-t border-slate-100"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-nav-sign-in"
                  type="button"
                  onClick={() => onSelectTab('signin')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
                    currentTab === 'signin'
                      ? 'bg-purple-700 text-white shadow-sm ring-2 ring-purple-600/30'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          {/* Mobile College Brand Banner */}
          <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-white p-1 border border-purple-200/60 shadow-xs shrink-0 flex items-center justify-center">
              <img src="/dmi-logo.png" alt="DMI Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">DMI College of Engineering</div>
              <div className="text-[10px] text-purple-700 font-semibold">Campus Event Hub • Palanchur</div>
            </div>
          </div>

          {/* Mobile User Profile or Sign In */}
          {isLoggedIn && user ? (
            <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-purple-700 font-bold uppercase">
                    {user.role} • {user.department}
                  </p>
                </div>
              </div>
              <button
                id="mobile-btn-logout"
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  onSelectTab('feed');
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700 p-1.5"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <button
                id="mobile-btn-sign-in"
                type="button"
                onClick={() => {
                  onSelectTab('signin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs text-center"
              >
                Sign In to Campus Hub
              </button>
            </div>
          )}

          <div className="space-y-1">
            <button
              id="mobile-nav-feed"
              type="button"
              onClick={() => { onSelectTab('feed'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                currentTab === 'feed' ? 'bg-purple-50 text-purple-700' : 'text-slate-700'
              }`}
            >
              <Compass className="w-4 h-4" />
              Discover Events
            </button>
            <button
              id="mobile-nav-calendar"
              type="button"
              onClick={() => { onSelectTab('calendar'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                currentTab === 'calendar' ? 'bg-purple-50 text-purple-700' : 'text-slate-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar View
            </button>
            <button
              id="mobile-nav-registrations"
              type="button"
              onClick={() => { onSelectTab('registrations'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                currentTab === 'registrations' ? 'bg-purple-50 text-purple-700' : 'text-slate-700'
              }`}
            >
              <Ticket className="w-4 h-4" />
              My Registered Passes ({registeredCount})
            </button>

            {role === 'organizer' && (
              <>
                <button
                  id="mobile-nav-organizer"
                  type="button"
                  onClick={() => { onSelectTab('organizer'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'organizer' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Organizer & Admin Board
                </button>
                <button
                  id="mobile-nav-analytics"
                  type="button"
                  onClick={() => { onSelectTab('analytics'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics Overview
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
