import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Item, ItemListProps } from 'types';
import Loader from './ui/Loader';
import ItemCard from './mui/ItemCard';
import { getItems, deleteItem, fetchAllData } from 'api/ItemApi';
import { useDataContext } from 'contexts/DataContext';

const ItemList: React.FC<ItemListProps> = ({
  setErrors,
  setSuccess,
}: ItemListProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { setGenres, setCategories, setLocations } = useDataContext();

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

  const fetchApiAllData = async () => {
    try {
      const allData = await fetchAllData();
      setGenres(allData.genres);
      setCategories(allData.categories);
      setLocations(allData.locations);
    } catch (error) {
      console.log('データ取得に失敗しました。', error);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchApiAllData();
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
