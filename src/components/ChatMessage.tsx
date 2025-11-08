'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ChatMessageProps {
  message: string | ReactNode;
  sender: 'user' | 'assistant';
}

export default function ChatMessage({ message, sender }: ChatMessageProps) {
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex w-full px-2 sm:px-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[95%] sm:max-w-[80%] break-words  whitespace-pre-wrap rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 shadow-sm text-xs sm:text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        )}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
        }}
      >
        {typeof message === 'string' ? <p>{message}</p> : message}
      </div>
    </motion.div>
  );
}
