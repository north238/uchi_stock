import React from 'react';
import { Box, Modal } from '@mui/material';
import ItemCreate from 'components/mui/ItemCreate';
import { ItemCreateModalProps } from 'types';

const ItemCreateModal: React.FC<ItemCreateModalProps> = ({
  open,
  setOpen,
  setItems,
  setErrors,
  setSuccess,
}: ItemCreateModalProps) => {
  const handleClose = () => setOpen(false);

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { lg: 600, xs: '90%' },
            maxWidth: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <ItemCreate
            setOpen={setOpen}
            setItems={setItems}
            setErrors={setErrors}
            setSuccess={setSuccess}
          />
        </Box>
      </Modal>
    </>
  );
};

export default ItemCreateModal;
