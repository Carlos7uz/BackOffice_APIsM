export interface AuthRequest{
  id: number;
  authUrl: string;
  format: string;
  authParam: AuthParam[];
}

export interface AuthParam{
  id: number;
  name: string;
  value: string;
}
