export interface ProductProps {
  name: string;
  place: string,
  categories: string,
  quantity: number | null;
  date: Date;
  isAddToList: boolean;
}

export interface ProductWithIdProps {
  _id: string;
  name: string;
  place: string;
  categories: string;
  quantity: number | null;
  date: Date;
  isAddToList: boolean;
}