'use client';

import { JSX, useEffect, useState } from 'react';
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

type ChatMessageType = {
  sender: 'user' | 'assistant';
  message: string | JSX.Element;
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
                    <RepoAIAnalysisCard
                      aiAnalysis={parsed.aiAnalysis}
                      showHeader
                    />
                  ),
                };
              }
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

  const repoInfo = isFullRepoInfo(repoInfoResponse)
    ? repoInfoResponse.data.basicInfo
    : undefined;

  console.log('InitialRepoInfo', repoInfo);

  // when repoInfo is fetched, add as assistant message
  useEffect(() => {
    if (isRepoSuccess && repoInfo) {
      const repoMessage = (
        <RepoBasicInfoCard repoInfo={repoInfo} showHeader={false} />
      );

      // prevent duplicate push if data refetches
      setMessages((prev) => {
        const alreadyAdded = prev.some(
          (m) =>
            typeof m.message !== 'string' &&
            (m.message as JSX.Element)?.props?.children?.[0]?.props
              ?.children === repoInfo.name
        );
        if (alreadyAdded) return prev;
        return [...prev, { sender: 'assistant', message: repoMessage }];
      });
    }
  }, [isRepoSuccess, repoInfo]);

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
    // 1️⃣ Add user's message to chat
    setMessages((prev) => [...prev, { sender: 'user', message: msg.question }]);

    try {
      // 2️⃣ Call backend API for chat response
      const res = await ChatService.chatwithRepoRequest(repoId, msg);

      // 3️⃣ Handle successful response
      if (res?.success && res?.data?.answer) {
        const { answer, sources } = res.data;

        // assistant message with formatted visual output
        const assistantMessage = (
          <div className="p-4 rounded-2xl border border-border bg-muted/30 shadow-sm space-y-3">
            <h3 className="text-lg font-semibold text-primary">
              🤖 AI Response
            </h3>
            <p className="text-sm leading-relaxed">{answer}</p>

            {sources?.length > 0 && (
              <div className="pt-2">
                <p className="font-medium text-foreground mb-1">📚 Sources:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {sources.map((src: string, i: number) => (
                    <li key={i}>{src}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

        setMessages((prev) => [
          ...prev,
          { sender: 'assistant', message: assistantMessage },
        ]);
      } else {
        // If success false or no data
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            message:
              res?.message ||
              '🤖 AI could not generate a response right now. Please try again later.',
          },
        ]);
      }
    } catch (error) {
      console.error('ERROR: chatwithRepoRequest', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          message: '⚠️ Something went wrong while contacting AI service.',
        },
      ]);
    }
  };

  const handleAction = async (action: string) => {
    // 1️⃣ Add user's message
    setMessages((prev) => [...prev, { sender: 'user', message: action }]);

    const info = actionMap[action];
    try {
      // 2️⃣ Fetch data from API
      const res = await Repository.getRepoInfo(repoId, info);
      if (!res) {
        setMessages((prev) => [
          ...prev,
          { sender: 'assistant', message: '⚠️ Something went wrong.' },
        ]);
        return;
      }

      // 3️⃣ Format assistant response nicely
      let assistantMessage: JSX.Element | string = '';

      if (isBasicRepoInfo(res)) {
        const repo = res.data.basicInfo;
        assistantMessage = <RepoBasicInfoCard repoInfo={repo} showHeader />;
      } else if (isFileStructureRepoInfo(res)) {
        assistantMessage = <FileTree fileStructure={res.data.fileStructure} />;
      }
      // } else if (info === 'fileStructure' && (res as IFileStructureRepoInfo).) {
      //   assistantMessage = (
      //     <div className="p-3 rounded-lg border bg-muted/60 text-muted-foreground">
      //       ⏳ File structure extraction is still running. Please wait a bit and
      //       try again!
      //     </div>
      //   );
      // }
      else if (isAIAnalysisResponse(res)) {
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
        assistantMessage = '✅ Request processed.';
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', message: assistantMessage },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', message: '⚠️ Failed to fetch repository data.' },
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
        {messages.map((m, i) => (
          <ChatMessage
            key={i}
            sender={m.sender as 'user' | 'assistant'}
            message={m.message}
          />
        ))}
      </div>

      {/* Chat Actions + Input */}
      <div className="sticky bottom-0 left-0 right-0 bg-background px-4 py-2">
        <ChatActionsBar onSelect={handleAction} />
        <ChatInput onSend={handleSend} />
      </div>
    </main>
  );
}
