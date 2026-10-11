import { ReactNode } from 'react';
import { AIResponseFormatter } from '@/components/AIResponseFormatter';
import ChatSources from '@/components/ChatSources';
import FileTree from '@/components/FileTree';
import RepoAIAnalysisCard from '@/components/RepoAiAnalysisCard';
import RepoBasicInfoCard from '@/components/RepoInfoBasicCard';
import { IRepoChatMessage } from '@/types/chat';
import { ChatItem } from '@/types/chatItem';
import { parseJSONSafe } from '@/lib/utils';

let localCounter = 0;

// Stable id for items created on the client (history items use the message _id)
export function newChatItemId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  localCounter += 1;
  return `local-${Date.now()}-${localCounter}`;
}

// The backend used to write these into chat history whenever getRepoInfo was
// called: a user message with one of these labels, then an assistant message
// holding a JSON dump of the response. They are not real conversation.
const DUMP_USER_LABELS = new Set([
  'Basic Analysis',
  'Get File Structure',
  'AI Analysis',
  'Repository Info',
]);

const DUMP_JSON_KEYS = ['basicInfo', 'fileStructure', 'aiAnalysis'];

export function isLegacyDumpMessage(msg: IRepoChatMessage): boolean {
  if (msg.role === 'user') return DUMP_USER_LABELS.has(msg.content.trim());

  const parsed = parseJSONSafe(msg.content);
  return (
    typeof parsed === 'object' &&
    parsed !== null &&
    DUMP_JSON_KEYS.some((key) => key in parsed)
  );
}

// Stored chat -> conversation items, skipping the legacy dump messages
export function historyToItems(messages: IRepoChatMessage[]): ChatItem[] {
  return messages
    .filter((msg) => !isLegacyDumpMessage(msg))
    .map((msg): ChatItem =>
      msg.role === 'assistant'
        ? { id: msg._id, role: 'assistant', type: 'answer', content: msg.content }
        : { id: msg._id, role: 'user', type: 'text', content: msg.content }
    );
}

// Item -> component. Strings are rendered by ChatMessage as a paragraph.
export function renderChatItem(item: ChatItem): ReactNode {
  switch (item.type) {
    case 'text':
      return item.content;
    case 'answer':
      return (
        <div className="space-y-2">
          <AIResponseFormatter answer={item.content} />
          <ChatSources sources={item.sources} />
        </div>
      );
    case 'basicInfo':
      return <RepoBasicInfoCard repoInfo={item.payload} showHeader />;
    case 'fileStructure':
      return <FileTree fileStructure={item.payload} />;
    case 'aiAnalysis':
      return <RepoAIAnalysisCard aiAnalysis={item.payload} showHeader />;
  }
}
