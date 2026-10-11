'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp } from 'lucide-react';
import { IChatRequest } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: IChatRequest) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ask your question...',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend({ question: trimmed });
    setInput('');
  };

  const isValid = input.trim().length > 0 && !disabled;

  // Auto-resize the textarea like ChatGPT
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  return (
    <div
      className={cn(
        'flex w-full items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg',
        'transition-shadow duration-200 focus-within:ring-4 focus-within:ring-primary/15',
        disabled && 'opacity-80'
      )}
    >
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={input}
        disabled={disabled}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) =>
          e.key === 'Enter' &&
          !e.shiftKey &&
          isValid &&
          (e.preventDefault(), handleSend())
        }
        className="custom-scrollbar max-h-[180px] min-h-[40px] flex-1 resize-none overflow-y-auto border-0 bg-transparent px-2 py-2 text-base shadow-none focus-visible:ring-0 md:text-sm dark:bg-transparent"
        rows={1}
      />

      <Button
        type="button"
        size="icon"
        onClick={handleSend}
        disabled={!isValid}
        aria-label="Send message"
        className="h-10 w-10 shrink-0 rounded-xl"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
