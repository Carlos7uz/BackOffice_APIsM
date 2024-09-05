export interface CollectionRequests {
  id: number;
  url: string;
  method: string;
  body?: any;
  params?: CollectionParam[];
  headers?: CollectionHeader[];
}

export interface CollectionParam {
  key: string;
  value: string | number | boolean;
}

export interface CollectionHeader {
  key: string;
  value: string;
}
