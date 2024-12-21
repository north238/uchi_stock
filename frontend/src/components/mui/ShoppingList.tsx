import React from 'react';
import { Typography } from '@mui/material';
import { Item, ShoppingListProps } from 'types';
import ItemCard from './ItemCard';

const ShoppingList: React.FC<ShoppingListProps> = ({
  favoriteItems,
  setFavoriteItems,
  deleteItemHandler,
  handleFavoriteToggle,
  setErrors,
  setSuccess,
}: ShoppingListProps) => {
  return (
    <>
      {favoriteItems.length > 0 ? (
        favoriteItems.map((item: Item) => (
          <ItemCard
            key={item.id}
            item={item}
            setItems={setFavoriteItems}
            isFavorite={item.is_favorite ?? 0}
            deleteItem={deleteItemHandler}
            handleFavoriteToggle={handleFavoriteToggle}
            setErrors={setErrors}
            setSuccess={setSuccess}
          />
        ))
      ) : (
        <Typography variant="body2">アイテムがありません。</Typography>
      )}
    </>
  );
};

export default ShoppingList;
