import React from 'react';
import {
  Card,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Item, ItemListProps } from 'types';
import ItemCard from './mui/ItemCard';
import AddItemCard from './mui/AddItemCard';

const ItemList: React.FC<ItemListProps> = ({
  items,
  setItems,
  deleteItemHandler,
  handleFavoriteToggle,
  setErrors,
  setSuccess,
}: ItemListProps) => {
  return (
    <>
      <Typography variant="h5" component="div">
        <AddItemCard
          setItems={setItems}
          setErrors={setErrors}
          setSuccess={setSuccess}
        />
        {items.map(
          (genre) =>
            genre.items.length > 0 && (
              <Accordion
                key={genre.id}
                sx={{
                  maxWidth: 345,
                  borderColor: genre.color?.hex_code || '#ccc',
                  borderWidth: 2,
                  borderStyle: 'solid',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id={`${genre.id}-header`}
                >
                  <Typography variant="body1" component="span">
                    {genre.name} ({genre.items.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {genre.items.map((item: Item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      setItems={setItems}
                      isFavorite={item.is_favorite ?? 0}
                      deleteItem={deleteItemHandler}
                      handleFavoriteToggle={handleFavoriteToggle}
                      setErrors={setErrors}
                      setSuccess={setSuccess}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            )
        )}
      </Typography>
    </>
  );
};

export default ItemList;
