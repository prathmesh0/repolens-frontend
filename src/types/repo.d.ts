export interface IAnalyse {
  url: string;
}

export interface IRepositoryBasicInfo {
  name: string;
  owner: string;
  url: string;
  stars: number;
  forks: number;
  watchers: number;
  commitCount: number;
  branches: string[];
  contributors: string[];
  languages: string[];
  lastSynced: string;
  description: string;
  fileStructureStatus: string;
  aiStatus: string;
  embeddingStatus: string;
  user: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IRepositoryResponse {
  statusCode: number;
  data: {
    basicInfo: IRepositoryBasicInfo;
  };
  message: string;
  success: boolean;
}
