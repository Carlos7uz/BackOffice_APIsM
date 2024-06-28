export interface Detalhe {
  id: number;
  status: string;
  url: string;
  tipo: string;
  cabecalhos: Cabecalho[];
  payload: string;
}

export interface Cabecalho {
  key: string;
  value: string;
}
