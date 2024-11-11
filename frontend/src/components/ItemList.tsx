import React, { useEffect, useState } from 'react';
import { api, initializeCsrfToken } from '../api/axios';

// Itemインターフェースを定義
interface Item {
  id: number;
  name: string;
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

  return (
    <div>
      <h2>Item List</h2>
      {loading ? (
        <p>読み込み中...</p>
      ) : items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      ) : (
        <p>アイテムがありません。</p>
      )}
    </div>
  );
};

export default ItemList;
