import { ILogin, IRegister } from '@/types/auth';

export const API_BASE: string = process.env.NEXT_PUBLIC_API_URL ?? '';

export const ENPOINTS = {
  USERS: {
    LOGIN: `${API_BASE}/users/login`,
    REGISTER: `${API_BASE}/users/register`,
    LOGOUT: `${API_BASE}/users/logout`,
    REFRESH_TOKEN: `${API_BASE}/users/refresh-token`,
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
};
