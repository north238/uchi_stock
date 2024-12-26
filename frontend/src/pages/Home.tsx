import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchAuthenticatedUser } from 'api/auth';
import {
  getItems,
  fetchAllData,
  fetchFavoriteItems,
  deleteItem,
  changeColorFavoriteIcon,
} from 'api/ItemApi';
import { useAuthContext } from 'contexts/AuthContext';
import { useLoading } from 'contexts/LoadingContext';
import AlertWithErrors from 'components/mui/AlertWithErrors';
import AlertWithSuccess from 'components/mui/AlertWithSuccess';
import ItemList from 'components/ItemList';
import Loader from 'components/ui/Loader';
import ShoppingList from 'components/mui/ShoppingList';
import { Item } from 'types';
import { useDataContext } from 'contexts/DataContext';

const Home: React.FC = () => {
  const { user, setUser } = useAuthContext();
  const { loading, setLoading } = useLoading();
  const { setGenres, setCategories, setLocations } = useDataContext();
  const [errors, setErrors] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<Item[]>([]);
  const [isFavorite, setIsFavorite] = useState<number>(0);
  const navigate = useNavigate();

  // エラー設定の共通処理
  const handleError = (error: any, message: string) => {
    console.error(message, error);
    setErrors(error.message || 'エラーが発生しました');
  };

  // ユーザー認証取得
  const fetchUser = useCallback(async () => {
    try {
      const response = await fetchAuthenticatedUser();
      setUser(response);
    } catch (error: any) {
      if (error.status === 401) {
        navigate('/login');
      }
      handleError(error, '認識ユーザー取得に失敗しました。');
    }
  }, [navigate, setUser]);

  // アイテムの取得
  const fetchItemsData = useCallback(async () => {
    try {
      const response = await getItems();
      setItems(response);
    } catch (error) {
      handleError(error, 'アイテムの取得に失敗しました。');
    }
  }, [setItems]);

  // お気に入りアイテムの取得
  const fetchFavoriteItemData = useCallback(async () => {
    try {
      const response = await fetchFavoriteItems();
      setFavoriteItems(response);
    } catch (error) {
      handleError(error, 'お気に入りアイテムの取得に失敗しました。');
    }
  }, [setFavoriteItems]);

  // 各種データの取得
  const fetchAdditionalData = useCallback(async () => {
    try {
      const { genres, categories, locations } = await fetchAllData();
      setGenres(genres);
      setCategories(categories);
      setLocations(locations);
    } catch (error) {
      handleError(error, '選択データの取得に失敗しました。');
    }
  }, [setGenres, setCategories, setLocations]);

  // データ一括取得
  const fetchItemsWithDetails = useCallback(async () => {
    setLoading(true);
    try {
      await fetchUser();
      await fetchItemsData();
      await fetchFavoriteItemData();
      await fetchAdditionalData();
    } catch (error: any) {
      handleError(error, '選択データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [
    fetchUser,
    fetchItemsData,
    fetchFavoriteItemData,
    fetchAdditionalData,
    setLoading,
  ]);

  // 初期データ取得
  useEffect(() => {
    fetchItemsWithDetails();
  }, [fetchItemsWithDetails]);

  // アイテム削除
  const deleteItemHandler = useCallback(
    async (id: number) => {
      try {
        const response = await deleteItem(id);
        setSuccess(response.message);

        setItems((prevItems: Item[]) => [...response.items]);
        setFavoriteItems((prevFavoriteItems: Item[]) =>
          prevFavoriteItems.filter((item) => item.id !== id)
        );
      } catch (error) {
        handleError(error, 'アイテムの削除に失敗しました。');
      }
    },
    [setItems, setFavoriteItems, setSuccess]
  );

  // お気に入りボタンクリック時の挙動
  const handleFavoriteToggle = useCallback(
    async (id: number, isFavorite: number) => {
      try {
        // お気に入りを反転
        const newIsFavorite = 1 - isFavorite;
        const response = await changeColorFavoriteIcon(id, newIsFavorite);

        if (response.isFavorite !== undefined) {
          setIsFavorite(response.isFavorite);
        }

        setItems((prevItems: Item[]) => [...response.items]);

        // お気に入りリストの更新（1: リスト追加, 0: リスト削除）
        if (response.isFavorite === 1) {
          setFavoriteItems((prevFavoriteItems: Item[]) => [
            ...prevFavoriteItems,
            { ...response.item },
          ]);
        } else {
          setFavoriteItems((prevFavoriteItems: Item[]) =>
            prevFavoriteItems.filter((item) => item.id !== id)
          );
        }
      } catch (error) {
        console.log(error);
      }
    },
    [setIsFavorite, setFavoriteItems]
  );

  if (loading || !user) {
    return <Loader />;
  }

  return (
    <>
      <AlertWithErrors errors={errors} setErrors={setErrors} />
      <AlertWithSuccess success={success} setSuccess={setSuccess} />
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          {/* アイテム一覧 */}
          <Grid item xs={12} md={9}>
            <ItemList
              items={items}
              setItems={setItems}
              deleteItemHandler={deleteItemHandler}
              handleFavoriteToggle={handleFavoriteToggle}
              setErrors={setErrors}
              setSuccess={setSuccess}
            />
          </Grid>

          {/* 買い物リスト */}
          <Grid item xs={12} md={3}>
            <ShoppingList
              favoriteItems={favoriteItems}
              setFavoriteItems={setFavoriteItems}
              deleteItemHandler={deleteItemHandler}
              handleFavoriteToggle={handleFavoriteToggle}
              setErrors={setErrors}
              setSuccess={setSuccess}
            />
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default Home;
