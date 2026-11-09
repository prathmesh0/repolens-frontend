'use client';

import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import { useAppContext } from '@/providers/AppContextProvider';
import { IDemoInfo } from '@/types/auth';

// Slim bar shown to demo guests on every private page
export default function DemoBanner({ demo }: { demo?: IDemoInfo }) {
  const { handleLogout } = useAppContext();

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-foreground sm:text-[13px]">
      <span className="inline-flex items-center gap-1.5 font-medium">
        <FlaskConical className="h-3.5 w-3.5 text-primary" />
        You&rsquo;re in demo mode
      </span>
      {demo && (
        <span className="text-muted-foreground">
          {Math.min(demo.analysesUsed, demo.analysesMax)} of {demo.analysesMax}{' '}
          analyses used
        </span>
      )}
      <span className="hidden text-muted-foreground md:inline">
        Your data is deleted when you leave.
      </span>
      <Link
        href="/register"
        className="font-semibold text-primary underline-offset-4 hover:underline"
      >
        Sign up free
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        End demo
      </button>
    </div>
  );
}
