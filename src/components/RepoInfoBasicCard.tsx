'use client';

import { Star, GitFork, Eye } from 'lucide-react';
import { IBasicRepoInfo } from '@/types/chat';

interface RepoBasicInfoCardProps {
  repoInfo: IBasicRepoInfo['data']['basicInfo'];
  showHeader?: boolean;
}

export default function RepoBasicInfoCard({
  repoInfo,
  showHeader = true,
}: RepoBasicInfoCardProps) {
  if (!repoInfo) return null;

  return (
    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-border bg-muted/30 shadow-sm space-y-2 sm:space-y-3">
      {showHeader && (
        <h3 className="text-base sm:text-lg font-semibold text-primary">
          📦 Basic Repository Information
        </h3>
      )}

      <div className="space-y-2">
        <p className="font-semibold text-base sm:text-lg text-primary">
          {repoInfo.name}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {repoInfo.description}
        </p>

        <div className="flex items-center gap-2 sm:gap-4 mt-2 text-muted-foreground text-xs sm:text-sm">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />{' '}
            {repoInfo.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />{' '}
            {repoInfo.forks}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />{' '}
            {repoInfo.watchers}
          </span>
        </div>

        <p className="text-xs">
          <span className="font-medium">Languages:</span>{' '}
          {repoInfo.languages?.join(', ') || 'N/A'}
        </p>
        <p className="text-xs">
          <span className="font-medium">Owner:</span> {repoInfo.owner}
        </p>
        <p className="text-xs">
          <span className="font-medium">Last Synced:</span>{' '}
          {new Date(repoInfo.lastSynced).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
