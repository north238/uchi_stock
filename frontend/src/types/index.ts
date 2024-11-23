import React from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface LoginParams {
  email: string;
  password: string;
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
  category_id: string;
  location_id: string;
  is_favorite?: boolean;
}

export interface CreateItemRequest {
  name: string;
  quantity: number;
  description?: string;
  genre_id: string;
  category_id: string;
  location_id: string;
  is_favorite?: boolean;
}

export interface CreateItemResponse {
  message: string;
  item: Item;
}

export interface ItemCardProps {
  item: Item;
  deleteItem: (id: number) => void;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
}

export interface AlertWithSuccessProps {
  success: string | null;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface ItemListProps {
  setErrors: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface HeaderProps {
  user: User | null;
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
