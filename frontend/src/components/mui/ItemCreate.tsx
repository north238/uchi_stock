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
import { Genre, ItemCreateProps } from 'types';
import { useDataContext } from 'contexts/DataContext';

const ItemCreate: React.FC<ItemCreateProps> = ({
  setOpen,
  setItems,
  setErrors,
  setSuccess,
}: ItemCreateProps) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [genreId, setGenreId] = useState('');
  const [description, setDescription] = useState('');
  const { genres } = useDataContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      quantity,
      genre_id: genreId,
      description,
    };

    try {
      const response = await createItem(data);

      // 最新のアイテムデータに更新
      setItems((prevItems) => [...response.items]);
      setSuccess(response.message);

      // 入力フィールドをリセット
      setName('');
      setQuantity(1);
      setGenreId('');
      setDescription('');
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
            {genres &&
              genres.map((genre: Genre) => (
                <MenuItem key={genre.genre_id} value={genre.genre_id}>
                  {genre.genre_name}
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
