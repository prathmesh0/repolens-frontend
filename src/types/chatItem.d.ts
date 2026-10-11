import {
  IAIAnalysis,
  IBasicRepoInfo,
  IFileStructureNode,
} from '@/types/chat';

// One entry in the conversation, as plain data. Components are chosen from
// `type` at render time (see renderChatItem), so state is serialisable and
// every item has a stable id to use as a React key.
interface ChatItemBase {
  id: string;
  role: 'user' | 'assistant';
}

export interface ChatTextItem extends ChatItemBase {
  type: 'text';
  content: string;
}

export interface ChatAnswerItem extends ChatItemBase {
  type: 'answer';
  content: string;
  sources?: string[];
}

export interface ChatBasicInfoItem extends ChatItemBase {
  type: 'basicInfo';
  payload: IBasicRepoInfo['data']['basicInfo'];
}

export interface ChatFileStructureItem extends ChatItemBase {
  type: 'fileStructure';
  payload: IFileStructureNode;
}

export interface ChatAIAnalysisItem extends ChatItemBase {
  type: 'aiAnalysis';
  payload: IAIAnalysis;
}

export type ChatItem =
  | ChatTextItem
  | ChatAnswerItem
  | ChatBasicInfoItem
  | ChatFileStructureItem
  | ChatAIAnalysisItem;
