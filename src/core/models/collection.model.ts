import { HttpErrorResponse } from "@angular/common/http";
import { CollectionResponse } from "./collection-response.model";

export interface Collection {
  id: number;
  name: string;
  description: string;
  requests: CollectionRequests[]
}

export interface CollectionRequests{
  id: number;
  url: string;
  authUrl: string;
  authFormat: string;
  authParams: AuthParamsCollectionRequest[]
  method: string;
  body?: any;
  params?: CollectionParam[]
}

export interface AuthParamsCollectionRequest{
  id: number;
  authParamKey: string;
  authParamKeyValue: string;
}

export interface CollectionParam{
  id: number;
  paramName: string;
  paramValue: string
  required: boolean;
  paramUrl: boolean;
}
