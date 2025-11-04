'use client';

import { JSX, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, GitFork, Eye } from 'lucide-react';
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
} from '@/types/chat';
import CustomLoader from '@/components/CustomLoader';

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
  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['repoInfo', repoId],
    queryFn: async () => {
      const res = await Repository.getRepoInfo(repoId);
      return res;
    },
  });

  // const { data: chatHistory, isLoading: isHistoryLoading } = useQuery({
  //   queryKey: ['chatHistory', repoId],
  //   queryFn: async () => {
  //     const res = await ChatService.chatHistory(repoId); // implement this in your service
  //     return res?.data?.messages;
  //   },
  //   enabled: !!repoId, // fetch only when repoId exists
  // });

  const actionMap: Record<string, string | undefined> = {
    'Basic Analysis': 'basicAnalysis',
    'Get File Structure': 'fileStructure',
    'AI Analysis': 'aiAnalysis',
  };

  const repoInfo = isFullRepoInfo(data) ? data.data.basicInfo : undefined;

  console.log('InitialRepoInfo', repoInfo);

  // when repoInfo is fetched, add as assistant message
  useEffect(() => {
    if (isSuccess && repoInfo) {
      const repoMessage = (
        <div className="space-y-2">
          <p className="font-semibold text-lg text-primary">{repoInfo.name}</p>
          <p>{repoInfo.description}</p>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" /> {repoInfo.stars}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-4 h-4 text-blue-500" /> {repoInfo.forks}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-green-500" /> {repoInfo.watchers}
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
  }, [isSuccess, repoInfo]);

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
        assistantMessage = (
          <div className="p-4 rounded-2xl border border-border bg-muted/30 shadow-sm space-y-3">
            <h3 className="text-lg font-semibold text-primary">
              📦 Basic Repository Information
            </h3>

            <div className="space-y-1">
              <p className="text-xl font-semibold text-foreground">
                {repo.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {repo.description}
              </p>
            </div>

            <div className="pt-2 text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">👤 Owner:</span>{' '}
                {repo.owner}
              </p>
              <p>
                <span className="font-medium text-foreground">
                  🗣 Languages:
                </span>{' '}
                {repo.languages?.join(', ')}
              </p>
              <p>
                <span className="font-medium text-foreground">⭐ Stars:</span>{' '}
                {repo.stars} &nbsp;|&nbsp;
                <span className="font-medium text-foreground">
                  🍴 Forks:
                </span>{' '}
                {repo.forks} &nbsp;|&nbsp;
                <span className="font-medium text-foreground">
                  👀 Watchers:
                </span>{' '}
                {repo.watchers}
              </p>
              <p>
                <span className="font-medium text-foreground">
                  🌿 Branches:
                </span>{' '}
                {repo.branches?.join(', ')}
              </p>
              <p>
                <span className="font-medium text-foreground">
                  📅 Last Synced:
                </span>{' '}
                {new Date(repo.lastSynced).toLocaleString()}
              </p>
            </div>
          </div>
        );
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

        if (status === 'ready') {
          assistantMessage = (
            <div className="p-4 rounded-2xl border border-border bg-muted/30 shadow-sm space-y-3">
              <h3 className="text-lg font-semibold text-primary">
                🤖 AI Analysis Summary
              </h3>

              <div className="space-y-1">
                <p className="text-sm leading-relaxed">{aiAnalysis.summary}</p>
              </div>

              <div className="pt-2 text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium text-foreground">
                    🧠 Complexity:
                  </span>{' '}
                  {aiAnalysis.complexity}
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    🏗 Architecture:
                  </span>{' '}
                  {aiAnalysis.architecture}
                </p>
                {aiAnalysis.potentialIssues?.length > 0 && (
                  <div className="pt-2">
                    <p className="font-medium text-foreground mb-1">
                      ⚠ Potential Issues:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {aiAnalysis.potentialIssues.map(
                        (issue: string, i: number) => (
                          <li key={i}>{issue}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        } else {
          assistantMessage = (
            <div className="p-3 rounded-lg border bg-muted/60 text-muted-foreground">
              ⏳ AI analysis is still running. Please wait.
            </div>
          );
        }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <CustomLoader className="h-12 w-12" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        ⚠️ Failed to load repository information. Please try again later.
      </div>
    );
  }

  return (
    <main className="flex flex-col h-full bg-background text-foreground ">
      {/* Chat Section */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 scroll-smooth"
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
