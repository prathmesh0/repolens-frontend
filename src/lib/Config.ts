import { ILogin, IRegister } from '@/types/auth';
import { IChatRequest } from '@/types/chat';
import { IAnalyse } from '@/types/repo';

export const API_BASE: string = process.env.NEXT_PUBLIC_API_URL ?? '';

export const ENPOINTS = {
  USERS: {
    LOGIN: `${API_BASE}/users/login`,
    REGISTER: `${API_BASE}/users/register`,
    LOGOUT: `${API_BASE}/users/logout`,
    ME: `${API_BASE}/users/me`,
    REFRESH_TOKEN: `${API_BASE}/users/refresh-token`,
    REPOHISTORY: (query?: string) =>
      query
        ? `${API_BASE}/users/repo-history?query=${encodeURIComponent(query)}`
        : `${API_BASE}/users/repo-history`,
  },

  REPOSITORY: {
    ANALYSE: `${API_BASE}/repository/analyse`,
    GET_REPO_INFO: (_id: string) => `${API_BASE}/repository/getRepoInfo/${_id}`,
    STATUS_STREAM: (_id: string) =>
      `${API_BASE}/repository/status-stream/${_id}`,
  },
  CHAT: {
    CHAT_WITH_REPO: (_id: string) => `${API_BASE}/aiChat/chat/${_id}`,
    CHAT_STREAM: (_id: string) =>
      `${API_BASE}/aiChat/chat/${_id}?stream=true`,
    CHAT_HISTORY: (_id: string) => `${API_BASE}/aiChat/chat-history/${_id}`,
  },
};

export const BODY = {
  USERS: {
    LOGIN: (val?: ILogin): ILogin => ({
      email: val?.email || '',
      password: val?.password || '',
    }),

    REGISTER: (val?: IRegister): IRegister => ({
      username: val?.username || '',
      email: val?.email || '',
      password: val?.password || '',
    }),
  },

  REPOSITORY: {
    ANALYSE: (val?: IAnalyse): IAnalyse => ({
      url: val?.url || '',
    }),
  },
  CHAT: {
    CHAT_WITH_REPO: (val?: IChatRequest): IChatRequest => ({
      question: val?.question || '',
    }),
  },
};
