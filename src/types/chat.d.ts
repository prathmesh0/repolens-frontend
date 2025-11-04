export interface IChatRequest {
  question: string;
}

export interface ChatAnalysisResponse {
  statusCode: number;
  data: {
    answer: string;
    sources: string[];
    chatId: string;
  };
  message: string;
  success: boolean;
}

interface IRepoChatMessage {
  role: 'user' | 'assistant';
  content: string;
  _id: string;
  createdAt: string; // ISO 8601 formatted date string
}

export interface IRepoChatData {
  statusCode: number;
  data: {
    messages: IRepoChatMessage[];
    chatId: string;
  };
  message: string;
  success: boolean;
}

export interface IBasicRepoInfo {
  statusCode: number;
  data: {
    basicInfo: {
      id: string;
      name: string;
      owner: string;
      url: string;
      stars: number;
      forks: number;
      watchers: number;
      commitCount: number;
      branches: string[];
      contributors: string[];
      lastSynced: string;
      description: string;
      createdAt: string;
      updatedAt: string;
      languages: string[];
      statuses: {
        fileStructureStatus: string;
        aiStatus: string;
        embeddingStatus: string;
      };
    };
  };
  message: string;
  success: boolean;
}

export interface IFileStructureNode {
  type: 'file' | 'dir';
  name: string;
  path: string;
  size?: number;
  extension?: string;
  children?: IFileStructureNode[];
}

export interface IFileStructureRepoInfo {
  statusCode: number;
  data: {
    fileStructure: IFileStructureNode;
  };
  message: string;
  success: boolean;
}

export interface IAIAnalysis {
  _id: string;
  repo: string;
  summary: string;
  complexity: string;
  potentialIssues: string[];
  architecture: string;
  createdAt: string; // ISO 8601 date string
  __v: number;
}

export interface IAIAnalysisResponse {
  statusCode: number;
  data: {
    aiAnalysis: IAIAnalysis;
    status: string;
  };
  message: string;
  success: boolean;
}

export interface IFullRepoInfo {
  basicInfo: IBasicRepoInfo['data']['basicInfo'];
  fileStructure: IFileStructureNode;
  aiAnalysis: IAIAnalysis;
  statuses: {
    fileStructureStatus: string;
    aiStatus: string;
    embeddingStatus: string;
  };
  message: string;
  success: boolean;
}
