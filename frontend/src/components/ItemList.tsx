import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '../api/axios';

// Itemインターフェースを定義
interface Item {
  id: number;
  name: string;
}

const ItemList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]); // itemsの型を指定

  useEffect(() => {
    const fetchItems = async () => {
      try {
        axios.defaults.withCredentials = true;
        await api.get('/sanctum/csrf-cookie');
        const response = await api.get('/items'); // APIからアイテムを取得
        setItems(response.data);
      } catch (error) {
        console.error('アイテムの取得に失敗しました。', error);
      }
    };

    fetchItems();
  }, []);

  return (
    <div>
      <h2>Item List</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ItemList;
