import React from 'react';
import { Typography } from '@mui/material';
import { Item, ShoppingListProps } from 'types';
import ItemCard from './ItemCard';

const ShoppingList: React.FC<ShoppingListProps> = ({
  favoriteItems,
  setFavoriteItems,
  deleteItemHandler,
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
            deleteItem={deleteItemHandler}
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
