import React from 'react';
import Typography from '@mui/material/Typography';
import { Item, ItemListProps } from 'types';
import ItemCard from './mui/ItemCard';
import AddItemCard from './mui/AddItemCard';

const ItemList: React.FC<ItemListProps> = ({
  items,
  setItems,
  deleteItemHandler,
  setErrors,
  setSuccess,
}: ItemListProps) => {
  return (
    <>
      <Typography variant="h5" component="div">
        <AddItemCard
          setItems={setItems}
          setErrors={setErrors}
          setSuccess={setSuccess}
        />
        {items.length > 0 ? (
          items.map((item: Item) => (
            <ItemCard
              key={item.id}
              item={item}
              setItems={setItems}
              deleteItem={deleteItemHandler}
              setErrors={setErrors}
              setSuccess={setSuccess}
            />
          ))
        ) : (
          <Typography variant="body2">アイテムがありません。</Typography>
        )}
      </Typography>
    </>
  );
};

export default ItemList;
