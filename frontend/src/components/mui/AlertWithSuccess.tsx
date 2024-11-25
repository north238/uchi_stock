import React, { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { AlertWithSuccessProps } from 'types';

const AlertWithSuccess: React.FC<AlertWithSuccessProps> = ({
  success,
  setSuccess,
}: AlertWithSuccessProps) => {
  const [open, setOpen] = useState(true);

  // エラーメッセージがあれば開くようにする（状態を監視）
  useEffect(() => {
    if (success) {
      setOpen(true);
    }
  }, [success]);

  if (!open || !success) {
    return null; // エラーがないか、閉じられている場合は何も表示しない
  }

  return (
    <Collapse in={open}>
      <Alert
        severity="success"
        color="success"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setOpen(false);
              setSuccess(null);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ my: 2 }}
      >
        {success}
      </Alert>
    </Collapse>
  );
};

export default AlertWithSuccess;
