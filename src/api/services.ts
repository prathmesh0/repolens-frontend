import { apiGet, apiPost } from '@/lib/apiMethods';
import { BODY, ENPOINTS } from '@/lib/Config';
import { ILogin } from '@/types/auth';
import {
  ChatAnalysisResponse,
  IAIAnalysisResponse,
  IBasicRepoInfo,
  IChatRequest,
  IFileStructureRepoInfo,
  IFullRepoInfo,
  IRepoChatData,
} from '@/types/chat';
import { IAnalyse, IRepositoryResponse } from '@/types/repo';

export class User {
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
      console.error('ERROR: analyseRepository', error);
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
    }
  }

  public static async chatHistory(
    _id: string
  ): Promise<IRepoChatData | undefined> {
    try {
      const response = await apiGet<IRepoChatData>(
        ENPOINTS.CHAT.CHAT_HISTORY(_id)
      );
      return response;
    } catch (error) {
      console.error('ERROR: chatHistory', error);
    }
  }
}
