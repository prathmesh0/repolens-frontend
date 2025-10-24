import { apiPost } from '@/lib/apiMethods';
import { BODY, ENPOINTS } from '@/lib/Config';
import { ILogin } from '@/types/auth';

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
