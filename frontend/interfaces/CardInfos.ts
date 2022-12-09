export interface CardInfos {
  id: number;
  price: number;
  discount: number;
  available: number;
  sold: number;
  totalSellable: number;
  uri: string;
}

export interface CardResale{
  id: number;
  price: number;
  cardId: number;
  discount: number;
}
