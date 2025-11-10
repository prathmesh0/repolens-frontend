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
          'max-w-[95%] sm:max-w-[80%] break-words whitespace-pre-wrap px-3 sm:px-4 py-2 shadow-sm text-xs sm:text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tl-2xl rounded-tr-xl rounded-bl-2xl rounded-br-none sm:rounded-tl-3xl sm:rounded-tr-2xl sm:rounded-bl-3xl sm:rounded-br-none'
            : 'bg-card border border-border text-card-foreground rounded-tr-2xl rounded-tl-xl rounded-br-2xl rounded-bl-none sm:rounded-tr-3xl sm:rounded-tl-2xl sm:rounded-br-3xl sm:rounded-bl-none dark:bg-muted dark:border-transparent'
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
