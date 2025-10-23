export interface ILogin {
  email: string;
  password: string;
}

export interface ILoginResponse {
  user: {
    _id: string;
    username: string;
    email: string;
    repoHistory: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  accessToken: string;
  refreshToken: string;
}

export interface IRegister {
  username: string;
  email: string;
  password: string;
}
