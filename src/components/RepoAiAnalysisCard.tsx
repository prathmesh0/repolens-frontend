'use client';

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

  // ⏳ If analysis not ready
  if (status !== 'ready') {
    return (
      <div className="p-3 sm:p-4  text-xs sm:text-sm text-muted-foreground">
        ⏳ AI analysis is still running. Please wait.
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 space-y-3">
      {showHeader && (
        <h3 className="text-base sm:text-lg font-semibold text-primary">
          🤖 AI Analysis Summary
        </h3>
      )}

      <div className="space-y-1">
        <p className="text-xs sm:text-sm leading-relaxed ">
          {aiAnalysis.summary}
        </p>
      </div>

      <div className="pt-2 text-xs sm:text-sm text-muted-foreground space-y-1">
        <p>
          <span className="font-medium text-foreground">🧠 Complexity:</span>{' '}
          {aiAnalysis.complexity}
        </p>
        <p>
          <span className="font-medium text-foreground">🏗 Architecture:</span>{' '}
          {aiAnalysis.architecture}
        </p>

        {aiAnalysis.potentialIssues?.length > 0 && (
          <div className="pt-2">
            <p className="font-medium text-foreground mb-1">
              ⚠ Potential Issues:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm space-y-1">
              {aiAnalysis.potentialIssues.map((issue: string, i: number) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
