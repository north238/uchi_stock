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
  onDeleteProduct: (_id: string) => void;
  updateProduct: (_id: string) => void;
  addToShoppingList: (_id: string) => void;
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