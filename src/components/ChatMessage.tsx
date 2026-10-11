'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ChatMessageProps {
  message: string | ReactNode;
  sender: 'user' | 'assistant';
}

export default function ChatMessage({ message, sender }: ChatMessageProps) {
  const isUser = sender === 'user';

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div
          className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm leading-relaxed text-foreground sm:max-w-[75%]"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          {message}
        </div>
      </div>
    );
  }

  // Assistant: flat on the page with a small logo mark
  return (
    <div className="flex w-full items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card ring-1 ring-border">
        <Image src="/favicon.ico" alt="" width={16} height={16} />
      </div>
      <div
        className={cn(
          'min-w-0 flex-1 text-sm leading-relaxed text-foreground',
          typeof message === 'string' && 'py-0.5'
        )}
        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
      >
        {typeof message === 'string' ? <p>{message}</p> : message}
      </div>
    </div>
  );
}
