'use client';

import { JSX, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChatService, Repository } from '@/api/services';
import ChatMessage from '@/components/ChatMessage';
import ChatActionsBar from '@/components/ChatActionsBar';
import ChatInput from '@/components/ChatInput';
import FileTree from '@/components/FileTree';
import {
  IAIAnalysisResponse,
  IBasicRepoInfo,
  IChatRequest,
  IFileStructureRepoInfo,
  IFullRepoInfo,
  IRepoChatMessage,
} from '@/types/chat';
import { parseJSONSafe } from '@/lib/utils';
import RepoBasicInfoCard from '@/components/RepoInfoBasicCard';
import RepoAIAnalysisCard from '@/components/RepoAiAnalysisCard';
import { ChatPageSkeleton } from '@/components/ChatPageSkelaton';
import { motion, AnimatePresence } from 'framer-motion';
import { AIResponseFormatter } from '@/components/AIResponseFormatter';
import { LoadingMessage } from '@/components/LoadingMessage';
import { Toast } from '@/lib/Toast';
import RepoProgress from '@/components/RepoProgress';
import ChatSources from '@/components/ChatSources';
import { ApiError } from '@/lib/apiMethods';
import { useRepoStatus } from '@/lib/useRepoStatus';

type ChatMessageType = {
  sender: 'user' | 'assistant';
  message: string | JSX.Element;
  isLoading?: boolean;
};

function isBasicRepoInfo(data: unknown): data is IBasicRepoInfo {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as {
    data?: { basicInfo?: IBasicRepoInfo['data']['basicInfo'] };
  };
  return !!obj.data?.basicInfo;
}

function isFileStructureRepoInfo(
  data: unknown
): data is IFileStructureRepoInfo {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as {
    data?: { fileStructure?: IFileStructureRepoInfo['data']['fileStructure'] };
  };
  return !!obj.data?.fileStructure;
}

function isAIAnalysisResponse(data: unknown): data is IAIAnalysisResponse {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as {
    data?: { aiAnalysis?: IAIAnalysisResponse['data']['aiAnalysis'] };
  };
  return !!obj.data?.aiAnalysis;
}

function isFullRepoInfo(data: unknown): data is { data: IFullRepoInfo } {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as { data?: IFullRepoInfo };
  const d = obj.data;
  return !!(d?.basicInfo && d?.fileStructure && d?.aiAnalysis);
}

export default function ChatPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
      const res = await ChatService.chatHistory(repoId); // implement this in your service
      return res?.data?.messages;
    },
    enabled: !!repoId, // fetch only when repoId exists
  });

  // ✅ Fetch repo info via React Query
  const {
    data: repoInfoResponse,
    isLoading: isRepoLoading,
    refetch: refetchRepoInfo,
    isSuccess: isRepoSuccess,
  } = useQuery({
    queryKey: ['repoInfo', repoId],
    queryFn: async () => {
      const res = await Repository.getRepoInfo(repoId);
      return res;
    },
    enabled: false,
  });

  // ✅ Load chat history on mount
  useEffect(() => {
    if (isHistorySuccess) {
      if (chatHistory && chatHistory.length > 0) {
        const formattedMessages: ChatMessageType[] = chatHistory.map(
          (msg: IRepoChatMessage) => {
            const parsed = parseJSONSafe(msg.content);

            // 🧠 If assistant message and JSON, render structured component
            if (msg.role === 'assistant' && parsed) {
              if (parsed.basicInfo) {
                return {
                  sender: 'assistant',
                  message: (
                    <RepoBasicInfoCard repoInfo={parsed.basicInfo} showHeader />
                  ),
                };
              } else if (parsed.fileStructure) {
                return {
                  sender: 'assistant',
                  message: <FileTree fileStructure={parsed.fileStructure} />,
                };
              } else if (parsed.aiAnalysis) {
                return {
                  sender: 'assistant',
                  message: (
                    <RepoAIAnalysisCard aiAnalysis={parsed.aiAnalysis} />
                  ),
                };
              }
            }

            if (msg.role === 'assistant') {
              return {
                sender: 'assistant',
                message: <AIResponseFormatter answer={msg.content} />,
              };
            }

            // Default (for user or plain text messages)
            return {
              sender: msg.role,
              message: msg.content,
            };
          }
        );

        setMessages(formattedMessages);
      } else {
        // 🆕 No chat history — fetch repo info
        refetchRepoInfo();
      }
    }
  }, [isHistorySuccess, chatHistory, refetchRepoInfo]);

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
  }, [messages, streaming]);

  // Show repo info as first message only when there is no chat history AND fetched successfully
  useEffect(() => {
    let repoInfo: IBasicRepoInfo['data']['basicInfo'] | undefined = undefined;

    if (isBasicRepoInfo(repoInfoResponse)) {
      repoInfo = repoInfoResponse.data.basicInfo;
    } else if (isFullRepoInfo(repoInfoResponse)) {
      repoInfo = repoInfoResponse.data.basicInfo;
    }

    if (
      isRepoSuccess &&
      repoInfo &&
      (messages.length === 0 ||
        messages.every((msg) => msg.sender !== 'assistant'))
    ) {
      setMessages((prev) => {
        const alreadyAdded = prev.some(
          (m) =>
            typeof m.message !== 'string' &&
            (m.message as JSX.Element)?.props?.children?.[0]?.props
              ?.children === repoInfo.name
        );
        if (alreadyAdded) return prev;
        return [
          ...prev,
          {
            sender: 'assistant',
            message: (
              <RepoBasicInfoCard repoInfo={repoInfo} showHeader={false} />
            ),
          },
        ];
      });
    }
  }, [isRepoSuccess, repoInfoResponse, messages]);

  if (isRepoLoading || isHistoryLoading) {
    return <ChatPageSkeleton />;
  }

  if (isHistoryError) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        ⚠️ Failed to load data. Please try again later.
      </div>
    );
  }

  const actionMap: Record<string, string | undefined> = {
    'Basic Analysis': 'basicAnalysis',
    'Get File Structure': 'fileStructure',
    'AI Analysis': 'aiAnalysis',
  };

  const handleSend = async (msg: IChatRequest) => {
    if (streamAbortRef.current) return; // one answer at a time
    setMessages((prev) => [...prev, { sender: 'user', message: msg.question }]);

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

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          message: (
            <div className="space-y-2">
              <AIResponseFormatter answer={text} />
              <ChatSources sources={sources} />
            </div>
          ),
        },
      ]);
    } catch (error) {
      // Page left or request cancelled: nothing to show, nothing saved
      if (ctrl.signal.aborted) return;
      console.error('ERROR: streamChat', error);
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Something went wrong while contacting AI service.';
      setMessages((prev) => [...prev, { sender: 'assistant', message }]);
    } finally {
      if (streamAbortRef.current === ctrl) streamAbortRef.current = null;
      if (!ctrl.signal.aborted) setStreaming(null);
    }
  };

  const handleAction = async (action: string) => {
    // Add user's message
    setMessages((prev) => [...prev, { sender: 'user', message: action }]);

    // Add loading message with context-specific text
    const loadingText = action.includes('File Structure')
      ? 'Fetching file structure'
      : action.includes('AI Analysis')
      ? 'Running AI analysis'
      : 'Processing request';

    setMessages((prev) => [
      ...prev,
      {
        sender: 'assistant',
        message: <LoadingMessage text={loadingText} />,
        isLoading: true,
      },
    ]);

    const info = actionMap[action];
    try {
      // Fetch data from API
      const res = await Repository.getRepoInfo(repoId, info);
      // Remove loading message
      setMessages((prev) => prev.filter((m) => !m.isLoading));

      if (!res) {
        setMessages((prev) => [
          ...prev,
          { sender: 'assistant', message: '⚠️ Something went wrong.' },
        ]);
        return;
      }

      if (
        info === 'aiAnalysis' &&
        isAIAnalysisResponse(res) &&
        (res.data.status === 'processing' || res.data.aiAnalysis === null)
      ) {
        Toast.info(
          'Background processing is ongoing. Sorry for the delay, please try again after some time.'
        );

        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            message: (
              <div className="p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
                ⏳ AI analysis is still running. Please wait a bit and try
                again. later.
              </div>
            ),
          },
        ]);
        return;
      }

      // Handle processing state for File Structure
      if (info === 'fileStructure' && isFileStructureRepoInfo(res)) {
        if (!res.data.fileStructure) {
          Toast.info(
            'File structure is still being processed. Please try again after some time.'
          );

          setMessages((prev) => [
            ...prev,
            {
              sender: 'assistant',
              message: (
                <div className="p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
                  ⏳ File structure extraction is still running. Please wait a
                  bit and try again!
                </div>
              ),
            },
          ]);
          return;
        }
      }

      // Format assistant response nicely
      let assistantMessage: JSX.Element | string = '';

      if (isBasicRepoInfo(res)) {
        const repo = res.data.basicInfo;
        assistantMessage = <RepoBasicInfoCard repoInfo={repo} showHeader />;
      } else if (isFileStructureRepoInfo(res)) {
        assistantMessage = <FileTree fileStructure={res.data.fileStructure} />;
      } else if (isAIAnalysisResponse(res)) {
        const { aiAnalysis, status } = res.data;

        assistantMessage = (
          <RepoAIAnalysisCard
            aiAnalysis={aiAnalysis}
            status={status}
            showHeader
          />
        );
      } else if (isFullRepoInfo(res)) {
        const repo = res.basicInfo;
        assistantMessage = (
          <div className="p-4 border rounded-xl bg-muted/30 space-y-2">
            <h3 className="font-semibold text-primary">
              📦 Full Repository Overview
            </h3>
            <p>{repo.name}</p>
            <p>{repo.description}</p>
          </div>
        );
      } else {
        Toast.info(
          'Processing is underway. We appreciate your patience — please try again shortly.'
        );
        assistantMessage = 'Please wait a bit and try again!';
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', message: assistantMessage },
      ]);
    } catch (error) {
      // Remove loading message on error
      setMessages((prev) => prev.filter((m) => !m.isLoading));
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', message: 'Failed to fetch repository data.' },
      ]);
      console.log(error);
    }
  };

  return (
    <main className="flex flex-col h-full bg-background text-foreground ">
      {/* Chat Section */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 md:p-6 space-y-3 sm:space-y-4 scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--muted) transparent',
        }}
      >
        <RepoProgress status={repoStatus} />

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ChatMessage sender={m.sender} message={m.message} />
            </motion.div>
          ))}
        </AnimatePresence>

        {streaming && (
          <ChatMessage
            sender="assistant"
            message={
              streaming.text ? (
                <div className="space-y-2">
                  <AIResponseFormatter answer={streaming.text} />
                  <ChatSources sources={streaming.sources} />
                </div>
              ) : (
                <LoadingMessage text="AI is generating response" />
              )
            }
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Actions + Input */}
      <div className="sticky bottom-0 left-0 right-0 bg-background px-4 py-2">
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
    </main>
  );
}
