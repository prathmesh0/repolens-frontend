export interface ILogin {
  email: string;
  password: string;
}

export interface IRegister {
  username: string;
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

// Present only for demo guests (GET /users/me and POST /users/demo-login)
export interface IDemoInfo {
  analysesUsed: number;
  analysesMax: number;
  chatUsed: number;
  chatMax: number;
  expiresAt: string;
}

export interface IMe {
  _id: string;
  username: string;
  // Guests have no email
  email?: string;
  createdAt: string;
  isDemo?: boolean;
  demo?: IDemoInfo;
}

export interface IDemoLoginResponse {
  user: IMe;
  accessToken: string;
}

export interface ILogoutResponse {
  [key: string]: never;
}

export interface IRegister {
  username: string;
  email: string;
  password: string;
}
