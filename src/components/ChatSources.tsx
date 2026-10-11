'use client';

import { FileText } from 'lucide-react';

interface ChatSourcesProps {
  sources?: string[];
}

export default function ChatSources({ sources }: ChatSourcesProps) {
  const unique = Array.from(new Set(sources ?? []));
  if (unique.length === 0) return null;

  return (
    <div className="mt-2 space-y-1 border-t border-border pt-2">
      <p className="text-xs font-medium text-muted-foreground">Sources</p>
      <ul className="flex flex-wrap gap-1.5">
        {unique.map((path) => (
          <li
            key={path}
            title={path}
            className="flex max-w-full items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            <FileText className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{path}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
