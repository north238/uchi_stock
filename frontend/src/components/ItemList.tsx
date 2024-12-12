import React, { useEffect, useState, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import { Item, ItemListProps } from 'types';
import Loader from './ui/Loader';
import ItemCard from './mui/ItemCard';
import { getItems, deleteItem, fetchAllData } from 'api/ItemApi';
import { useDataContext } from 'contexts/DataContext';
import AddItemCard from './mui/AddItemCard';

const ItemList: React.FC<ItemListProps> = ({
  setErrors,
  setSuccess,
}: ItemListProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { setGenres, setCategories, setLocations } = useDataContext();

  // 削除ボタンクリック
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

  // アイテム取得
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getItems();
      setItems(response);
    } catch (error: any) {
      console.error('アイテムの取得に失敗しました。', error);
      setErrors(error.message);
    }
  }, [setItems, setErrors]);

  // 各種選択項目の取得
  const fetchApiAllData = useCallback(async () => {
    setLoading(true);
    try {
      const allData = await fetchAllData();
      setGenres(allData.genres);
      setCategories(allData.categories);
      setLocations(allData.locations);
    } catch (error: any) {
      console.log('データ取得に失敗しました。', error);
      setErrors(error.message);
    }
  }, [setGenres, setCategories, setLocations, setErrors]);

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([fetchItems(), fetchApiAllData()]);
      setLoading(false);
    };
    fetchAllData();
    console.log('アイテム取得');
  }, [fetchItems, fetchApiAllData]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Typography variant="h5" component="div">
        <AddItemCard />
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
