import React from 'react';
import { red } from './themePrimitives';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { changeColorFavoriteIcon } from 'api/ItemApi';
import { FavoriteBtnProps } from 'types';

const FavoriteIconBtn: React.FC<FavoriteBtnProps> = ({
  item,
  isFavorite,
  setIsFavorite,
}: FavoriteBtnProps) => {
  const handleClick = async () => {
    try {
      const response = await changeColorFavoriteIcon(item.id);
      setIsFavorite(response.isFavorite === 1);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <IconButton aria-label="add to favorites" onClick={handleClick}>
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
