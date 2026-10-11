'use client';

import { Star, GitFork, Eye, Package } from 'lucide-react';
import { IBasicRepoInfo } from '@/types/chat';

interface RepoBasicInfoCardProps {
  repoInfo: IBasicRepoInfo['data']['basicInfo'];
  showHeader?: boolean;
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
      title={label}
    >
      {icon}
      {value}
    </span>
  );
}

export default function RepoBasicInfoCard({
  repoInfo,
  showHeader = true,
}: RepoBasicInfoCardProps) {
  if (!repoInfo) return null;

  const languages = repoInfo.languages ?? [];

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
      {showHeader && (
        <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Package className="h-3.5 w-3.5 text-primary" />
          Basic Repository Information
        </h3>
      )}

      <div className="space-y-1.5">
        <p className="break-words text-lg font-semibold tracking-tight text-foreground">
          {repoInfo.name}
        </p>
        {repoInfo.description && (
          <p className="text-sm text-muted-foreground">
            {repoInfo.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Stat
          icon={<Star className="h-3.5 w-3.5 text-yellow-500" />}
          value={repoInfo.stars}
          label="Stars"
        />
        <Stat
          icon={<GitFork className="h-3.5 w-3.5 text-blue-500" />}
          value={repoInfo.forks}
          label="Forks"
        />
        <Stat
          icon={<Eye className="h-3.5 w-3.5 text-green-500" />}
          value={repoInfo.watchers}
          label="Watchers"
        />
      </div>

      <dl className="grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-xs text-muted-foreground">Languages</dt>
          <dd className="flex flex-wrap gap-1.5">
            {languages.length > 0 ? (
              languages.map((lang) => (
                <span
                  key={lang}
                  className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary"
                >
                  {lang}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">N/A</span>
            )}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs text-muted-foreground">Owner</dt>
          <dd className="break-words font-medium">{repoInfo.owner}</dd>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <dt className="text-xs text-muted-foreground">Last Synced</dt>
          <dd className="font-medium">
            {new Date(repoInfo.lastSynced).toLocaleString()}
          </dd>
        </div>
      </dl>
    </div>
  );
}
