'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal } from 'lucide-react';
import { IChatRequest } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: IChatRequest) => Promise<void>;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend({ question: trimmed });
    setInput('');
  };

  const isValid = input.trim().length > 0;

  // Auto-resize the textarea like ChatGPT
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  return (
    <div className="bg-background p-3 w-full flex justify-center items-center">
      <div className="relative w-full">
        {/* Scrollable Wrapper */}
        <div
          className={cn(
            'relative border border-input rounded-xl bg-background flex items-end',
            'focus-within:ring-1 focus-within:ring-ring'
          )}
        >
          {/* Textarea */}
          <Textarea
            placeholder="Ask your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              !e.shiftKey &&
              isValid &&
              (e.preventDefault(), handleSend())
            }
            className={cn(
              'pr-14 resize-none min-h-[44px] max-h-[180px] overflow-y-auto rounded-xl custom-scrollbar',
              'border border-input bg-background focus-visible:ring-1 focus-visible:ring-ring text-sm'
            )}
            rows={1}
          />

          {/* Send Button */}
          <div className="absolute bottom-2 right-2">
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={!isValid}
              className={cn(
                'h-8 w-8 rounded-full transition-opacity shadow-sm',
                !isValid && 'opacity-50 cursor-not-allowed'
              )}
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
