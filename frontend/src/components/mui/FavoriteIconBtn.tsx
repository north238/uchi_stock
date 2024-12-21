import React from 'react';
import { red } from './themePrimitives';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { FavoriteBtnProps } from 'types';

const FavoriteIconBtn: React.FC<FavoriteBtnProps> = ({
  item,
  isFavorite,
  handleFavoriteToggle,
}: FavoriteBtnProps) => {
  return (
    <>
      <IconButton
        aria-label="add to favorites"
        onClick={() => handleFavoriteToggle(item.id, isFavorite)}
      >
        {isFavorite ? (
          <FavoriteIcon sx={{ color: red[300] }} />
        ) : (
          <FavoriteIcon color="action" />
        )}
      </IconButton>
    </>
  );
};

export default FavoriteIconBtn;
