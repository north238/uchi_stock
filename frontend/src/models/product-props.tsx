export interface ProductProps {
  name: string;
  place: string,
  quantity: number | null;
  date: Date;
}

export interface ProductWithIdProps {
  _id: string;
  name: string;
  place: string,
  quantity: number | null;
  date: Date;
}