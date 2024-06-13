export interface Aplicativo {
  id: number;
  nameFormControl: string;
  appUrlFormControl: string;
  authUrlFormControl?: string;
  endpoints: Endpoint[];
}

export interface Endpoint {
  id: number;
  reqFormControl: string;
  endpointUrlFormControl: string;
  params: Parameter[];
}

export interface Parameter {
  id: number;
  paramNameFormControl: string;
  value: string;
  required: boolean;
}
