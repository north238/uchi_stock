import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Item, ItemListProps } from 'types';
import Loader from './ui/Loader';
import ItemCard from './mui/ItemCard';
import { getItems, deleteItem } from 'api/ItemApi';

const ItemList: React.FC<ItemListProps> = ({
  setErrors,
  setSuccess,
}: ItemListProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const deleteItemHandler = async (id: number) => {
    try {
      const response = await deleteItem(id);
      setSuccess(response.message);
      setItems((prevItems: Item[]) =>
        prevItems.filter((item) => item.id !== id)
      );
    } catch (error: any) {
      console.log('アイテムの削除に失敗しました。', error);
      setErrors(error.message);
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await getItems();
        setItems(response);
      } catch (error) {
        console.error('アイテムの取得に失敗しました。', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <Typography variant="h5" component="div">
      {items.length > 0 ? (
        items.map((item: Item) => (
          <ItemCard key={item.id} item={item} deleteItem={deleteItemHandler} />
        ))
      ) : (
        <Typography variant="body2">アイテムがありません。</Typography>
      )}
    </Typography>
  );
};

export default ItemList;
