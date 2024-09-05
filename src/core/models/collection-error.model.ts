export interface CollectionError {
  collectionId?: number;
  requestId?: number;  // Altere de `number` para `number | undefined`
  status?: number;
  statusText?: string;
  url?: string;
  headers?: any;
  body?: any;
  message?: string;
}
