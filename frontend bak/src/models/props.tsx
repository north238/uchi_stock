import { Dispatch, SetStateAction } from "react";

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

export interface ProductListProps {
  loading: boolean;
  items: ProductWithIdProps[];
  setProduct: Dispatch<SetStateAction<ProductProps[]>>;
  onDeleteProduct: (_id: string) => void;
  onUpdateProduct: (_id: string) => void;
  onAddProduct: (
    name: string,
    place: string,
    categories: string,
    quantity: number | null,
    date: Date,
    isAddToList: false
  ) => void;
}

export interface EditProductProps {
  product: ProductWithIdProps;
  onSaveProduct: (updateProduct: ProductWithIdProps) => void;
}

export interface NewProductProps {
  onAddProduct: (
    name: string,
    place: string,
    categories: string,
    quantity: number | null,
    date: Date,
    isAddToList: boolean
  ) => void;
}

export interface ShoppingListProps {
  badgeCount: number;
  setBadgeCount: Dispatch<SetStateAction<number>>;
}

export interface CounterProps {
  newCount: number | null;
  onCountChange: (newCount: number) => void;
}

export interface NavbarProps {
  badgeCount: number;
}