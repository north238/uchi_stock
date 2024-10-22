import React, { useEffect, useState } from 'react';
import { api } from '../api/axios'

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
        const response = await api.get('/items'); // APIからアイテムを取得
        console.log('API Response:', response);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
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
