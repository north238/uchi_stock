import React from 'react';

export interface LoginParams {
  email: string;
  password: string;
  remember?: string | null;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface Item {
  id: number;
  name: string;
  quantity: number;
  description?: string;
  genre_id: string;
  is_favorite?: number;
  items?: Item[];
  color: {
    hex_code: string;
  };
}

export interface CreateItemRequest {
  name: string;
  quantity: number;
  description?: string;
  genre_id: string;
  is_favorite?: number;
}

export interface UpdatedItemRequest {
  name: string;
  quantity: number;
  genre_id: string;
  description: string;
}

export interface CreateItemResponse {
  message: string;
  item: Item;
  items: Item[];
  isFavorite?: number;
}

export interface ItemCardProps {
  item: Item;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  isFavorite: number;
  deleteItem: (id: number) => void;
  handleFavoriteToggle: (id: number, isFavorite: number) => void;
  setErrors: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface ItemUpdateModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  item: Item;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setErrors: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface AddItemCardProps {
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setErrors: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface ItemCreateModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setErrors: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface ItemCreateProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setErrors: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface Genre {
  genre_id: number;
  genre_name: string;
  color_name: string;
  hex_code: string;
}

export interface GenreResponse {
  message?: string;
  genres: Genre[];
}

export interface AlertWithSuccessProps {
  success: string | null;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface AlertWithErrorsProps {
  errors: string | null;
  setErrors: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface ItemListProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  deleteItemHandler: (id: number) => void;
  handleFavoriteToggle: (id: number, isFavorite: number) => void;
  setErrors: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface ShoppingListProps {
  favoriteItems: Item[];
  setFavoriteItems: React.Dispatch<React.SetStateAction<Item[]>>;
  deleteItemHandler: (id: number) => void;
  handleFavoriteToggle: (id: number, isFavorite: number) => void;
  setErrors: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string | number;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;
}

export interface LoadingContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export interface DataContextType {
  genres: Genre[];
  setGenres: React.Dispatch<React.SetStateAction<Genre[]>>;
}

export interface FavoriteBtnProps {
  item: Item;
  isFavorite: number;
  handleFavoriteToggle: (id: number, isFavorite: number) => void;
}

export interface NotificationsData {
  user_id: number;
  item_id: number;
  message: string;
  status: number;
  type: number;
  priority: number;
  sent_at: string;
}
