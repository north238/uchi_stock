import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material';
import { ItemCardProps } from 'types';
import ItemUpdateModal from './ItemUpdateModal';
import FavoriteIconBtn from './FavoriteIconBtn';

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  setItems,
  isFavorite,
  deleteItem,
  handleFavoriteToggle,
  setErrors,
  setSuccess,
}: ItemCardProps) => {
  const [open, setOpen] = useState(false);

  const handleItemEdit = () => {
    setOpen(true);
  };

  if (!item) {
    setErrors('アイテムが見つかりません。');
    return null;
  }

  return (
    <>
      <Card sx={{ maxWidth: 345, mb: 1 }}>
        <CardContent sx={{ p: 1 }}>
          <CardHeader
            sx={{ p: 1 }}
            action={
              <IconButton aria-label="settings" onClick={handleItemEdit}>
                <MoreVertIcon />
              </IconButton>
            }
            title={
              <Typography gutterBottom variant="h5" component="div">
                {item.name}
              </Typography>
            }
          />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {item.description}
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <FavoriteIconBtn
            item={item}
            isFavorite={isFavorite}
            handleFavoriteToggle={handleFavoriteToggle}
          />
          <IconButton aria-label="share">
            <ShareIcon />
          </IconButton>
          <IconButton aria-label="delete" onClick={() => deleteItem(item.id)}>
            <DeleteOutlineIcon />
          </IconButton>
        </CardActions>
      </Card>
      <ItemUpdateModal
        open={open}
        setOpen={setOpen}
        item={item}
        setItems={setItems}
        setErrors={setErrors}
        setSuccess={setSuccess}
      />
    </>
  );
};

export default ItemCard;
