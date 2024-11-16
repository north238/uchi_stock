import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { api } from 'api/axios';
import Loader from 'components/ui/Loader';
import AlertWithErrors from 'components/mui/AlertWithErrors';

interface Genre {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

const ItemCreate: React.FC = () => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [genreId, setGenreId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  // サーバーからデータを取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [genreRes, categoryRes] = await Promise.all([
          api.get('/genres'), // サーバーのジャンル取得エンドポイント
          api.get('/categories'), // サーバーのカテゴリ取得エンドポイント
        ]);
        setGenres(genreRes.data);
        setCategories(categoryRes.data);
      } catch (error) {
        console.error('データの取得に失敗しました', error);
        setErrors('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name,
      quantity,
      description,
      genre_id: genreId,
      category_id: categoryId,
    };

    try {
      const response = await api.post('/items/create', data); // アイテム登録エンドポイント
      console.log('登録成功:', response.data);
      // 入力フィールドをリセット
      setName('');
      setQuantity(1);
      setDescription('');
      setGenreId('');
      setCategoryId('');
    } catch (error) {
      console.error('登録に失敗しました:', error);
      setErrors('登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <AlertWithErrors errors={errors} setErrors={setErrors} />
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          margin: '20px auto',
          padding: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          アイテム登録
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="アイテム名"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="数量"
            variant="outlined"
            fullWidth
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            margin="normal"
            required
          />
          <TextField
            label="説明"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="genre-select-label">ジャンル</InputLabel>
            <Select
              labelId="genre-select-label"
              value={genreId}
              onChange={(e) => setGenreId(e.target.value)}
              required
            >
              {genres.map((genre) => (
                <MenuItem key={genre.id} value={genre.id}>
                  {genre.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-select-label">カテゴリ</InputLabel>
            <Select
              labelId="category-select-label"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            登録
          </Button>
        </Box>
      </Paper>
    </>
  );
};

export default ItemCreate;
