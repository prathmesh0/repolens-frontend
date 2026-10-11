import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { enhancedFetch } from '@/api/interceptor';
import { Repository } from '@/api/services';
import { ENPOINTS } from '@/lib/Config';
import { readSSE } from '@/lib/sse';
import { IRepoStatus } from '@/types/repo';

const POLL_INTERVAL_MS = 3000;

// Finished = no job queued/running and no stage still processing.
export function isRepoFinished(s: IRepoStatus | null | undefined): boolean {
  if (!s) return false;
  const { fileStructureStatus, aiStatus, embeddingStatus } = s.statuses;
  return (
    s.job === null &&
    ![fileStructureStatus, aiStatus, embeddingStatus].includes('processing')
  );
}

// Live analysis progress for a repo. Uses the status-stream SSE endpoint and
// falls back to polling getRepoInfo?info=basicAnalysis if the stream fails.
export function useRepoStatus(repoId: string | undefined) {
  const queryClient = useQueryClient();
  const [streamed, setStreamed] = useState<IRepoStatus | null>(null);
  const [streamDone, setStreamDone] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!repoId) return;
    const ctrl = new AbortController();

    setStreamed(null);
    setStreamDone(false);
    setUseFallback(false);

    const run = async () => {
      try {
        // A "done" with reconnect:true (server cap of 15 min) means reopen.
        while (!ctrl.signal.aborted) {
          const res = await enhancedFetch(
            ENPOINTS.REPOSITORY.STATUS_STREAM(repoId),
            {
              method: 'GET',
              headers: { Accept: 'text/event-stream' },
              signal: ctrl.signal,
            }
          );
          if (!res.ok) throw new Error(`status-stream ${res.status}`);

          let reconnect = false;
          let ended = false;
          for await (const { event, data } of readSSE(res, ctrl.signal)) {
            if (event === 'status') {
              setStreamed(data as IRepoStatus);
            } else if (event === 'done') {
              if ((data as { reconnect?: boolean })?.reconnect) {
                reconnect = true;
              } else {
                ended = true;
              }
              break;
            } else if (event === 'error') {
              throw new Error((data as { message?: string })?.message);
            }
          }

          if (reconnect) continue;
          if (!ended) throw new Error('status-stream closed unexpectedly');

          setStreamDone(true);
          // Final data (file structure, AI analysis) is available now.
          queryClient.invalidateQueries({ queryKey: ['repoInfo', repoId] });
          return;
        }
      } catch {
        if (!ctrl.signal.aborted) setUseFallback(true);
      }
    };
    run();

    return () => ctrl.abort();
  }, [repoId, queryClient]);

  const { data: polled } = useQuery({
    queryKey: ['repoStatus', repoId],
    enabled: !!repoId && useFallback,
    queryFn: async () => {
      const res = await Repository.getRepoInfo(repoId!, 'basicAnalysis');
      const d = (res as { data?: Partial<IRepoStatus> } | undefined)?.data;
      return d?.statuses ? (d as IRepoStatus) : null;
    },
    staleTime: 0,
    refetchInterval: (query) =>
      isRepoFinished(query.state.data) ? false : POLL_INTERVAL_MS,
  });

  const status = (useFallback ? polled : streamed) ?? null;
  const finished = streamDone || isRepoFinished(status);

  return { status, finished, isPolling: useFallback };
}
