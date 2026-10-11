'use client';

import { Check, Circle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IRepoStatus } from '@/types/repo';

type StageState = 'pending' | 'processing' | 'ready' | 'failed';

interface RepoProgressProps {
  status: IRepoStatus | null;
}

const STAGES = [
  {
    key: 'fileStructureStatus',
    errorKey: 'fileStructure',
    label: 'File structure',
  },
  { key: 'aiStatus', errorKey: 'ai', label: 'AI analysis' },
  { key: 'embeddingStatus', errorKey: 'embedding', label: 'Embeddings' },
] as const;

function StageIcon({ state }: { state: StageState }) {
  if (state === 'ready') return <Check className="h-4 w-4 text-green-500" />;
  if (state === 'failed') return <X className="h-4 w-4 text-destructive" />;
  if (state === 'processing')
    return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
}

export default function RepoProgress({ status }: RepoProgressProps) {
  if (!status) return null;

  const { statuses, progress, statusErrors, job } = status;
  const stageStates = STAGES.map((s) => statuses[s.key] as StageState);
  const anyFailed = stageStates.includes('failed');
  const allReady = stageStates.every((s) => s === 'ready');

  // Nothing to show once a run has finished cleanly
  if (allReady && !job) return null;

  const percent = Math.max(0, Math.min(100, progress?.percent ?? 0));

  return (
    <div className="w-full space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          {anyFailed ? 'Analysis failed' : 'Analysing repository'}
        </span>
        {!anyFailed && (
          <span className="text-muted-foreground">{Math.round(percent)}%</span>
        )}
      </div>

      {!anyFailed && (
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-500 ease-product"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {job?.status === 'queued' && (
        <p className="text-xs text-muted-foreground">
          {job.position
            ? `Waiting in queue - position ${job.position}`
            : 'Waiting in queue'}
        </p>
      )}

      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {STAGES.map((stage, i) => {
          const state = stageStates[i];
          const error = statusErrors?.[stage.errorKey];
          return (
            <li key={stage.key} className="space-y-1">
              <div
                className={cn(
                  'flex items-center gap-2 text-sm',
                  state === 'pending' && 'text-muted-foreground',
                  state === 'failed' && 'text-destructive'
                )}
              >
                <StageIcon state={state} />
                {stage.label}
              </div>
              {state === 'failed' && error && (
                <p className="pl-6 text-xs text-destructive">{error}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
