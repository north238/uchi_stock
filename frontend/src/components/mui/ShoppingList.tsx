import React from 'react';
import { Typography, Paper } from '@mui/material';
import { Item, ShoppingListProps } from 'types';
import ItemCard from './ItemCard';
import { red } from './themePrimitives';

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
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          maxWidth: 295,
          backgroundColor: red[50],
          borderRadius: 2,
          borderColor: red[100],
        }}
      >
        <Typography
          variant="subtitle1"
          component="div"
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          買い物リスト ({favoriteItems.length})
        </Typography>
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
      </Paper>
    </>
  );
};

export default ShoppingList;
