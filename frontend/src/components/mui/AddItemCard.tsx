import React, { useState } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ItemCreateModal from './ItemCreateModal';
import { AddItemCardProps } from 'types';

const AddItemCard: React.FC<AddItemCardProps> = ({
  setItems,
  setErrors,
  setSuccess,
}: AddItemCardProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);

  return (
    <>
      {/* アイテム追加ボタン */}
      <Paper
        sx={{
          maxWidth: 345,
          mb: 1,
          border: '2px dashed #ccc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 100,
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
        onClick={handleOpen}
        elevation={1}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 40, color: '#ccc' }} />
          <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
            アイテムを追加
          </Typography>
        </Box>
      </Paper>
      <ItemCreateModal
        open={open}
        setOpen={setOpen}
        setItems={setItems}
        setErrors={setErrors}
        setSuccess={setSuccess}
      />
    </>
  );
};

export default AddItemCard;
