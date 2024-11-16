import React, { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';

interface AlertWithErrorsProps {
  errors: string | null;
  setErrors: React.Dispatch<React.SetStateAction<string | null>>;
}

const AlertWithErrors: React.FC<AlertWithErrorsProps> = ({
  errors,
  setErrors,
}) => {
  const [open, setOpen] = useState(true);

  // エラーメッセージがあれば開くようにする（状態を監視）
  useEffect(() => {
    if (errors) {
      setOpen(true);
    }
  }, [errors]);

  if (!open || !errors) {
    return null; // エラーがないか、閉じられている場合は何も表示しない
  }

  return (
    <Collapse in={open}>
      <Alert
        severity="error"
        color="error"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setOpen(false);
              setErrors(null);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ my: 2 }}
      >
        {errors}
      </Alert>
    </Collapse>
  );
};

export default AlertWithErrors;
