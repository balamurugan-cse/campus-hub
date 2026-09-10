import React from 'react';
import { 
  LayoutGrid, 
  List, 
  Calendar as CalendarIcon, 
  Filter, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { EventFilterState, ViewMode } from '../types';

interface EventFiltersProps {
  filters: EventFilterState;
  onFilterChange: (newFilters: Partial<EventFilterState>) => void;
  onResetFilters: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalEventsCount: number;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  totalEventsCount
}) => {
  const departments = [
    'All Departments',
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'MBA / Management'
  ];

  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Hackathons', value: 'Hackathon' },
    { label: 'Workshops', value: 'Workshop' },
    { label: 'Symposiums', value: 'Symposium' },
    { label: 'Webinars', value: 'Webinar' },
    { label: 'Sports Meets', value: 'Sports' },
    { label: 'Cultural Fests', value: 'Cultural' }
  ];

  const formats = [
    { label: 'All Formats', value: 'all' },
    { label: 'In-Person (Offline)', value: 'Offline' },
    { label: 'Virtual (Online)', value: 'Online' },
    { label: 'Hybrid', value: 'Hybrid' }
  ];

  const dateOptions = [
    { label: 'All Dates', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Upcoming', value: 'upcoming' }
  ];

  const hasActiveFilters = 
    filters.category !== 'all' || 
    filters.department !== 'all' || 
    filters.format !== 'all' || 
    filters.dateFilter !== 'all' || 
    filters.searchQuery !== '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs mb-6 space-y-4">
      {/* Top row: Category tabs + View mode switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 pb-3.5">
        
        {/* Category Pills (matching Figma design) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.value}
              id={`filter-cat-${cat.value.toLowerCase()}`}
              type="button"
              onClick={() => onFilterChange({ category: cat.value })}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filters.category === cat.value
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Grid, List, Calendar */}
        <div className="flex items-center self-end lg:self-auto gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              id="view-mode-grid-btn"
              type="button"
              title="Grid View"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-purple-700 shadow-xs ring-1 ring-slate-200 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-list-btn"
              type="button"
              title="List View"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-purple-700 shadow-xs ring-1 ring-slate-200 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              id="view-mode-calendar-btn"
              type="button"
              title="Calendar View"
              onClick={() => onViewModeChange('calendar')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-purple-700 shadow-xs ring-1 ring-slate-200 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Second row: Department, Format, Date filter dropdowns + active filter count */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter By:</span>
          </div>

          {/* Department Select */}
          <select
            id="filter-department-select"
            value={filters.department}
            onChange={(e) => onFilterChange({ department: e.target.value })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20"
          >
            {departments.map(d => (
              <option key={d} value={d === 'All Departments' ? 'all' : d}>
                {d}
              </option>
            ))}
          </select>

          {/* Format Select */}
          <select
            id="filter-format-select"
            value={filters.format}
            onChange={(e) => onFilterChange({ format: e.target.value })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20"
          >
            {formats.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            id="filter-date-select"
            value={filters.dateFilter}
            onChange={(e) => onFilterChange({ dateFilter: e.target.value as any })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20"
          >
            {dateOptions.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Results count & reset */}
        <div className="flex items-center gap-2.5">
          <span className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{totalEventsCount}</strong> events
          </span>

          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-semibold px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
