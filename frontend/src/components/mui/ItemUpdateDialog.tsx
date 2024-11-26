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
import {
  Category,
  Genre,
  Location,
  ItemUpdateDialogProps,
  UpdatedItemRequest,
  Item,
} from 'types';
import { useDataContext } from 'contexts/DataContext';
import { EditItem } from 'api/ItemApi';

export default function ItemUpdateDialog({
  open,
  setOpen,
  item,
  setItems,
  setErrors,
  setSuccess,
}: ItemUpdateDialogProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [genreId, setGenreId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const { genres, categories, locations } = useDataContext();

  useEffect(() => {
    const fetchItemData = async () => {
      if (item) {
        setName(item.name);
        setQuantity(item.quantity);
        setGenreId(item.genre_id);
        setCategoryId(item.category_id);
        setLocationId(item.location_id);
        setDescription(item.description || '');
      }
    };
    fetchItemData();
    console.log('ダイアログ');
  }, [open, item]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedItem: UpdatedItemRequest = {
      name,
      quantity,
      genre_id: genreId,
      category_id: categoryId,
      location_id: locationId,
      description,
    };

    try {
      const response = await EditItem(item.id, updatedItem);

      // 成功時に状態を更新する
      setItems((prevItems: Item[]) =>
        prevItems.map((prevItem) =>
          prevItem.id === item.id
            ? response.data // APIから返却されたデータに置き換える
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>閉じる</Button>
          <Button type="submit">更新する</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
