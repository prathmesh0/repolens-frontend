'use client';
import { FolderTree, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatActionsBarProps {
  onSelect: (action: string) => void;
}

const ACTIONS = [
  { label: 'Basic Analysis', icon: Info },
  { label: 'Get File Structure', icon: FolderTree },
  { label: 'AI Analysis', icon: Sparkles },
];

export default function ChatActionsBar({ onSelect }: ChatActionsBarProps) {
  return (
    <div className="hide-scrollbar -mx-3 mb-2 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
      {ACTIONS.map(({ label, icon: Icon }) => (
        <Button
          key={label}
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 rounded-full bg-card/80 text-muted-foreground backdrop-blur hover:text-foreground"
          onClick={() => onSelect(label)}
        >
          <Icon className="h-3.5 w-3.5 text-primary" />
          {label}
        </Button>
      ))}
    </div>
  );
}
