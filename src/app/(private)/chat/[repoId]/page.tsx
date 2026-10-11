'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChatService, Repository } from '@/api/services';
import ChatMessage from '@/components/ChatMessage';
import ChatActionsBar from '@/components/ChatActionsBar';
import ChatInput from '@/components/ChatInput';
import { IChatRequest, IFullRepoInfo } from '@/types/chat';
import { ChatItem } from '@/types/chatItem';
import RepoBasicInfoCard from '@/components/RepoInfoBasicCard';
import { ChatPageSkeleton } from '@/components/ChatPageSkelaton';
import { motion, AnimatePresence } from 'framer-motion';
import { AIResponseFormatter } from '@/components/AIResponseFormatter';
import { LoadingMessage } from '@/components/LoadingMessage';
import { Toast } from '@/lib/Toast';
import { Button } from '@/components/ui/button';
import RepoProgress from '@/components/RepoProgress';
import ChatSources from '@/components/ChatSources';
import { ApiError } from '@/lib/apiMethods';
import { useRepoStatus } from '@/lib/useRepoStatus';
import { EASE } from '@/lib/motion';
import { historyToItems, newChatItemId, renderChatItem } from '@/lib/chatItems';

const HISTORY_PAGE_SIZE = 30;

type RepoInfoEnvelope = {
  success?: boolean;
  message?: string;
  data?: IFullRepoInfo;
};

export default function ChatPage() {
  const { repoId } = useParams<{ repoId: string }>();
  // Conversation as plain data; components are picked in renderChatItem
  const [items, setItems] = useState<ChatItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const [olderItems, setOlderItems] = useState<ChatItem[]>([]);
  const [oldestId, setOldestId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const streamAbortRef = useRef<AbortController | null>(null);
  const [streaming, setStreaming] = useState<{
    text: string;
    sources: string[];
  } | null>(null);
  const { status: repoStatus } = useRepoStatus(repoId);
  // Chat only works once embeddings are ready
  const chatReady = repoStatus?.statuses.embeddingStatus === 'ready';

  const {
    data: chatHistory,
    isLoading: isHistoryLoading,
    isSuccess: isHistorySuccess,
    isError: isHistoryError,
  } = useQuery({
    queryKey: ['chatHistory', repoId],
    queryFn: async () => {
      const res = await ChatService.chatHistory(repoId, {
        limit: HISTORY_PAGE_SIZE,
      });
      return res?.data;
    },
    enabled: !!repoId, // fetch only when repoId exists
    // A refetch would reset the older pages the user already loaded
    refetchOnWindowFocus: false,
    // Always load fresh on entering the page, so a recent exchange is not
    // missing from a cached copy
    staleTime: 0,
    gcTime: 0,
  });
  const historyMessages = useMemo(
    () => chatHistory?.messages ?? [],
    [chatHistory]
  );

  // Repo data for the analysis cards, straight from getRepoInfo. The H1
  // status stream invalidates this when a run finishes.
  const { data: repoInfoResponse } = useQuery({
    queryKey: ['repoInfo', repoId],
    queryFn: async () =>
      (await Repository.getRepoInfo(repoId)) as RepoInfoEnvelope | undefined,
    enabled: !!repoId,
  });
  const overview = repoInfoResponse?.data;

  // Load the latest history page on mount
  useEffect(() => {
    if (!isHistorySuccess) return;
    setOlderItems([]);
    setItems(historyToItems(historyMessages));
    // Cursor and hasMore follow the raw page, not the filtered items
    setOldestId(historyMessages[0]?._id ?? null);
    setHasMore(!!chatHistory?.hasMore);
  }, [isHistorySuccess, chatHistory, historyMessages]);

  const handleLoadEarlier = async () => {
    if (!oldestId || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const res = await ChatService.chatHistory(repoId, {
        limit: HISTORY_PAGE_SIZE,
        before: oldestId,
      });
      if (!res?.success) {
        Toast.error(res?.message || 'Could not load earlier messages');
        return;
      }
      const page = res.data.messages;
      if (page.length > 0) {
        // Remember the height so the view stays on the same message
        prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? null;
        setOlderItems((prev) => [...historyToItems(page), ...prev]);
        setOldestId(page[0]._id);
      }
      setHasMore(res.data.hasMore && page.length > 0);
    } finally {
      setLoadingOlder(false);
    }
  };

  // After older messages are prepended, keep the viewport where it was
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const prev = prevScrollHeightRef.current;
    if (!el || prev === null) return;
    el.scrollTo({
      top: el.scrollTop + (el.scrollHeight - prev),
      behavior: 'instant',
    });
    prevScrollHeightRef.current = null;
  }, [olderItems]);

  // Stop generating if the user leaves the page or switches repo
  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;
    };
  }, [repoId]);

  // Scroll to bottom when messages update; no smooth animation while tokens
  // arrive. 'instant' (not 'auto') because the container has CSS
  // scroll-behavior: smooth, which 'auto' would inherit
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: streaming ? 'instant' : 'smooth',
      });
    }
  }, [items, streaming]);

  if (isHistoryLoading) {
    return <ChatPageSkeleton />;
  }

  if (isHistoryError) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        ⚠️ Failed to load data. Please try again later.
      </div>
    );
  }

  if (repoInfoResponse && repoInfoResponse.success === false) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {repoInfoResponse.message || 'Repository not found.'}
      </div>
    );
  }

  const append = (...added: ChatItem[]) =>
    setItems((prev) => [...prev, ...added]);

  const assistantText = (content: string): ChatItem => ({
    id: newChatItemId(),
    role: 'assistant',
    type: 'text',
    content,
  });

  const handleSend = async (msg: IChatRequest) => {
    if (streamAbortRef.current) return; // one answer at a time
    append({
      id: newChatItemId(),
      role: 'user',
      type: 'text',
      content: msg.question,
    });

    const ctrl = new AbortController();
    streamAbortRef.current = ctrl;
    setStreaming({ text: '', sources: [] });

    let text = '';
    let sources: string[] = [];

    try {
      await ChatService.streamChat(repoId, msg, {
        signal: ctrl.signal,
        onSources: (s) => {
          sources = s;
          setStreaming((prev) => prev && { ...prev, sources: s });
        },
        onToken: (t) => {
          text += t;
          setStreaming((prev) => prev && { ...prev, text });
        },
      });

      append({
        id: newChatItemId(),
        role: 'assistant',
        type: 'answer',
        content: text,
        sources,
      });
    } catch (error) {
      // Page left or request cancelled: nothing to show, nothing saved
      if (ctrl.signal.aborted) return;
      console.error('ERROR: streamChat', error);
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Something went wrong while contacting AI service.';
      append(assistantText(message));
    } finally {
      if (streamAbortRef.current === ctrl) streamAbortRef.current = null;
      if (!ctrl.signal.aborted) setStreaming(null);
    }
  };

  // The quick actions show data we already have from getRepoInfo; no request
  const handleAction = (action: string) => {
    const userItem: ChatItem = {
      id: newChatItemId(),
      role: 'user',
      type: 'text',
      content: action,
    };

    if (!overview) {
      append(userItem, assistantText('Repository data is still loading.'));
      return;
    }

    if (action === 'Basic Analysis') {
      append(userItem, {
        id: newChatItemId(),
        role: 'assistant',
        type: 'basicInfo',
        payload: overview.basicInfo,
      });
    } else if (action === 'Get File Structure') {
      if (overview.fileStructure) {
        append(userItem, {
          id: newChatItemId(),
          role: 'assistant',
          type: 'fileStructure',
          payload: overview.fileStructure,
        });
      } else {
        Toast.info('File structure is still being processed.');
        append(
          userItem,
          assistantText(
            '⏳ File structure extraction has not finished yet. Check the progress above.'
          )
        );
      }
    } else if (action === 'AI Analysis') {
      if (overview.aiAnalysis) {
        append(userItem, {
          id: newChatItemId(),
          role: 'assistant',
          type: 'aiAnalysis',
          payload: overview.aiAnalysis,
        });
      } else {
        Toast.info('AI analysis is still being processed.');
        append(
          userItem,
          assistantText(
            '⏳ AI analysis has not finished yet. Check the progress above.'
          )
        );
      }
    }
  };

  return (
    <main className="flex h-full flex-col bg-background text-foreground">
      {/* Conversation */}
      <div
        ref={scrollRef}
        className="custom-scrollbar flex-1 scroll-smooth overflow-y-auto overflow-x-hidden"
      >
        <div className="mx-auto w-full max-w-3xl space-y-5 px-3 py-6 sm:space-y-6 sm:px-4">
          <RepoProgress status={repoStatus} />

          {overview?.basicInfo && (
            <ChatMessage
              sender="assistant"
              message={
                <RepoBasicInfoCard
                  repoInfo={overview.basicInfo}
                  showHeader={false}
                />
              }
            />
          )}

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                disabled={loadingOlder}
                onClick={handleLoadEarlier}
                className="rounded-full bg-card/80 text-muted-foreground hover:text-foreground"
              >
                {loadingOlder ? 'Loading...' : 'Load earlier messages'}
              </Button>
            </div>
          )}

          {olderItems.map((item) => (
            <ChatMessage
              key={item.id}
              sender={item.role}
              message={renderChatItem(item)}
            />
          ))}

          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <ChatMessage
                  sender={item.role}
                  message={renderChatItem(item)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {streaming && (
            <div className="animate-fade-up">
              <ChatMessage
                sender="assistant"
                message={
                  streaming.text ? (
                    <div className="space-y-2">
                      <AIResponseFormatter answer={streaming.text} />
                      <span
                        className="ml-2 inline-block h-4 w-0.5 translate-y-0.5 animate-caret bg-primary"
                        aria-hidden
                      />
                      <ChatSources sources={streaming.sources} />
                    </div>
                  ) : (
                    <LoadingMessage text="AI is generating response" />
                  )
                }
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick actions + input */}
      <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4">
          <ChatActionsBar onSelect={handleAction} />
          <ChatInput
            onSend={handleSend}
            disabled={!chatReady || !!streaming}
            placeholder={
              !chatReady
                ? 'Chat is available once the repository has finished indexing...'
                : streaming
                  ? 'AI is answering...'
                  : 'Ask your question...'
            }
          />
        </div>
      </div>
    </main>
  );
}
