export interface Requisicao {
  id: string,
  appId: string;
  appUrl: string;
  appAuth: string;
  endpointId: string;
  endpointReq: string;
  endpointUrl: string;
  params: Param[],
  headers: Header[],
  body: any
}

export interface Param {
  id: string,
  paramName: string,
  paramValue: string
}

export interface Header{
  id: string,
  cabecalhoChave: string,
  cabecalhoValue: string
}
