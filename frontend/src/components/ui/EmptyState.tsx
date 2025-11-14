import { type ReactNode } from 'react';
import { 
  Inbox, 
  Search, 
  FileQuestion, 
  AlertCircle,
  Package,
  ListTodo,
  Award,
  Users,
  type LucideIcon
} from 'lucide-react';
import Button from './Button';

type IconType = 'inbox' | 'search' | 'question' | 'alert' | 'package' | 'task' | 'reward' | 'users';

interface EmptyStateProps {
  icon?: IconType | ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

const EmptyState = ({
  icon = 'inbox',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) => {
  const iconMap: Record<IconType, LucideIcon> = {
    inbox: Inbox,
    search: Search,
    question: FileQuestion,
    alert: AlertCircle,
    package: Package,
    task: ListTodo,
    reward: Award,
    users: Users,
  };

  const IconComponent = typeof icon === 'string' ? iconMap[icon as IconType] : null;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Icon */}
      <div className="mb-6 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-accent opacity-10 rounded-full blur-2xl scale-150" />
        
        {/* Icon container */}
        <div className="relative bg-gray-100 p-6 rounded-full">
          {IconComponent ? (
            <IconComponent className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
          ) : (
            icon
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-600 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          icon={action.icon}
          className="animate-bounce-soft"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Specialized Empty States
export const NoResultsFound = ({ onReset }: { onReset?: () => void }) => (
  <EmptyState
    icon="search"
    title="No results found"
    description="We couldn't find anything matching your search. Try different keywords or filters."
    action={onReset ? {
      label: 'Clear filters',
      onClick: onReset,
    } : undefined}
  />
);

export const NoTasksYet = ({ onCreate }: { onCreate: () => void }) => (
  <EmptyState
    icon="task"
    title="No tasks yet"
    description="Get started by creating your first task to help your children develop great habits."
    action={{
      label: 'Create First Task',
      onClick: onCreate,
      icon: <Plus className="w-4 h-4" />,
    }}
  />
);

export const NoRewardsYet = ({ onCreate }: { onCreate: () => void }) => (
  <EmptyState
    icon="reward"
    title="No rewards yet"
    description="Add rewards to motivate your children and make task completion more fun!"
    action={{
      label: 'Add First Reward',
      onClick: onCreate,
      icon: <Plus className="w-4 h-4" />,
    }}
  />
);

// For the missing import
import { Plus } from 'lucide-react';

export default EmptyState;
