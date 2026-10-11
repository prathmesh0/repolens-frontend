import { enhancedFetch } from '@/api/interceptor';
import { ApiError, apiGet, apiPost } from '@/lib/apiMethods';
import { readSSE } from '@/lib/sse';
import { BODY, ENPOINTS } from '@/lib/Config';
import { ApiBaseResponse } from '@/types/api';
import { ILogin, IMe } from '@/types/auth';
import {
  ChatAnalysisResponse,
  IAIAnalysisResponse,
  IBasicRepoInfo,
  IChatRequest,
  IFileStructureRepoInfo,
  IFullRepoInfo,
  IRepoChatData,
} from '@/types/chat';
import { IAnalyse, IRepositoryResponse, RepoHistoryItem } from '@/types/repo';

// Backend errors arrive as { success:false, message, data:null }. Hand that
// body back so callers keep reading `res.message` / `res.success`.
function errorBody<T>(error: unknown): T | undefined {
  if (error instanceof ApiError && error.body) return error.body as T;
  return undefined;
}

export class User {
  // Not wrapped in try/catch: the auth gate needs the error to tell
  // "logged out" (401) from a transient failure.
  public static async getMe(): Promise<IMe> {
    const response = await apiGet<ApiBaseResponse<IMe>>(ENPOINTS.USERS.ME);
    return response.data;
  }

  public static async handleLogin(body: ILogin) {
    try {
      const response = await apiPost(
        ENPOINTS.USERS.LOGIN,
        BODY.USERS.LOGIN(body)
      );
      return response;
    } catch (error) {
      console.log('ERROR: handleLogin', error);
    }
  }

  public static async getRepoHistory(
    query?: string
  ): Promise<ApiBaseResponse<RepoHistoryItem[]> | undefined> {
    try {
      const response = await apiGet<ApiBaseResponse<RepoHistoryItem[]>>(
        ENPOINTS.USERS.REPOHISTORY(query)
      );
      return response;
    } catch (error) {
      console.error('ERROR: getRepoHistory', error);
      return undefined;
    }
  }
}

export class Repository {
  public static async analyseRepository(
    body: IAnalyse
  ): Promise<IRepositoryResponse | undefined> {
    try {
      const response = await apiPost<IRepositoryResponse>(
        ENPOINTS.REPOSITORY.ANALYSE,
        BODY.REPOSITORY.ANALYSE(body)
      );
      return response;
    } catch (error) {
      console.error('ERROR: analyseRepository', error);
      return errorBody<IRepositoryResponse>(error);
    }
  }

  public static async getRepoInfo(
    _id: string,
    info?: string
  ): Promise<
    | IBasicRepoInfo
    | IFileStructureRepoInfo
    | IAIAnalysisResponse
    | IFullRepoInfo
    | undefined
  > {
    try {
      const url = info
        ? `${ENPOINTS.REPOSITORY.GET_REPO_INFO(_id)}?info=${info}`
        : ENPOINTS.REPOSITORY.GET_REPO_INFO(_id);

      const response = await apiGet<
        | IBasicRepoInfo
        | IFileStructureRepoInfo
        | IAIAnalysisResponse
        | IFullRepoInfo
      >(url);
      return response;
    } catch (error) {
      console.error('ERROR: getRepoInfo', error);
      return errorBody<IBasicRepoInfo>(error);
    }
  }
}

export class ChatService {
  public static async chatwithRepoRequest(
    _id: string,
    body: IChatRequest
  ): Promise<ChatAnalysisResponse | undefined> {
    try {
      const response = await apiPost<ChatAnalysisResponse>(
        ENPOINTS.CHAT.CHAT_WITH_REPO(_id),
        BODY.CHAT.CHAT_WITH_REPO(body)
      );
      return response;
    } catch (error) {
      console.error('ERROR: chatwithRepoRequest', error);
      return errorBody<ChatAnalysisResponse>(error);
    }
  }

  // Streaming chat. Resolves with the chatId once the server saved the
  // answer. Problems before the model starts come back as plain JSON errors
  // (not a stream) and are thrown as ApiError.
  public static async streamChat(
    _id: string,
    body: IChatRequest,
    handlers: {
      signal?: AbortSignal;
      onSources?: (sources: string[]) => void;
      onToken: (text: string) => void;
    }
  ): Promise<string | undefined> {
    const res = await enhancedFetch(ENPOINTS.CHAT.CHAT_STREAM(_id), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(BODY.CHAT.CHAT_WITH_REPO(body)),
      signal: handlers.signal,
    });

    const isStream = res.headers
      .get('content-type')
      ?.includes('text/event-stream');
    if (!res.ok || !isStream) {
      const text = await res.text();
      let parsed: { message?: string } | undefined;
      try {
        parsed = text ? JSON.parse(text) : undefined;
      } catch {
        parsed = undefined;
      }
      throw new ApiError(
        res.status,
        parsed?.message || res.statusText || 'Chat request failed',
        parsed
      );
    }

    for await (const { event, data } of readSSE(res, handlers.signal)) {
      const payload = data as {
        sources?: string[];
        text?: string;
        chatId?: string;
        message?: string;
      };
      if (event === 'sources') handlers.onSources?.(payload.sources ?? []);
      else if (event === 'token') handlers.onToken(payload.text ?? '');
      else if (event === 'done') return payload.chatId;
      else if (event === 'error') {
        throw new Error(payload.message || 'The answer could not be generated');
      }
    }
    throw new Error('Chat stream closed before the answer finished');
  }

  // Returns the newest `limit` messages (oldest first). Pass `before` = _id of
  // the oldest loaded message to page backwards.
  public static async chatHistory(
    _id: string,
    params?: { limit?: number; before?: string }
  ): Promise<IRepoChatData | undefined> {
    try {
      const response = await apiGet<IRepoChatData>(
        ENPOINTS.CHAT.CHAT_HISTORY(_id, params)
      );
      return response;
    } catch (error) {
      console.error('ERROR: chatHistory', error);
      return errorBody<IRepoChatData>(error);
    }
  }
}
