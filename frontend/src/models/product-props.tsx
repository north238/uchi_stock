export interface ProductProps {
  name: string;
  quantity: number | null;
  date: Date;
}

export interface ProductWithIdProps {
  _id: string;
  name: string;
  quantity: number | null;
  date: Date;
}