import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Typography from '@mui/material/Typography';
import { red } from './themePrimitives';
import { deleteItem } from 'api/ItemApi';
import { ItemCardProps } from 'types';

const ItemCard: React.FC<ItemCardProps> = ({ item }: ItemCardProps) => {
  if (!item) {
    console.error('item is undefined');
    return null;
  }

  return (
    <Card sx={{ maxWidth: 345, mb: 2 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {item.name}
        </Typography>
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
  );
};

export default ItemCard;
