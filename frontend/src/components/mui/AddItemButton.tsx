import React, { useState } from 'react';
import { Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ItemCreateModal from './ItemCreateModal';
import { AddItemCardProps } from 'types';

const AddItemButton: React.FC<AddItemCardProps> = ({
  setItems,
  setErrors,
  setSuccess,
}: AddItemCardProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);

  return (
    <>
      {/* アイテム追加ボタン */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 50,
          height: 50,
          border: '2px solid #fff',
          backgroundColor: '#0097a7',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          '&:hover': {
            backgroundColor: '#40b1bd',
          },
        }}
        onClick={handleOpen}
      >
        <AddIcon sx={{ fontSize: 45, color: '#fff' }} />
      </Box>
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

export default AddItemButton;
