'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Play, X } from 'lucide-react';
import { DEMO_VIDEO } from '@/lib/demoVideo';
import { cn } from '@/lib/utils';

// The video is only loaded after the visitor opens the dialog, so the landing
// page stays fast and no third-party iframe loads up front.
export default function DemoVideo({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  if (!DEMO_VIDEO) return null;

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-transparent px-5 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
      >
        <Play className="h-4 w-4" />
        Watch demo video
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Repolens demo video"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <p className="text-sm font-medium">Repolens demo</p>
                <div className="flex items-center gap-1">
                  <a
                    href={DEMO_VIDEO.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Open in new tab <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    aria-label="Close video"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="aspect-video w-full bg-black">
                {DEMO_VIDEO.kind === 'iframe' ? (
                  <iframe
                    src={DEMO_VIDEO.embedUrl}
                    title="Repolens demo video"
                    className="h-full w-full"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={DEMO_VIDEO.src}
                    className="h-full w-full"
                    controls
                    autoPlay
                    playsInline
                  />
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
