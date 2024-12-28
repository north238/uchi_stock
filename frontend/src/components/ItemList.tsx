import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Item, ItemListProps } from 'types';
import ItemCard from './mui/ItemCard';
import AddItemButton from './mui/AddItemButton';

const ItemList: React.FC<ItemListProps> = ({
  items,
  setItems,
  deleteItemHandler,
  handleFavoriteToggle,
  setErrors,
  setSuccess,
}: ItemListProps) => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: 1,
          minHeight: 90,
          overflowX: 'auto',
          overflowY: 'auto',
          border: '2px solid #ccc',
          borderRadius: 2,
          backgroundColor: '#f5f5f5',
        }}
      >
        <AddItemButton
          setItems={setItems}
          setErrors={setErrors}
          setSuccess={setSuccess}
        />
        {items.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              p: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              アイテムがありません。「＋」ボタンから追加してください。
            </Typography>
          </Box>
        ) : (
          items.map(
            (genre) =>
              genre.items &&
              genre.items.length > 0 && (
                <Paper
                  key={genre.id}
                  elevation={0}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1,
                    minWidth: 295,
                    height: 'fit-content',
                    backgroundColor: genre.color.hex_code ?? '#f5f5f5',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{ fontWeight: 'bold', mb: 1 }}
                  >
                    {genre.name} ({genre.items.length})
                  </Typography>
                  {genre.items.map((item: Item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      setItems={setItems}
                      isFavorite={item.is_favorite ?? 0}
                      deleteItem={deleteItemHandler}
                      handleFavoriteToggle={handleFavoriteToggle}
                      setErrors={setErrors}
                      setSuccess={setSuccess}
                    />
                  ))}
                </Paper>
              )
          )
        )}
      </Box>
    </>
  );
};

export default ItemList;
