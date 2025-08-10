export type GeneralError = {
  response: {
    data: {
      error: {
        message: string;
      }
    }
  }
}

export type CookieObject = {
  name: string;
  value: string;
};

export type UserRoles = 'user' | 'admin'