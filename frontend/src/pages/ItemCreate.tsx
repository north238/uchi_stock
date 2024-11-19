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
import AlertWithSuccess from 'components/mui/AlertWithSuccess';

interface Genre {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

const ItemCreate: React.FC = () => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [genreId, setGenreId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // サーバーからデータを取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [genreRes, categoryRes, locationRes] = await Promise.all([
          api.get('/genres'),
          api.get('/categories'),
          api.get('/locations'),
        ]);
        setGenres(genreRes.data);
        setCategories(categoryRes.data);
        setLocations(locationRes.data);
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
      location_id: locationId,
    };

    try {
      const res = await api.post('/items', data); // アイテム登録エンドポイント
      // 入力フィールドをリセット
      setName('');
      setQuantity(1);
      setDescription('');
      setGenreId('');
      setCategoryId('');
      setLocationId('');
      setErrors(null);
      setSuccess(res.data.message);
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
      <AlertWithSuccess success={success} setSuccess={setSuccess} />
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
          <FormControl fullWidth margin="normal">
            <InputLabel id="genre-select-label">ジャンル名</InputLabel>
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
            <InputLabel id="category-select-label">カテゴリ名</InputLabel>
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
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-select-label">保管場所</InputLabel>
            <Select
              labelId="location-select-label"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              required
            >
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
