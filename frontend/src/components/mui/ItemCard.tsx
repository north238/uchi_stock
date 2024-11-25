import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material';
import { red } from './themePrimitives';
import { ItemCardProps } from 'types';
import ItemUpdateDialog from './ItemUpdateDialog';

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  setItems,
  deleteItem,
  setErrors,
  setSuccess,
}: ItemCardProps) => {
  const [open, setOpen] = useState(false);
  const handleItemEdit = () => {
    setOpen(true);
  };

  if (!item) {
    console.error('item is undefined');
    return null;
  }

  return (
    <>
      <Card sx={{ maxWidth: 345, mb: 2 }}>
        <CardContent>
          <CardHeader
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
            Description for {item.description}.
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton aria-label="add to favorites">
            <FavoriteIcon
              sx={{ color: item.is_favorite ? red[300] : undefined }}
            />
          </IconButton>
          <IconButton aria-label="share">
            <ShareIcon />
          </IconButton>
          <IconButton aria-label="delete" onClick={() => deleteItem(item.id)}>
            <DeleteOutlineIcon />
          </IconButton>
        </CardActions>
      </Card>
      <ItemUpdateDialog
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
