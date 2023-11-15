import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

interface TransitionAlertProps {
  alertMessage: string;
}

const TransitionAlerts: React.FC<TransitionAlertProps> = (props) => {
  const [open, setOpen] = React.useState(true);

  return (
    <Box sx={{ width: '100%' }} >
      <Collapse in={open}>
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {props.alertMessage}
        </Alert>
      </Collapse>
    </Box>
  );
}

export default TransitionAlerts;