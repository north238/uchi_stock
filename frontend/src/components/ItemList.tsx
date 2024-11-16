import React, { useEffect, useState } from 'react';
import { api, initializeCsrfToken } from '../api/axios';
import Loader from './ui/Loader';
import ItemCard from './mui/ItemCard';
import Typography from '@mui/material/Typography';

// Itemインターフェースを定義
interface Item {
  id: number;
  name: string;
  is_favorite: boolean;
  description: string;
}

const ItemList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        await initializeCsrfToken();
        const response = await api.get('/items');
        setItems(response.data);
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

  if (!items || items.length === 0) {
    console.warn('No items provided'); // デバッグ用
  }

  return (
    <Typography variant="h5" component="div">
      {items.length > 0 ? (
        items.map((item) => <ItemCard key={item.id} item={item} />)
      ) : (
        <Typography variant="body2">アイテムがありません。</Typography>
      )}
    </Typography>
  );
};

export default ItemList;
