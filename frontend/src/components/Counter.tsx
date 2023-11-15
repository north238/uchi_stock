import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { CounterProps } from '../models/props';

const Counter: React.FC<CounterProps> = ({
  newCount,
  onCountChange,
}: CounterProps) => {
  const [count, setCount] = useState(newCount);

  useEffect(() => {
    setCount(newCount);
  }, [newCount]);

  const handleIncrement = () => {
    const updatedCount = (count || 0) + 1;
    setCount(updatedCount);
    if (onCountChange) {
      onCountChange(updatedCount);
    }
  };
  const handleDecrement = () => {
    const updatedCount = (count || 0) - 1;
    setCount(updatedCount >= 0 ? 0 : updatedCount);
    if (onCountChange) {
      onCountChange(updatedCount);
    }
  };

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box sx={{ m: 2 }}>{count}</Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <ButtonGroup
          size="small"
          orientation="vertical"
          aria-label="vertical outlined button group"
        >
          <Button onClick={handleIncrement}>
            <KeyboardArrowUpOutlinedIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup
          size="small"
          orientation="vertical"
          aria-label="vertical contained button group"
        >
          <Button onClick={handleDecrement}>
            <KeyboardArrowDownOutlinedIcon />
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default Counter;
