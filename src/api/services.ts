import { postMethod } from '@/lib/apiMethods';
import { BODY, ENPOINTS } from '@/lib/Config';
import { ApiBaseResponse } from '@/types/api';
import { ILogin, ILoginResponse } from '@/types/auth';

export class User {
  public static async handleLogin(body: ILogin) {
    try {
      const response = await postMethod<ApiBaseResponse<ILoginResponse>>(
        ENPOINTS.USERS.LOGIN,
        BODY.USERS.LOGIN(body)
      );
      return response;
    } catch (error) {
      console.log('ERROR: handleLogin', error);
    }
  }
}
