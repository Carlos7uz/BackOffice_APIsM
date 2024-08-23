export interface Collection {
  id: number;
  name: string;
  description: string;
  requests: Request[]
}

export interface Request{
  id: number;
  url: string;
  method: string;
  body: string;
  params: Params[]
}

export interface Params{
  id: number;
  paramName: string;
  paramValue: string
  required: boolean;
  paramUrl: boolean;
}
