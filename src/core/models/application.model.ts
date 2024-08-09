export interface Application {
  id: number;
  nameFormControl: string;
  appUrlFormControl: string;
  authUrlFormControl?: string;
  authFormat: string;
  authParams: AuthParameter[];
  endpoints: Endpoint[];
}

export interface AuthParameter {
  id: number;
  authParamName: string;
  authParamValue: string;
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
  paramUrl: boolean;
}
