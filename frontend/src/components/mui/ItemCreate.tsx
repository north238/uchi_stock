import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { createItem } from 'api/ItemApi';
import { Genre, Category, Location, ItemCreateProps, Item } from 'types';
import { useDataContext } from 'contexts/DataContext';

const ItemCreate: React.FC<ItemCreateProps> = ({
  setOpen,
  setItems,
  setErrors,
  setSuccess,
}: ItemCreateProps) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [genreId, setGenreId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const { genres, categories, locations } = useDataContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      quantity,
      description,
      genre_id: genreId,
      category_id: categoryId,
      location_id: locationId,
    };

    try {
      const response = await createItem(data);

      // 登録したアイテムを配列の先頭に表示する
      setItems((prevItems: Item[]) => [response.data, ...prevItems]);
      setSuccess(response.message);

      // 入力フィールドをリセット
      setName('');
      setQuantity(1);
      setDescription('');
      setGenreId('');
      setCategoryId('');
      setLocationId('');
      setErrors(null);
    } catch (error) {
      console.error('登録に失敗しました:', error);
      setErrors('登録に失敗しました。');
    } finally {
      setOpen(false);
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
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
            {genres.map((genre: Genre) => (
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
            {categories.map((category: Category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="location-select-label">保管場所</InputLabel>
          <Select
            labelId="location-select-label"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
          >
            {locations.map((location: Location) => (
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
        >
          登録
        </Button>
      </Box>
    </>
  );
};

export default ItemCreate;
