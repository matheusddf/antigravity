export type Category = {
  id: string;
  nome: string;
  ordem: number;
  criado_em: string;
};

export type Product = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagens_url: string[];
  modelo_3d_url: string | null;
  categoria_id: string;
  disponivel: boolean;
  destaque: boolean;
  criado_em: string;
  complementos?: Complemento[];
};

export type Complemento = {
  nome: string;
  preco: number;
};

export type OrderStatus = 'novo' | 'preparando' | 'saiu para entrega' | 'finalizado';

export type OrderItem = {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
  observacoes?: string;
  adicionais?: Complemento[];
  removidos?: string[];
};

export type Order = {
  id: string;
  nome_cliente: string;
  telefone: string;
  endereco: string;
  bairro: string;
  taxa_entrega: number;
  itens: OrderItem[];
  total: number;
  status: OrderStatus;
  criado_em: string;
  tipo_entrega: 'delivery' | 'retirada';
  forma_pagamento: string;
  troco?: number;
};

export type Banner = {
  id: string;
  imagem_url: string;
  link: string | null;
  ordem: number;
};

export type DeliveryArea = {
  id: string;
  bairro: string;
  valor: number;
};

export type StoreConfig = {
  id: string;
  nome_loja: string;
  logo_url: string | null;
  cover_url?: string | null;
  whatsapp: string;
  endereco: string;
  horarios: Record<string, string>;
  pagamentos: string[];
  esta_aberto: boolean;
  frete_gratis_valor: number | null;
  font_family?: string;
};
