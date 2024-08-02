import { HttpErrorResponse } from "@angular/common/http";
import { ResponseDetails } from "./response-details";

export interface Request {
  id: string,
  appId: number;
  appUrl: string;
  appAuth: string;
  endpointId: number;
  endpointReq: string;
  endpointUrl: string;
  params: Param[];
  headers: Header[];
  body: any;
  timestamp?: string;
  response?: ResponseDetails;
  error?: HttpErrorResponse;
}

export interface Param {
  id: string,
  paramName: string,
  paramValue: string,
  paramUrl: boolean
}

export interface Header{
  id: string,
  key: string,
  value: string
}
