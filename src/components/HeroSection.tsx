import React from 'react';
import { Search, Code2, Cpu, Users, MonitorPlay, Trophy, Palette } from 'lucide-react';
import { EventItem, EventCategory } from '../types';

interface HeroSectionProps {
  events: EventItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  events,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onExploreClick
}) => {
  // Count live events in categories dynamically (starts at 0 when empty!)
  const getCategoryCount = (cat: EventCategory) => {
    return events.filter(e => e.category === cat && e.status !== 'cancelled').length;
  };

  const categories = [
    {
      name: 'Hackathons' as EventCategory,
      count: getCategoryCount('Hackathon'),
      icon: Code2,
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
    },
    {
      name: 'Workshops' as EventCategory,
      count: getCategoryCount('Workshop'),
      icon: Cpu,
      color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200'
    },
    {
      name: 'Symposiums' as EventCategory,
      count: getCategoryCount('Symposium'),
      icon: Users,
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
    },
    {
      name: 'Webinars' as EventCategory,
      count: getCategoryCount('Webinar'),
      icon: MonitorPlay,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
    }
  ];

  return (
    <section className="bg-gradient-to-b from-purple-50/50 via-white to-slate-50 pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60">
      <div className="max-w-5xl mx-auto text-center">
        
        {/* Subtitle / College tag */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-purple-200/90 shadow-xs mb-4 text-xs font-semibold text-slate-800">
          <img 
            src="/dmi-logo.png" 
            alt="DMI College of Engineering Logo" 
            className="w-5 h-5 object-contain" 
          />
          <span className="font-bold text-slate-900">DMI College of Engineering</span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-purple-700 items-center gap-1.5 hidden sm:inline-flex">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Official Event Hub
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
          Find your next <span className="text-purple-600">opportunity</span>
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-8 font-normal">
          Discover hackathons, technical symposiums, workshops, and webinars across departments with live seat tracking and instant digital passes.
        </p>

        {/* Search Bar Input */}
        <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-md border border-slate-200 flex items-center gap-2 mb-8">
          <div className="pl-3 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="hero-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by event title, skill, or venue..."
            className="w-full py-2 px-1 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            id="hero-search-explore-btn"
            type="button"
            onClick={onExploreClick}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs shrink-0"
          >
            Explore
          </button>
        </div>

        {/* Live Category Counts Grid (matching Figma wireframe) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                id={`hero-category-${cat.name.toLowerCase()}`}
                type="button"
                onClick={() => onSelectCategory(isSelected ? 'all' : cat.name)}
                className={`p-3.5 rounded-2xl border text-left transition-all group relative ${
                  isSelected
                    ? 'border-purple-600 bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/30'
                    : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/40 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-purple-100' : 'text-slate-500'}`}>
                    {cat.name}
                  </span>
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:text-purple-600 group-hover:bg-purple-100'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black">
                  {cat.count}{' '}
                  <span className={`text-xs font-normal ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                    {cat.count === 1 ? 'event' : 'events'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
