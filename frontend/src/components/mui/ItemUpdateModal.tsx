import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Genre, ItemUpdateModalProps, UpdatedItemRequest, Item } from 'types';
import { useDataContext } from 'contexts/DataContext';
import { EditItem } from 'api/ItemApi';

export default function ItemUpdateModal({
  open,
  setOpen,
  item,
  setItems,
  setErrors,
  setSuccess,
}: ItemUpdateModalProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [genreId, setGenreId] = useState('');
  const { genres } = useDataContext();

  useEffect(() => {
    if (open && item) {
      setName(item.name);
      setQuantity(item.quantity);
      setGenreId(item.genre_id);
      setDescription(item.description || '');
      console.log('ダイアログが開きました');
    }
  }, [open, item]);

  // モーダルを閉じる
  const handleClose = () => {
    setOpen(false);
  };

  // アイテム更新処理
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedItem: UpdatedItemRequest = {
      name,
      quantity,
      genre_id: genreId,
      description,
    };

    try {
      const response = await EditItem(item.id, updatedItem);

      console.log(response);

      // 成功時に状態を更新する
      setItems((prevItems: Item[]) =>
        prevItems.map((prevItem) =>
          prevItem.id === item.id
            ? response.item // APIから返却されたデータに置き換える
            : prevItem
        )
      );
      setSuccess(response.message);
    } catch (error: any) {
      console.log('アイテムの編集に失敗しました。', error);
      setErrors(error.message);
    } finally {
      handleClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit,
        }}
      >
        <DialogTitle>アイテム更新</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>閉じる</Button>
          <Button type="submit">更新する</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
