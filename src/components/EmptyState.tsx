import React from 'react';
import { CalendarX2, Ticket, PlusCircle, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type: 'events' | 'registrations' | 'organizer-events' | 'attendees' | 'search';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) => {
  const getDefaults = () => {
    switch (type) {
      case 'events':
        return {
          icon: <CalendarX2 className="w-12 h-12 text-purple-600" />,
          title: title || 'No campus events published yet',
          desc: description || 'The campus hub database is currently empty. Switch to Organizer mode to publish the first symposium, workshop, or hackathon!',
          action: actionText || 'Create First Event',
          secondaryAction: secondaryActionText || 'Switch to Organizer Mode'
        };
      case 'registrations':
        return {
          icon: <Ticket className="w-12 h-12 text-purple-600" />,
          title: title || 'No registered events yet',
          desc: description || 'You have not registered for any events yet. Browse upcoming college workshops, hackathons, and symposiums to book your seat.',
          action: actionText || 'Explore Events',
          secondaryAction: secondaryActionText
        };
      case 'organizer-events':
        return {
          icon: <PlusCircle className="w-12 h-12 text-purple-600" />,
          title: title || 'No events created yet',
          desc: description || 'You have not hosted any campus events yet. Create your first event to start accepting student registrations and tracking attendance.',
          action: actionText || '+ Create New Event',
          secondaryAction: secondaryActionText
        };
      case 'attendees':
        return {
          icon: <Ticket className="w-12 h-12 text-purple-600" />,
          title: title || 'No attendees registered yet',
          desc: description || 'Once students register for this event, their names, ticket passes, and check-in statuses will appear here in real-time.',
          action: actionText,
          secondaryAction: secondaryActionText
        };
      case 'search':
        return {
          icon: <Sparkles className="w-12 h-12 text-purple-600" />,
          title: title || 'No events match your criteria',
          desc: description || 'Try clearing some filters or searching for different keywords to find relevant college activities.',
          action: actionText || 'Clear Filters',
          secondaryAction: secondaryActionText
        };
    }
  };

  const defaults = getDefaults();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs max-w-xl mx-auto my-8">
      <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-5 ring-8 ring-purple-50/50">
        {defaults.icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{defaults.title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-md">{defaults.desc}</p>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onAction && defaults.action && (
          <button
            id={`btn-empty-action-${type}`}
            type="button"
            onClick={onAction}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow active:scale-98"
          >
            {defaults.action}
          </button>
        )}
        {onSecondaryAction && defaults.secondaryAction && (
          <button
            id={`btn-empty-sec-action-${type}`}
            type="button"
            onClick={onSecondaryAction}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all"
          >
            {defaults.secondaryAction}
          </button>
        )}
      </div>
    </div>
  );
};
