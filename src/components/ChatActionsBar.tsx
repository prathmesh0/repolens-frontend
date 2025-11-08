'use client';
import CustomButton from './CustomButton';

interface ChatActionsBarProps {
  onSelect: (action: string) => void;
}

export default function ChatActionsBar({ onSelect }: ChatActionsBarProps) {
  const actions = ['Basic Analysis', 'Get File Structure', 'AI Analysis'];

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 px-2 sm:px-4 overflow-x-auto">
      {actions.map((action) => (
        <CustomButton
          key={action}
          variant="outline"
          size="sm"
          className="rounded-full text-accent-foreground whitespace-nowrap border-secondary bg-transparent"
          onClick={() => onSelect(action)}
        >
          {action}
        </CustomButton>
      ))}
    </div>
  );
}
