'use client';

import { AlertTriangle, Clock, Layers, Sparkles } from 'lucide-react';
import { IAIAnalysisResponse } from '@/types/chat';

interface RepoAIAnalysisCardProps {
  aiAnalysis: IAIAnalysisResponse['data']['aiAnalysis'];
  status?: string;
  showHeader?: boolean;
}

export default function RepoAIAnalysisCard({
  aiAnalysis,
  status = 'ready',
  showHeader = true,
}: RepoAIAnalysisCardProps) {
  if (!aiAnalysis) return null;

  // If analysis not ready
  if (status !== 'ready') {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <Clock className="h-4 w-4 shrink-0" />
        AI analysis is still running. Please wait.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
      {showHeader && (
        <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Analysis Summary
        </h3>
      )}

      <p className="text-sm leading-relaxed text-foreground">
        {aiAnalysis.summary}
      </p>

      <dl className="grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            Complexity
          </dt>
          <dd className="font-medium">{aiAnalysis.complexity}</dd>
        </div>
        <div className="space-y-1">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            Architecture
          </dt>
          <dd className="font-medium">{aiAnalysis.architecture}</dd>
        </div>
      </dl>

      {aiAnalysis.potentialIssues?.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
            Potential Issues
          </p>
          <ul className="space-y-1.5 text-sm">
            {aiAnalysis.potentialIssues.map((issue: string, i: number) => (
              <li
                key={i}
                className="flex gap-2 rounded-lg bg-muted/60 px-3 py-2 text-foreground"
              >
                <span
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-yellow-500"
                  aria-hidden
                />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
