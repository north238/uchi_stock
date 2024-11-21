import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Item } from 'types';
import Loader from './ui/Loader';
import ItemCard from './mui/ItemCard';
import { getItems } from 'api/ItemApi';

const ItemList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

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
        items.map((item: Item) => <ItemCard key={item.id} item={item} />)
      ) : (
        <Typography variant="body2">アイテムがありません。</Typography>
      )}
    </Typography>
  );
};

export default ItemList;
